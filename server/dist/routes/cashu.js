"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("../index");
const router = express_1.default.Router();
router.post('/mint', async (req, res) => {
    try {
        const { amount, unit = 'sat' } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Amount must be greater than 0',
            });
        }
        console.log(`Minting ${amount} ${unit} Cashu tokens`);
        const mintResponse = await index_1.cashuService.mintTokens({
            amount,
            unit,
        });
        res.json({
            success: true,
            data: mintResponse,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error minting Cashu tokens:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to mint Cashu tokens',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.post('/redeem', async (req, res) => {
    try {
        const { proofs, outputs } = req.body;
        if (!proofs || !Array.isArray(proofs) || proofs.length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Proofs array is required and cannot be empty',
            });
        }
        console.log(`Redeeming ${proofs.length} Cashu proofs`);
        const redeemResponse = await index_1.cashuService.redeemTokens({
            proofs,
            outputs,
        });
        res.json({
            success: true,
            data: redeemResponse,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error redeeming Cashu tokens:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to redeem Cashu tokens',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.post('/split', async (req, res) => {
    try {
        const { proofs, outputs } = req.body;
        if (!proofs || !Array.isArray(proofs) || proofs.length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Proofs array is required and cannot be empty',
            });
        }
        if (!outputs || !Array.isArray(outputs) || outputs.length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Outputs array is required and cannot be empty',
            });
        }
        console.log(`Splitting ${proofs.length} Cashu proofs into ${outputs.length} outputs`);
        const splitResponse = await index_1.cashuService.splitProofs({
            proofs,
            outputs,
        });
        res.json({
            success: true,
            data: splitResponse,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error splitting Cashu proofs:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to split Cashu proofs',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.post('/verify', async (req, res) => {
    try {
        const { proofs } = req.body;
        if (!proofs || !Array.isArray(proofs) || proofs.length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Proofs array is required and cannot be empty',
            });
        }
        console.log(`Verifying ${proofs.length} Cashu proofs`);
        const verifyResponse = await index_1.cashuService.verifyProofs({ proofs });
        res.json({
            success: true,
            data: verifyResponse,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error verifying Cashu proofs:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to verify Cashu proofs',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/mint/info', async (req, res) => {
    try {
        console.log('Getting Cashu mint information');
        const mintInfo = await index_1.cashuService.getMintInfo();
        res.json({
            success: true,
            data: mintInfo,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error getting mint info:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get mint information',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/keys', async (req, res) => {
    try {
        console.log('Getting Cashu mint keys');
        const mintInfo = await index_1.cashuService.getMintInfo();
        res.json({
            success: true,
            data: {
                unit: mintInfo.unit,
                nuts: mintInfo.nuts,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error getting Cashu keys:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get Cashu keys',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.post('/refresh', async (req, res) => {
    try {
        console.log('Refreshing Cashu keys');
        await index_1.cashuService.refreshKeys();
        res.json({
            success: true,
            message: 'Cashu keys refreshed successfully',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error refreshing Cashu keys:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to refresh Cashu keys',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/health', async (req, res) => {
    try {
        const isHealthy = await index_1.cashuService.checkAvailability();
        res.json({
            success: true,
            data: {
                status: isHealthy ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error('Error checking Cashu health:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to check Cashu service health',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
exports.default = router;
//# sourceMappingURL=cashu.js.map