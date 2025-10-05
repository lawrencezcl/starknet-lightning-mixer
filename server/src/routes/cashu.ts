import express from 'express';
import { cashuService } from '../index';

const router = express.Router();

interface MintRequest {
  amount: number;
  unit?: string;
}

interface RedeemRequest {
  proofs: Array<{
    id: string;
    amount: number;
    secret: string;
    C: string;
    witness?: string;
  }>;
  outputs?: Array<{
    id: string;
    amount: number;
    C: string;
    secret: string;
  }>;
}

interface SplitRequest {
  proofs: Array<{
    id: string;
    amount: number;
    secret: string;
    C: string;
    witness?: string;
  }>;
  outputs: number[];
}

/**
 * POST /api/cashu/mint
 * Mint Cashu tokens
 */
router.post('/mint', async (req: express.Request, res: express.Response) => {
  try {
    const { amount, unit = 'sat' }: MintRequest = req.body;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Amount must be greater than 0',
      });
    }

    console.log(`Minting ${amount} ${unit} Cashu tokens`);

    const mintResponse = await cashuService.mintTokens({
      amount,
      unit,
    });

    res.json({
      success: true,
      data: mintResponse,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error minting Cashu tokens:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to mint Cashu tokens',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/cashu/redeem
 * Redeem Cashu tokens
 */
router.post('/redeem', async (req: express.Request, res: express.Response) => {
  try {
    const { proofs, outputs }: RedeemRequest = req.body;

    // Validate input
    if (!proofs || !Array.isArray(proofs) || proofs.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Proofs array is required and cannot be empty',
      });
    }

    console.log(`Redeeming ${proofs.length} Cashu proofs`);

    const redeemResponse = await cashuService.redeemTokens({
      proofs,
      outputs,
    });

    res.json({
      success: true,
      data: redeemResponse,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error redeeming Cashu tokens:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to redeem Cashu tokens',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/cashu/split
 * Split Cashu proofs
 */
router.post('/split', async (req: express.Request, res: express.Response) => {
  try {
    const { proofs, outputs }: SplitRequest = req.body;

    // Validate input
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

    const splitResponse = await cashuService.splitProofs({
      proofs,
      outputs,
    });

    res.json({
      success: true,
      data: splitResponse,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error splitting Cashu proofs:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to split Cashu proofs',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/cashu/verify
 * Verify Cashu proofs
 */
router.post('/verify', async (req: express.Request, res: express.Response) => {
  try {
    const { proofs } = req.body;

    // Validate input
    if (!proofs || !Array.isArray(proofs) || proofs.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Proofs array is required and cannot be empty',
      });
    }

    console.log(`Verifying ${proofs.length} Cashu proofs`);

    const verifyResponse = await cashuService.verifyProofs({ proofs });

    res.json({
      success: true,
      data: verifyResponse,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error verifying Cashu proofs:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify Cashu proofs',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/cashu/mint/info
 * Get mint information
 */
router.get('/mint/info', async (req: express.Request, res: express.Response) => {
  try {
    console.log('Getting Cashu mint information');

    const mintInfo = await cashuService.getMintInfo();

    res.json({
      success: true,
      data: mintInfo,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error getting mint info:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get mint information',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/cashu/keys
 * Get Cashu mint keys
 */
router.get('/keys', async (req: express.Request, res: express.Response) => {
  try {
    console.log('Getting Cashu mint keys');

    // This would typically be handled internally by the mint service
    // For this endpoint, we'll return the current keyset information
    const mintInfo = await cashuService.getMintInfo();

    res.json({
      success: true,
      data: {
        unit: mintInfo.unit,
        nuts: mintInfo.nuts,
        // Keys would be returned by the actual mint service
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error getting Cashu keys:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get Cashu keys',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/cashu/refresh
 * Refresh Cashu keys
 */
router.post('/refresh', async (req: express.Request, res: express.Response) => {
  try {
    console.log('Refreshing Cashu keys');

    await cashuService.refreshKeys();

    res.json({
      success: true,
      message: 'Cashu keys refreshed successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error refreshing Cashu keys:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to refresh Cashu keys',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/cashu/health
 * Check Cashu service health
 */
router.get('/health', async (req: express.Request, res: express.Response) => {
  try {
    const isHealthy = await cashuService.checkAvailability();

    res.json({
      success: true,
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error checking Cashu health:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to check Cashu service health',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;