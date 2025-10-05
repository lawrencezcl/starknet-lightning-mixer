import express from 'express';
import { getDatabase } from '../models/Database';
import { lightningService, cashuService, atomiqService } from '../index';
import { generateId } from '../utils/helpers';
import { broadcast } from '../index';
import { PrivacySettings } from '../types/Mixing';

const router = express.Router();

interface DepositRequest {
  userAddress: string;
  token: string;
  amount: number;
  recipient: string;
  privacySettings: PrivacySettings;
}

interface DepositResponse {
  transactionId: string;
  lightningInvoice: string;
  estimatedCompletion: number;
  fee: number;
}

/**
 * POST /api/mix/deposit
 * Initiate a new mixing transaction
 */
router.post('/deposit', async (req: express.Request, res: express.Response) => {
  try {
    const {
      userAddress,
      token,
      amount,
      recipient,
      privacySettings,
    }: DepositRequest = req.body;

    // Validate input
    if (!userAddress || !token || !amount || !recipient || !privacySettings) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields',
        requiredFields: ['userAddress', 'token', 'amount', 'recipient', 'privacySettings'],
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Amount must be greater than 0',
      });
    }

    // Validate privacy settings
    if (!privacySettings.privacyLevel || !['low', 'medium', 'high'].includes(privacySettings.privacyLevel)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid privacy level. Must be: low, medium, or high',
      });
    }

    const db = getDatabase();

    // Create or update user
    await db.createOrUpdateUser(userAddress);

    // Calculate fees
    const feeRate = getFeeRate(privacySettings.privacyLevel);
    const feeAmount = Math.floor(amount * feeRate);
    const netAmount = amount - feeAmount;

    console.log(`Initiating mixing: ${amount} ${token} -> ${recipient} (fee: ${feeAmount} ${token})`);

    // Step 1: Get Lightning invoice for the swap to BTC
    let lightningInvoice: string;
    try {
      // In a real implementation, this would swap STRK to BTC first, then create Lightning invoice
      // For now, we'll create a direct Lightning invoice
      const invoiceResponse = await lightningService.createInvoice({
        amount: Math.floor(netAmount * 1000), // Convert to sats (mock rate)
        memo: `Privacy mix for ${userAddress}`,
        expiry: 3600,
        private: true,
      });

      lightningInvoice = invoiceResponse.paymentRequest;
    } catch (error) {
      console.error('Failed to create Lightning invoice:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create Lightning invoice',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Create transaction record
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

    // Create mixing steps
    await db.createMixingStep(transaction.id, 'deposit', 'Processing deposit on Starknet');
    await db.createMixingStep(transaction.id, 'swap', 'Swapping to Bitcoin');
    await db.createMixingStep(transaction.id, 'lightning', 'Creating Lightning payment');
    await db.createMixingStep(transaction.id, 'cashu', 'Minting Cashu tokens');
    await db.createMixingStep(transaction.id, 'mixing', 'Applying privacy transformations');
    await db.createMixingStep(transaction.id, 'redeem', 'Redeeming and swapping back');
    await db.createMixingStep(transaction.id, 'withdrawal', 'Sending to recipient');

    // Calculate estimated completion time based on privacy settings
    const estimatedCompletion = calculateEstimatedCompletion(privacySettings);

    // Start the mixing process asynchronously
    startMixingProcess(transaction.id);

    const response: DepositResponse = {
      transactionId: transaction.id,
      lightningInvoice,
      estimatedCompletion,
      fee: feeAmount,
    };

    console.log(`Mixing transaction created: ${transaction.id}`);

    // Broadcast transaction update
    broadcast({
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

  } catch (error) {
    console.error('Error in /deposit:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to initiate mixing transaction',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/mix/status/:transactionId
 * Get status of a mixing transaction
 */
router.get('/status/:transactionId', async (req: express.Request, res: express.Response) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Transaction ID is required',
      });
    }

    const db = getDatabase();
    const transaction = await db.getTransaction(transactionId);

    if (!transaction) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Transaction not found',
        transactionId,
      });
    }

    // Get mixing steps
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

  } catch (error) {
    console.error('Error in /status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get transaction status',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/mix/history
 * Get transaction history for a user
 */
router.get('/history', async (req: express.Request, res: express.Response) => {
  try {
    const {
      userAddress,
      limit = '50',
      offset = '0',
      status,
    } = req.query;

    if (!userAddress) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'User address is required',
      });
    }

    const db = getDatabase();
    const { transactions, totalCount } = await db.getUserTransactions(
      userAddress as string,
      parseInt(limit as string, 10),
      parseInt(offset as string, 10),
      status as string
    );

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
      hasMore: parseInt(offset as string, 10) + transactions.length < totalCount,
    };

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in /history:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get transaction history',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/mix/cancel/:transactionId
 * Cancel a pending transaction
 */
router.post('/cancel/:transactionId', async (req: express.Request, res: express.Response) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Transaction ID is required',
      });
    }

    const db = getDatabase();
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

    // Update transaction status
    await db.updateTransaction(transactionId, {
      status: 'failed',
      error: 'Cancelled by user',
      updatedAt: Date.now(),
    });

    console.log(`Transaction cancelled: ${transactionId}`);

    // Broadcast cancellation
    broadcast({
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

  } catch (error) {
    console.error('Error in /cancel:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to cancel transaction',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Get token address from symbol
 */
function getTokenAddress(symbol: string): string {
  const tokenAddresses: Record<string, string> = {
    STRK: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    ETH: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    USDC: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
  };

  return tokenAddresses[symbol] || '';
}

/**
 * Get fee rate based on privacy level
 */
function getFeeRate(privacyLevel: string): number {
  const feeRates: Record<string, number> = {
    low: 0.005,    // 0.5%
    medium: 0.008,  // 0.8%
    high: 0.012,    // 1.2%
  };

  return feeRates[privacyLevel] || 0.008;
}

/**
 * Calculate estimated completion time in seconds
 */
function calculateEstimatedCompletion(privacySettings: PrivacySettings): number {
  const baseTime = 300; // 5 minutes base time
  const delayTime = privacySettings.delayHours * 3600; // Convert hours to seconds
  const privacyMultiplier = privacySettings.privacyLevel === 'high' ? 1.5 :
                          privacySettings.privacyLevel === 'medium' ? 1.2 : 1.0;

  return Math.floor((baseTime + delayTime) * privacyMultiplier);
}

/**
 * Start the mixing process for a transaction
 */
async function startMixingProcess(transactionId: string) {
  console.log(`Starting mixing process for transaction: ${transactionId}`);

  try {
    const db = getDatabase();

    // Update transaction status to confirmed (assuming Starknet deposit was successful)
    await db.updateTransaction(transactionId, {
      status: 'confirmed',
      progress: 10,
    });

    // Update first step
    await db.updateMixingStep(transactionId, 'deposit', {
      status: 'completed',
      progress: 100,
      completedAt: Date.now(),
    });

    // Broadcast update
    broadcast({
      type: 'transactionUpdate',
      transactionId,
      status: 'confirmed',
      progress: 10,
      step: 'deposit',
    });

    // Simulate the mixing process with delays
    await simulateMixingSteps(transactionId);

  } catch (error) {
    console.error(`Error in mixing process for ${transactionId}:`, error);

    const db = getDatabase();
    await db.updateTransaction(transactionId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      updatedAt: Date.now(),
    });

    broadcast({
      type: 'transactionFailed',
      transactionId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Simulate the mixing process steps
 */
async function simulateMixingSteps(transactionId: string) {
  const db = getDatabase();
  const transaction = await db.getTransaction(transactionId);

  if (!transaction) return;

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
    // Start step
    await db.updateMixingStep(transactionId, step.name, {
      status: 'in-progress',
      progress: 0,
      startedAt: Date.now(),
    });

    // Update transaction progress
    currentProgress += step.progressIncrement;
    await db.updateTransaction(transactionId, {
      status: 'processing',
      progress: currentProgress,
    });

    // Broadcast step start
    broadcast({
      type: 'transactionUpdate',
      transactionId,
      status: 'processing',
      progress: currentProgress,
      step: step.name,
    });

    // Simulate step duration
    await new Promise(resolve => setTimeout(resolve, step.duration));

    // Complete step
    await db.updateMixingStep(transactionId, step.name, {
      status: 'completed',
      progress: 100,
      completedAt: Date.now(),
    });

    console.log(`Completed mixing step: ${step.name} for transaction: ${transactionId}`);
  }

  // Mark transaction as completed
  await db.updateTransaction(transactionId, {
    status: 'completed',
    progress: 100,
    completedAt: Date.now(),
    transactionHash: generateId('tx_hash'),
  });

  console.log(`Mixing process completed for transaction: ${transactionId}`);

  // Broadcast completion
  broadcast({
    type: 'transactionCompleted',
    transactionId,
    status: 'completed',
    transactionHash: generateId('tx_hash'),
  });
}

export default router;