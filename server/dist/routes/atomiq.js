"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("../index");
const router = express_1.default.Router();
router.post('/quote', async (req, res) => {
    try {
        const { fromToken, toToken, amount, slippageTolerance } = req.body;
        if (!fromToken || !toToken || !amount || amount <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'fromToken, toToken, and amount (greater than 0) are required',
            });
        }
        if (!index_1.atomiqService.isTokenPairSupported(fromToken, toToken)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: `Unsupported token pair: ${fromToken}/${toToken}`,
            });
        }
        console.log(`Getting quote: ${amount} ${fromToken} -> ${toToken}`);
        const quote = await index_1.atomiqService.getQuote({
            fromToken,
            toToken,
            amount,
            slippageTolerance,
        });
        res.json({
            success: true,
            data: quote,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error getting swap quote:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get swap quote',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.post('/swap', async (req, res) => {
    try {
        const swapRequest = req.body;
        const { fromToken, toToken, amount, recipient, lightningInvoice, slippageTolerance, deadline } = swapRequest;
        if (!fromToken || !toToken || !amount || amount <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'fromToken, toToken, and amount (greater than 0) are required',
            });
        }
        if (!index_1.atomiqService.isTokenPairSupported(fromToken, toToken)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: `Unsupported token pair: ${fromToken}/${toToken}`,
            });
        }
        console.log(`Executing swap: ${amount} ${fromToken} -> ${toToken}`);
        const swapExecution = await index_1.atomiqService.executeSwap(swapRequest);
        res.status(201).json({
            success: true,
            data: swapExecution,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error executing swap:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to execute swap',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/swap/:swapId', async (req, res) => {
    try {
        const { swapId } = req.params;
        if (!swapId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Swap ID is required',
            });
        }
        console.log(`Getting status for swap: ${swapId}`);
        const swapStatus = await index_1.atomiqService.getSwapStatus(swapId);
        if (!swapStatus) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Swap not found',
                swapId,
            });
        }
        res.json({
            success: true,
            data: swapStatus,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error getting swap status:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get swap status',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/tokens', async (req, res) => {
    try {
        console.log('Getting supported tokens');
        const tokens = await index_1.atomiqService.getSupportedTokens();
        res.json({
            success: true,
            data: tokens,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error getting supported tokens:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get supported tokens',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/tokens/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        if (!symbol) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Token symbol is required',
            });
        }
        console.log(`Getting token information for: ${symbol}`);
        const token = index_1.atomiqService.getToken(symbol.toUpperCase());
        if (!token) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Token not found',
                symbol: symbol.toUpperCase(),
            });
        }
        res.json({
            success: true,
            data: token,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error getting token information:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get token information',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/route', async (req, res) => {
    try {
        const { fromToken, toToken, amount } = req.query;
        if (!fromToken || !toToken || !amount) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'fromToken, toToken, and amount query parameters are required',
            });
        }
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Amount must be a valid number greater than 0',
            });
        }
        if (!index_1.atomiqService.isTokenPairSupported(fromToken, toToken)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: `Unsupported token pair: ${fromToken}/${toToken}`,
            });
        }
        console.log(`Getting best route: ${amountNum} ${fromToken} -> ${toToken}`);
        const route = await index_1.atomiqService.getBestRoute(fromToken, toToken, amountNum);
        res.json({
            success: true,
            data: route,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error getting best route:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get best route',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/history', async (req, res) => {
    try {
        const { userAddress, limit = '50', offset = '0', } = req.query;
        if (!userAddress) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'userAddress query parameter is required',
            });
        }
        console.log(`Getting swap history for user: ${userAddress}`);
        const history = await index_1.atomiqService.getSwapHistory(userAddress, parseInt(limit, 10), parseInt(offset, 10));
        res.json({
            success: true,
            data: history,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error getting swap history:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get swap history',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/health', async (req, res) => {
    try {
        const isHealthy = await index_1.atomiqService.checkAvailability();
        res.json({
            success: true,
            data: {
                status: isHealthy ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error('Error checking Atomiq health:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to check Atomiq service health',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/price/:fromToken/:toToken', async (req, res) => {
    try {
        const { fromToken, toToken } = req.params;
        if (!fromToken || !toToken) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Both fromToken and toToken are required',
            });
        }
        if (!index_1.atomiqService.isTokenPairSupported(fromToken, toToken)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: `Unsupported token pair: ${fromToken}/${toToken}`,
            });
        }
        console.log(`Getting price: ${fromToken}/${toToken}`);
        const quote = await index_1.atomiqService.getQuote({
            fromToken,
            toToken,
            amount: 1,
        });
        res.json({
            success: true,
            data: {
                fromToken,
                toToken,
                price: quote.price,
                priceImpact: quote.priceImpact,
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error('Error getting price:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get price information',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
exports.default = router;
//# sourceMappingURL=atomiq.js.map