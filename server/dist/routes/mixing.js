"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Database_1 = require("../models/Database");
const index_1 = require("../index");
const helpers_1 = require("../utils/helpers");
const index_2 = require("../index");
const router = express_1.default.Router();
router.post('/deposit', async (req, res) => {
    try {
        const { userAddress, token, amount, recipient, privacySettings, } = req.body;
        if (!userAddress || !token || !amount || !recipient || !privacySettings) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Missing required fields',
                requiredFields: ['userAddress', 'token', 'amount', 'recipient', 'privacySettings'],
            });
        }
        if (amount <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Amount must be greater than 0',
            });
        }
        if (!privacySettings.privacyLevel || !['low', 'medium', 'high'].includes(privacySettings.privacyLevel)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid privacy level. Must be: low, medium, or high',
            });
        }
        const db = (0, Database_1.getDatabase)();
        await db.createOrUpdateUser(userAddress);
        const feeRate = getFeeRate(privacySettings.privacyLevel);
        const feeAmount = Math.floor(amount * feeRate);
        const netAmount = amount - feeAmount;
        console.log(`Initiating mixing: ${amount} ${token} -> ${recipient} (fee: ${feeAmount} ${token})`);
        let lightningInvoice;
        try {
            const invoiceResponse = await index_1.lightningService.createInvoice({
                amount: Math.floor(netAmount * 1000),
                memo: `Privacy mix for ${userAddress}`,
                expiry: 3600,
                private: true,
            });
            lightningInvoice = invoiceResponse.paymentRequest;
        }
        catch (error) {
            console.error('Failed to create Lightning invoice:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to create Lightning invoice',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
        const transaction = await db.createTransaction({
            depositor: userAddress,
            recipient,
            tokenAddress: getTokenAddress(token),
            tokenSymbol: token,
            amount: netAmount.toString(),
            fee: feeAmount.toString(),
            lightningInvoice,
            status: 'pending',
            privacySettings,
        });
        await db.createMixingStep(transaction.id, 'deposit', 'Processing deposit on Starknet');
        await db.createMixingStep(transaction.id, 'swap', 'Swapping to Bitcoin');
        await db.createMixingStep(transaction.id, 'lightning', 'Creating Lightning payment');
        await db.createMixingStep(transaction.id, 'cashu', 'Minting Cashu tokens');
        await db.createMixingStep(transaction.id, 'mixing', 'Applying privacy transformations');
        await db.createMixingStep(transaction.id, 'redeem', 'Redeeming and swapping back');
        await db.createMixingStep(transaction.id, 'withdrawal', 'Sending to recipient');
        const estimatedCompletion = calculateEstimatedCompletion(privacySettings);
        startMixingProcess(transaction.id);
        const response = {
            transactionId: transaction.id,
            lightningInvoice,
            estimatedCompletion,
            fee: feeAmount,
        };
        console.log(`Mixing transaction created: ${transaction.id}`);
        (0, index_2.broadcast)({
            type: 'transactionCreated',
            transactionId: transaction.id,
            status: 'pending',
            userAddress,
        });
        res.status(201).json({
            success: true,
            data: response,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error in /deposit:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to initiate mixing transaction',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/status/:transactionId', async (req, res) => {
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
            transactionId: transaction.id,
            status: transaction.status,
            progress: transaction.progress || 0,
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
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
            completedAt: transaction.completedAt,
            transactionHash: transaction.transactionHash,
            error: transaction.error,
            estimatedCompletion: calculateEstimatedCompletion(transaction.privacySettings),
        };
        res.json({
            success: true,
            data: response,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error in /status:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get transaction status',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.get('/history', async (req, res) => {
    try {
        const { userAddress, limit = '50', offset = '0', status, } = req.query;
        if (!userAddress) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'User address is required',
            });
        }
        const db = (0, Database_1.getDatabase)();
        const { transactions, totalCount } = await db.getUserTransactions(userAddress, parseInt(limit, 10), parseInt(offset, 10), status);
        const response = {
            transactions: transactions.map(tx => ({
                id: tx.id,
                tokenSymbol: tx.tokenSymbol,
                amount: tx.amount,
                fee: tx.fee,
                status: tx.status,
                privacyLevel: tx.privacySettings.privacyLevel,
                createdAt: tx.createdAt,
                updatedAt: tx.updatedAt,
                completedAt: tx.completedAt,
                transactionHash: tx.transactionHash,
                error: tx.error,
                progress: tx.progress,
            })),
            totalCount,
            hasMore: parseInt(offset, 10) + transactions.length < totalCount,
        };
        res.json({
            success: true,
            data: response,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error in /history:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get transaction history',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
router.post('/cancel/:transactionId', async (req, res) => {
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
        if (transaction.status !== 'pending') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Only pending transactions can be cancelled',
                currentStatus: transaction.status,
            });
        }
        await db.updateTransaction(transactionId, {
            status: 'failed',
            error: 'Cancelled by user',
            updatedAt: Date.now(),
        });
        console.log(`Transaction cancelled: ${transactionId}`);
        (0, index_2.broadcast)({
            type: 'transactionCancelled',
            transactionId,
            status: 'failed',
            error: 'Cancelled by user',
        });
        res.json({
            success: true,
            message: 'Transaction cancelled successfully',
            transactionId,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error in /cancel:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to cancel transaction',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
function getTokenAddress(symbol) {
    const tokenAddresses = {
        STRK: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
        ETH: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
        USDC: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
    };
    return tokenAddresses[symbol] || '';
}
function getFeeRate(privacyLevel) {
    const feeRates = {
        low: 0.005,
        medium: 0.008,
        high: 0.012,
    };
    return feeRates[privacyLevel] || 0.008;
}
function calculateEstimatedCompletion(privacySettings) {
    const baseTime = 300;
    const delayTime = privacySettings.delayHours * 3600;
    const privacyMultiplier = privacySettings.privacyLevel === 'high' ? 1.5 :
        privacySettings.privacyLevel === 'medium' ? 1.2 : 1.0;
    return Math.floor((baseTime + delayTime) * privacyMultiplier);
}
async function startMixingProcess(transactionId) {
    console.log(`Starting mixing process for transaction: ${transactionId}`);
    try {
        const db = (0, Database_1.getDatabase)();
        await db.updateTransaction(transactionId, {
            status: 'confirmed',
            progress: 10,
        });
        await db.updateMixingStep(transactionId, 'deposit', {
            status: 'completed',
            progress: 100,
            completedAt: Date.now(),
        });
        (0, index_2.broadcast)({
            type: 'transactionUpdate',
            transactionId,
            status: 'confirmed',
            progress: 10,
            step: 'deposit',
        });
        await simulateMixingSteps(transactionId);
    }
    catch (error) {
        console.error(`Error in mixing process for ${transactionId}:`, error);
        const db = (0, Database_1.getDatabase)();
        await db.updateTransaction(transactionId, {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            updatedAt: Date.now(),
        });
        (0, index_2.broadcast)({
            type: 'transactionFailed',
            transactionId,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
async function simulateMixingSteps(transactionId) {
    const db = (0, Database_1.getDatabase)();
    const transaction = await db.getTransaction(transactionId);
    if (!transaction)
        return;
    const steps = [
        { name: 'swap', duration: 2000, progressIncrement: 15 },
        { name: 'lightning', duration: 3000, progressIncrement: 20 },
        { name: 'cashu', duration: 2000, progressIncrement: 15 },
        { name: 'mixing', duration: 5000, progressIncrement: 25 },
        { name: 'redeem', duration: 3000, progressIncrement: 20 },
        { name: 'withdrawal', duration: 2000, progressIncrement: 5 },
    ];
    let currentProgress = 10;
    for (const step of steps) {
        await db.updateMixingStep(transactionId, step.name, {
            status: 'in-progress',
            progress: 0,
            startedAt: Date.now(),
        });
        currentProgress += step.progressIncrement;
        await db.updateTransaction(transactionId, {
            status: 'processing',
            progress: currentProgress,
        });
        (0, index_2.broadcast)({
            type: 'transactionUpdate',
            transactionId,
            status: 'processing',
            progress: currentProgress,
            step: step.name,
        });
        await new Promise(resolve => setTimeout(resolve, step.duration));
        await db.updateMixingStep(transactionId, step.name, {
            status: 'completed',
            progress: 100,
            completedAt: Date.now(),
        });
        console.log(`Completed mixing step: ${step.name} for transaction: ${transactionId}`);
    }
    await db.updateTransaction(transactionId, {
        status: 'completed',
        progress: 100,
        completedAt: Date.now(),
        transactionHash: (0, helpers_1.generateId)('tx_hash'),
    });
    console.log(`Mixing process completed for transaction: ${transactionId}`);
    (0, index_2.broadcast)({
        type: 'transactionCompleted',
        transactionId,
        status: 'completed',
        transactionHash: (0, helpers_1.generateId)('tx_hash'),
    });
}
exports.default = router;
//# sourceMappingURL=mixing.js.map