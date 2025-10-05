"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Database_1 = require("../models/Database");
const router = express_1.default.Router();
router.get('/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        if (!transactionId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Transaction ID is required',
            });
        }
        const db = (0, Database_1.getDatabase)();
        const transaction = await db.getTransaction(transactionId);
        if (!transaction) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Transaction not found',
                transactionId,
            });
        }
        const steps = await db.getMixingSteps(transactionId);
        const response = {
            transaction: {
                id: transaction.id,
                depositor: transaction.depositor,
                recipient: transaction.recipient,
                tokenAddress: transaction.tokenAddress,
                tokenSymbol: transaction.tokenSymbol,
                amount: transaction.amount,
                fee: transaction.fee,
                lightningInvoice: transaction.lightningInvoice,
                status: transaction.status,
                privacySettings: transaction.privacySettings,
                createdAt: transaction.createdAt,
                updatedAt: transaction.updatedAt,
                completedAt: transaction.completedAt,
                transactionHash: transaction.transactionHash,
                error: transaction.error,
                progress: transaction.progress,
            },
            steps: steps.map(step => ({
                id: step.id,
                name: step.step_name,
                description: step.step_description,
                status: step.status,
                progress: step.progress,
                startedAt: step.started_at,
                completedAt: step.completed_at,
                error: step.error,
            })),
        };
        res.json({
            success: true,
            data: response,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error getting transaction:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get transaction',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/:transactionId/steps', async (req, res) => {
    try {
        const { transactionId } = req.params;
        if (!transactionId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Transaction ID is required',
            });
        }
        const db = (0, Database_1.getDatabase)();
        const transaction = await db.getTransaction(transactionId);
        if (!transaction) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Transaction not found',
                transactionId,
            });
        }
        const steps = await db.getMixingSteps(transactionId);
        const response = steps.map(step => ({
            id: step.id,
            name: step.step_name,
            description: step.step_description,
            status: step.status,
            progress: step.progress,
            startedAt: step.started_at,
            completedAt: step.completed_at,
            error: step.error,
        }));
        res.json({
            success: true,
            data: response,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error getting transaction steps:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get transaction steps',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.post('/:transactionId/retry', async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { stepName } = req.body;
        if (!transactionId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Transaction ID is required',
            });
        }
        const db = (0, Database_1.getDatabase)();
        const transaction = await db.getTransaction(transactionId);
        if (!transaction) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Transaction not found',
                transactionId,
            });
        }
        if (transaction.status !== 'failed') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Only failed transactions can be retried',
                currentStatus: transaction.status,
            });
        }
        await db.updateTransaction(transactionId, {
            status: 'processing',
            error: null,
            updatedAt: Date.now(),
        });
        if (stepName) {
            await db.updateMixingStep(transactionId, stepName, {
                status: 'pending',
                progress: 0,
                startedAt: null,
                completedAt: null,
                error: null,
            });
        }
        console.log(`Retrying transaction: ${transactionId}${stepName ? ` (step: ${stepName})` : ''}`);
        res.json({
            success: true,
            message: 'Transaction retry initiated',
            transactionId,
            stepName: stepName || 'all',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error retrying transaction:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retry transaction',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/stats', async (req, res) => {
    try {
        const { period = '24h' } = req.query;
        const db = (0, Database_1.getDatabase)();
        const now = Date.now();
        let startTime;
        switch (period) {
            case '1h':
                startTime = now - 60 * 60 * 1000;
                break;
            case '24h':
                startTime = now - 24 * 60 * 60 * 1000;
                break;
            case '7d':
                startTime = now - 7 * 24 * 60 * 60 * 1000;
                break;
            case '30d':
                startTime = now - 30 * 24 * 60 * 60 * 1000;
                break;
            default:
                startTime = now - 24 * 60 * 60 * 1000;
        }
        const stats = {
            period,
            startTime,
            endTime: now,
            totalTransactions: 0,
            completedTransactions: 0,
            failedTransactions: 0,
            pendingTransactions: 0,
            totalVolume: 0,
            averageProcessingTime: 0,
            successRate: 0,
            privacyLevelBreakdown: {
                low: 0,
                medium: 0,
                high: 0,
            },
            tokenBreakdown: {
                STRK: 0,
                ETH: 0,
                USDC: 0,
                other: 0,
            },
        };
        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error getting transaction stats:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get transaction statistics',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.delete('/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        if (!transactionId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Transaction ID is required',
            });
        }
        const db = (0, Database_1.getDatabase)();
        const transaction = await db.getTransaction(transactionId);
        if (!transaction) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Transaction not found',
                transactionId,
            });
        }
        if (transaction.status !== 'failed') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Only failed transactions can be deleted',
                currentStatus: transaction.status,
            });
        }
        await db.updateTransaction(transactionId, {
            status: 'deleted',
            updatedAt: Date.now(),
        });
        console.log(`Deleted transaction: ${transactionId}`);
        res.json({
            success: true,
            message: 'Transaction deleted successfully',
            transactionId,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to delete transaction',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/search', async (req, res) => {
    try {
        const { query, status, tokenSymbol, privacyLevel, startDate, endDate, limit = '50', offset = '0', } = req.query;
        const db = (0, Database_1.getDatabase)();
        const results = {
            transactions: [],
            totalCount: 0,
            hasMore: false,
        };
        res.json({
            success: true,
            data: results,
            searchParams: {
                query,
                status,
                tokenSymbol,
                privacyLevel,
                startDate,
                endDate,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error searching transactions:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to search transactions',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
exports.default = router;
//# sourceMappingURL=transactions.js.map