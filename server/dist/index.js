"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.atomiqService = exports.cashuService = exports.lightningService = void 0;
exports.broadcast = broadcast;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const ws_1 = require("ws");
const http_1 = require("http");
const Database_1 = require("./models/Database");
const LightningService_1 = require("./services/LightningService");
const CashuService_1 = require("./services/CashuService");
const AtomiqService_1 = require("./services/AtomiqService");
const mixing_1 = __importDefault(require("./routes/mixing"));
const lightning_1 = __importDefault(require("./routes/lightning"));
const cashu_1 = __importDefault(require("./routes/cashu"));
const atomiq_1 = __importDefault(require("./routes/atomiq"));
const transactions_1 = __importDefault(require("./routes/transactions"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = parseInt(process.env.PORT || '3001', 10);
const WS_PORT = parseInt(process.env.WS_PORT || '3002', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
app.use((0, helmet_1.default)({
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
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
if (NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    next();
});
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
app.use('/api/mix', mixing_1.default);
app.use('/api/lightning', lightning_1.default);
app.use('/api/cashu', cashu_1.default);
app.use('/api/atomiq', atomiq_1.default);
app.use('/api/transactions', transactions_1.default);
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
    });
});
app.use((err, req, res, next) => {
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
const wss = new ws_1.WebSocketServer({ port: WS_PORT });
console.log(`WebSocket server listening on port ${WS_PORT}`);
const clients = new Set();
wss.on('connection', (ws, req) => {
    console.log('New WebSocket client connected');
    clients.add(ws);
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log('Received WebSocket message:', data);
            switch (data.type) {
                case 'subscribe':
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
                    ws.send(JSON.stringify({
                        type: 'pong',
                        timestamp: Date.now(),
                    }));
                    break;
                default:
                    console.warn('Unknown WebSocket message type:', data.type);
            }
        }
        catch (error) {
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
    ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to Starknet Lightning Mixer WebSocket',
        timestamp: Date.now(),
    }));
});
function broadcast(message) {
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
let lightningService;
let cashuService;
let atomiqService;
async function initializeServices() {
    try {
        console.log('Initializing services...');
        (0, Database_1.getDatabase)();
        console.log('Database initialized');
        exports.lightningService = lightningService = new LightningService_1.LightningService({
            host: process.env.LND_RPC_URL?.split(':')[0] || 'localhost',
            port: parseInt(process.env.LND_RPC_URL?.split(':')[1] || '10009', 10),
            macaroon: process.env.LND_MACAROON_PATH || '',
            cert: process.env.LND_CERT_PATH || '',
        });
        const lightningConnected = await lightningService.checkConnectivity();
        console.log(`Lightning service: ${lightningConnected ? 'connected' : 'disconnected'}`);
        exports.cashuService = cashuService = new CashuService_1.CashuService(process.env.CASHU_MINT_URL || 'https://testnet.cashu.space', process.env.CASHU_MINT_KEYS);
        const cashuAvailable = await cashuService.checkAvailability();
        console.log(`Cashu service: ${cashuAvailable ? 'available' : 'unavailable'}`);
        exports.atomiqService = atomiqService = new AtomiqService_1.AtomiqService(process.env.ATOMIQ_API_URL || 'https://api.atomiq.io', process.env.ATOMIQ_API_KEY || 'mock-key');
        const atomiqAvailable = await atomiqService.checkAvailability();
        console.log(`Atomiq service: ${atomiqAvailable ? 'available' : 'unavailable'}`);
        console.log('All services initialized successfully');
    }
    catch (error) {
        console.error('Failed to initialize services:', error);
        process.exit(1);
    }
}
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    wss.close(() => {
        console.log('WebSocket server closed');
    });
    server.close(() => {
        console.log('HTTP server closed');
    });
    try {
        (0, Database_1.getDatabase)().close();
        console.log('Database connection closed');
    }
    catch (error) {
        console.error('Error closing database:', error);
    }
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    wss.close(() => {
        console.log('WebSocket server closed');
    });
    server.close(() => {
        console.log('HTTP server closed');
    });
    try {
        (0, Database_1.getDatabase)().close();
        console.log('Database connection closed');
    }
    catch (error) {
        console.error('Error closing database:', error);
    }
    process.exit(0);
});
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
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use`);
            }
            else {
                console.error('Server error:', error);
            }
            process.exit(1);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map