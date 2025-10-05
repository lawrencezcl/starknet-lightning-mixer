"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("../index");
const router = express_1.default.Router();
router.post('/invoice', async (req, res) => {
    try {
        const { amount, memo, expiry, private: isPrivate } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Amount must be greater than 0',
            });
        }
        console.log(`Creating Lightning invoice for ${amount} sats`);
        const invoice = await index_1.lightningService.createInvoice({
            amount,
            memo: memo || 'Starknet Lightning Mixer',
            expiry: expiry || 3600,
            private: isPrivate || false,
        });
        res.json({
            success: true,
            data: invoice,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error creating Lightning invoice:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create Lightning invoice',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.post('/pay', async (req, res) => {
    try {
        const { invoice, maxFee, timeout } = req.body;
        if (!invoice) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invoice is required',
            });
        }
        console.log(`Paying Lightning invoice: ${invoice.substring(0, 20)}...`);
        const payment = await index_1.lightningService.payInvoice({
            invoice,
            maxFee: maxFee || 1000,
            timeout: timeout || 60,
        });
        res.json({
            success: true,
            data: payment,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error paying Lightning invoice:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to pay Lightning invoice',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/invoice/:paymentHash', async (req, res) => {
    try {
        const { paymentHash } = req.params;
        if (!paymentHash) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Payment hash is required',
            });
        }
        console.log(`Looking up invoice: ${paymentHash}`);
        const invoice = await index_1.lightningService.lookupInvoice(paymentHash);
        if (!invoice) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Invoice not found',
                paymentHash,
            });
        }
        res.json({
            success: true,
            data: invoice,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error looking up invoice:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to lookup invoice',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/balance', async (req, res) => {
    try {
        console.log('Getting Lightning channel balance');
        const balance = await index_1.lightningService.getChannelBalance();
        res.json({
            success: true,
            data: balance,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error getting channel balance:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get channel balance',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/wallet', async (req, res) => {
    try {
        console.log('Getting Lightning wallet balance');
        const balance = await index_1.lightningService.getWalletBalance();
        res.json({
            success: true,
            data: balance,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error getting wallet balance:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get wallet balance',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/transactions', async (req, res) => {
    try {
        console.log('Listing Lightning transactions');
        const transactions = await index_1.lightningService.listTransactions();
        res.json({
            success: true,
            data: transactions,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error listing transactions:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to list transactions',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/node', async (req, res) => {
    try {
        console.log('Getting Lightning node information');
        const nodeInfo = await index_1.lightningService.getNodeInfo();
        res.json({
            success: true,
            data: nodeInfo,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error getting node info:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get node information',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.post('/connect', async (req, res) => {
    try {
        const { pubKey, host, port } = req.body;
        if (!pubKey || !host || !port) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'pubKey, host, and port are required',
            });
        }
        console.log(`Connecting to Lightning peer: ${pubKey}@${host}:${port}`);
        await index_1.lightningService.connectPeer(pubKey, host, parseInt(port, 10));
        res.json({
            success: true,
            message: 'Successfully connected to peer',
            peer: `${pubKey}@${host}:${port}`,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error connecting to peer:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to connect to peer',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.post('/channel/open', async (req, res) => {
    try {
        const { pubKey, localFundingAmount, pushSat, private: isPrivate } = req.body;
        if (!pubKey || !localFundingAmount) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'pubKey and localFundingAmount are required',
            });
        }
        console.log(`Opening Lightning channel with ${pubKey} for ${localFundingAmount} sats`);
        await index_1.lightningService.openChannel(pubKey, parseInt(localFundingAmount, 10), pushSat ? parseInt(pushSat, 10) : undefined, isPrivate || false);
        res.json({
            success: true,
            message: 'Channel opening initiated',
            peer: pubKey,
            amount: localFundingAmount,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error opening channel:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to open channel',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.post('/channel/close', async (req, res) => {
    try {
        const { fundingTxid, outputIndex, force: isForce } = req.body;
        if (!fundingTxid || outputIndex === undefined) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'fundingTxid and outputIndex are required',
            });
        }
        console.log(`Closing Lightning channel ${fundingTxid}:${outputIndex} (force: ${isForce || false})`);
        await index_1.lightningService.closeChannel(fundingTxid, parseInt(outputIndex, 10), isForce || false);
        res.json({
            success: true,
            message: 'Channel closing initiated',
            channel: `${fundingTxid}:${outputIndex}`,
            force: isForce || false,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error closing channel:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to close channel',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/health', async (req, res) => {
    try {
        const isHealthy = await index_1.lightningService.checkConnectivity();
        res.json({
            success: true,
            data: {
                status: isHealthy ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error('Error checking Lightning health:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to check Lightning service health',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
exports.default = router;
//# sourceMappingURL=lightning.js.map