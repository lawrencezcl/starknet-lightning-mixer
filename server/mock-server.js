const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
let transactions = [];
let transactionCounter = 1;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mock API endpoints
app.post('/api/lightning/invoice', (req, res) => {
  const { amount, token, userAddress } = req.body;

  const invoice = {
    invoice: `lnbc${amount * 1000}n1p3khhxpp5x4u4xqf8a7v7w2c7t8s3xq9y8z7a6b5c4d3e2f1g0h9i8j7k6l5m4n3o2p1q0r9s8t7u6v5w4x3y2z1`,
    paymentHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    expiry: Date.now() + 3600000,
    amount
  };

  res.json({ success: true, data: invoice });
});

app.post('/api/mix/deposit', (req, res) => {
  const { userAddress, token, amount, recipient, privacySettings } = req.body;

  const transaction = {
    id: `tx_${transactionCounter++}_${Date.now()}`,
    status: 'pending',
    token,
    amount: amount.toString(),
    fee: (amount * 0.005).toString(),
    from: userAddress,
    to: recipient,
    privacySettings,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    progress: 0
  };

  transactions.push(transaction);

  // Simulate transaction progress
  setTimeout(() => updateTransactionStatus(transaction.id, 'confirmed', 25), 2000);
  setTimeout(() => updateTransactionStatus(transaction.id, 'processing', 50), 5000);
  setTimeout(() => updateTransactionStatus(transaction.id, 'processing', 75), 8000);
  setTimeout(() => updateTransactionStatus(transaction.id, 'completed', 100), 12000);

  res.json({
    success: true,
    data: {
      transactionId: transaction.id,
      lightningInvoice: transaction.lightningInvoice
    }
  });
});

app.get('/api/transactions/:id/status', (req, res) => {
  const { id } = req.params;
  const transaction = transactions.find(tx => tx.id === id);

  if (!transaction) {
    return res.status(404).json({ success: false, error: 'Transaction not found' });
  }

  res.json({
    success: true,
    data: {
      transactionId: transaction.id,
      status: transaction.status,
      progress: transaction.progress,
      steps: [
        { name: 'Deposit', status: transaction.progress > 0 ? 'completed' : 'pending', timestamp: transaction.progress > 0 ? Date.now() : undefined },
        { name: 'Lightning Conversion', status: transaction.progress > 25 ? 'completed' : transaction.progress > 0 ? 'in-progress' : 'pending', timestamp: transaction.progress > 25 ? Date.now() : undefined },
        { name: 'Cashu Mixing', status: transaction.progress > 50 ? 'completed' : transaction.progress > 25 ? 'in-progress' : 'pending', timestamp: transaction.progress > 50 ? Date.now() : undefined },
        { name: 'Withdrawal', status: transaction.progress > 75 ? 'completed' : transaction.progress > 50 ? 'in-progress' : 'pending', timestamp: transaction.progress > 75 ? Date.now() : undefined }
      ],
      estimatedCompletion: transaction.status === 'completed' ? Date.now() : Date.now() + (12000 - (transaction.progress * 120))
    }
  });
});

app.get('/api/transactions/history', (req, res) => {
  const { userAddress, limit = 50, offset = 0 } = req.query;

  const userTransactions = transactions
    .filter(tx => tx.from === userAddress)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.json({
    success: true,
    data: {
      transactions: userTransactions,
      totalCount: userTransactions.length,
      hasMore: userTransactions.length === parseInt(limit)
    }
  });
});

app.post('/api/mix/cancel/:id', (req, res) => {
  const { id } = req.params;
  const transaction = transactions.find(tx => tx.id === id);

  if (!transaction) {
    return res.status(404).json({ success: false, error: 'Transaction not found' });
  }

  if (transaction.status === 'completed') {
    return res.status(400).json({ success: false, error: 'Cannot cancel completed transaction' });
  }

  transaction.status = 'failed';
  transaction.error = 'Cancelled by user';
  transaction.updatedAt = Date.now();

  res.json({ success: true });
});

// Mock Atomiq swap service
app.post('/api/atomiq/quote', (req, res) => {
  const { fromToken, toToken, amount } = req.body;

  const quote = {
    fromToken,
    toToken,
    fromAmount: amount,
    toAmount: amount * 0.99, // Mock 1% fee
    fee: amount * 0.01,
    slippageTolerance: 0.5,
    validUntil: Date.now() + 30000, // 30 seconds
    route: ['direct']
  };

  res.json({ success: true, data: quote });
});

app.post('/api/atomiq/swap', (req, res) => {
  const { fromToken, toToken, amount, recipient } = req.body;

  const swapResult = {
    success: true,
    fromToken,
    toToken,
    fromAmount: amount,
    toAmount: amount * 0.99,
    fee: amount * 0.01,
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    status: 'completed',
    timestamp: Date.now()
  };

  res.json({ success: true, data: swapResult });
});

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server });
const clients = new Map();

wss.on('connection', (ws, request) => {
  console.log('WebSocket client connected');

  const clientId = Math.random().toString(36).substr(2, 9);
  clients.set(clientId, ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'subscribe' && data.transactionId) {
        console.log(`Client ${clientId} subscribed to transaction ${data.transactionId}`);

        // Store subscription
        ws.transactionId = data.transactionId;
      } else if (data.type === 'unsubscribe') {
        console.log(`Client ${clientId} unsubscribed`);
        delete ws.transactionId;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log(`WebSocket client ${clientId} disconnected`);
    clients.delete(clientId);
  });
});

// Function to update transaction status and notify clients
function updateTransactionStatus(transactionId, status, progress) {
  const transaction = transactions.find(tx => tx.id === transactionId);

  if (transaction) {
    transaction.status = status;
    transaction.progress = progress;
    transaction.updatedAt = Date.now();

    if (status === 'completed') {
      transaction.completedAt = Date.now();
    }

    // Notify subscribed clients
    clients.forEach((client, clientId) => {
      if (client.transactionId === transactionId && client.readyState === 1) {
        client.send(JSON.stringify({
          type: 'transactionUpdate',
          transactionId,
          status,
          progress,
          timestamp: Date.now()
        }));

        if (status === 'completed') {
          client.send(JSON.stringify({
            type: 'transactionCompleted',
            transactionId,
            status: 'completed',
            result: {
              amount: transaction.amount,
              recipient: transaction.to,
              transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
            }
          }));
        }
      }
    });
  }
}

// Start server
const PORT = process.env.PORT || 3002;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mock Starknet Lightning Mixer Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 WebSocket server running on ws://0.0.0.0:${PORT}`);
  console.log(`🌐 Accessible at http://38.14.254.46:${PORT}`);
});