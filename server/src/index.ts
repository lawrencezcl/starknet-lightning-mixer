import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

import { getDatabase } from './models/Database';
import { LightningService } from './services/LightningService';
import { CashuService } from './services/CashuService';
import { AtomiqService } from './services/AtomiqService';

// Import routes
import mixingRoutes from './routes/mixing';
import lightningRoutes from './routes/lightning';
import cashuRoutes from './routes/cashu';
import atomiqRoutes from './routes/atomiq';
import transactionRoutes from './routes/transactions';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Configuration
const PORT = parseInt(process.env.PORT || '3001', 10);
const WS_PORT = parseInt(process.env.WS_PORT || '3002', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: NODE_ENV,
    services: {
      database: 'connected',
      lightning: 'connected',
      cashu: 'connected',
      atomiq: 'connected',
    },
  });
});

// API routes
app.use('/api/mix', mixingRoutes);
app.use('/api/lightning', lightningRoutes);
app.use('/api/cashu', cashuRoutes);
app.use('/api/atomiq', atomiqRoutes);
app.use('/api/transactions', transactionRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'Something went wrong';

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal Server Error' : 'Bad Request',
    message,
    timestamp: new Date().toISOString(),
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// WebSocket Server for real-time updates
const wss = new WebSocketServer({ port: WS_PORT });

console.log(`WebSocket server listening on port ${WS_PORT}`);

// Store connected clients
const clients = new Set<WebSocket>();

wss.on('connection', (ws, req) => {
  console.log('New WebSocket client connected');
  clients.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      console.log('Received WebSocket message:', data);

      // Handle different message types
      switch (data.type) {
        case 'subscribe':
          // Subscribe to transaction updates
          if (data.transactionId) {
            console.log(`Client subscribed to transaction: ${data.transactionId}`);
            ws.send(JSON.stringify({
              type: 'subscribed',
              transactionId: data.transactionId,
              timestamp: Date.now(),
            }));
          }
          break;

        case 'unsubscribe':
          // Unsubscribe from transaction updates
          if (data.transactionId) {
            console.log(`Client unsubscribed from transaction: ${data.transactionId}`);
            ws.send(JSON.stringify({
              type: 'unsubscribed',
              transactionId: data.transactionId,
              timestamp: Date.now(),
            }));
          }
          break;

        case 'ping':
          // Keep-alive ping
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: Date.now(),
          }));
          break;

        default:
          console.warn('Unknown WebSocket message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
        timestamp: Date.now(),
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to Starknet Lightning Mixer WebSocket',
    timestamp: Date.now(),
  }));
});

// Broadcast function for sending updates to all connected clients
export function broadcast(message: any) {
  const data = JSON.stringify({
    ...message,
    timestamp: Date.now(),
  });

  clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}

// Initialize services
let lightningService: LightningService;
let cashuService: CashuService;
let atomiqService: AtomiqService;

async function initializeServices() {
  try {
    console.log('Initializing services...');

    // Initialize database
    getDatabase();
    console.log('Database initialized');

    // Initialize Lightning service
    lightningService = new LightningService({
      host: process.env.LND_RPC_URL?.split(':')[0] || 'localhost',
      port: parseInt(process.env.LND_RPC_URL?.split(':')[1] || '10009', 10),
      macaroon: process.env.LND_MACAROON_PATH || '',
      cert: process.env.LND_CERT_PATH || '',
    });

    // Check Lightning connectivity
    const lightningConnected = await lightningService.checkConnectivity();
    console.log(`Lightning service: ${lightningConnected ? 'connected' : 'disconnected'}`);

    // Initialize Cashu service
    cashuService = new CashuService(
      process.env.CASHU_MINT_URL || 'https://testnet.cashu.space',
      process.env.CASHU_MINT_KEYS
    );

    // Check Cashu availability
    const cashuAvailable = await cashuService.checkAvailability();
    console.log(`Cashu service: ${cashuAvailable ? 'available' : 'unavailable'}`);

    // Initialize Atomiq service
    atomiqService = new AtomiqService(
      process.env.ATOMIQ_API_URL || 'https://api.atomiq.io',
      process.env.ATOMIQ_API_KEY || 'mock-key'
    );

    // Check Atomiq availability
    const atomiqAvailable = await atomiqService.checkAvailability();
    console.log(`Atomiq service: ${atomiqAvailable ? 'available' : 'unavailable'}`);

    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');

  // Close WebSocket server
  wss.close(() => {
    console.log('WebSocket server closed');
  });

  // Close HTTP server
  server.close(() => {
    console.log('HTTP server closed');
  });

  // Close database connection
  try {
    getDatabase().close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }

  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');

  // Close WebSocket server
  wss.close(() => {
    console.log('WebSocket server closed');
  });

  // Close HTTP server
  server.close(() => {
    console.log('HTTP server closed');
  });

  // Close database connection
  try {
    getDatabase().close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }

  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await initializeServices();

    server.listen(PORT, () => {
      console.log(`🚀 Starknet Lightning Mixer API Server running on port ${PORT}`);
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}`);
      console.log(`🌐 WebSocket Server: ws://localhost:${WS_PORT}`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Export services for use in routes
export { lightningService, cashuService, atomiqService };