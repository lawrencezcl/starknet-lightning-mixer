import express from 'express';
import { atomiqService } from '../index';

const router = express.Router();

interface QuoteRequest {
  fromToken: string;
  toToken: string;
  amount: number;
  slippageTolerance?: number;
}

interface SwapRequest {
  fromToken: string;
  toToken: string;
  amount: number;
  recipient?: string;
  lightningInvoice?: string;
  slippageTolerance?: number;
  deadline?: number;
}

/**
 * POST /api/atomiq/quote
 * Get swap quote
 */
router.post('/quote', async (req: express.Request, res: express.Response) => {
  try {
    const { fromToken, toToken, amount, slippageTolerance }: QuoteRequest = req.body;

    // Validate input
    if (!fromToken || !toToken || !amount || amount <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'fromToken, toToken, and amount (greater than 0) are required',
      });
    }

    // Check if token pair is supported
    if (!atomiqService.isTokenPairSupported(fromToken, toToken)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Unsupported token pair: ${fromToken}/${toToken}`,
      });
    }

    console.log(`Getting quote: ${amount} ${fromToken} -> ${toToken}`);

    const quote = await atomiqService.getQuote({
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

  } catch (error) {
    console.error('Error getting swap quote:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get swap quote',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/atomiq/swap
 * Execute swap
 */
router.post('/swap', async (req: express.Request, res: express.Response) => {
  try {
    const swapRequest: SwapRequest = req.body;

    // Validate input
    const { fromToken, toToken, amount, recipient, lightningInvoice, slippageTolerance, deadline } = swapRequest;

    if (!fromToken || !toToken || !amount || amount <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'fromToken, toToken, and amount (greater than 0) are required',
      });
    }

    // Check if token pair is supported
    if (!atomiqService.isTokenPairSupported(fromToken, toToken)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Unsupported token pair: ${fromToken}/${toToken}`,
      });
    }

    console.log(`Executing swap: ${amount} ${fromToken} -> ${toToken}`);

    const swapExecution = await atomiqService.executeSwap(swapRequest);

    res.status(201).json({
      success: true,
      data: swapExecution,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error executing swap:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to execute swap',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/atomiq/swap/:swapId
 * Get swap status
 */
router.get('/swap/:swapId', async (req: express.Request, res: express.Response) => {
  try {
    const { swapId } = req.params;

    if (!swapId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Swap ID is required',
      });
    }

    console.log(`Getting status for swap: ${swapId}`);

    const swapStatus = await atomiqService.getSwapStatus(swapId);

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

  } catch (error) {
    console.error('Error getting swap status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get swap status',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/atomiq/tokens
 * Get supported tokens
 */
router.get('/tokens', async (req: express.Request, res: express.Response) => {
  try {
    console.log('Getting supported tokens');

    const tokens = await atomiqService.getSupportedTokens();

    res.json({
      success: true,
      data: tokens,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error getting supported tokens:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get supported tokens',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/atomiq/tokens/:symbol
 * Get token information by symbol
 */
router.get('/tokens/:symbol', async (req: express.Request, res: express.Response) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Token symbol is required',
      });
    }

    console.log(`Getting token information for: ${symbol}`);

    const token = atomiqService.getToken(symbol.toUpperCase());

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

  } catch (error) {
    console.error('Error getting token information:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get token information',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/atomiq/route
 * Get best route for swap
 */
router.get('/route', async (req: express.Request, res: express.Response) => {
  try {
    const { fromToken, toToken, amount } = req.query;

    if (!fromToken || !toToken || !amount) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'fromToken, toToken, and amount query parameters are required',
      });
    }

    const amountNum = parseFloat(amount as string);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Amount must be a valid number greater than 0',
      });
    }

    // Check if token pair is supported
    if (!atomiqService.isTokenPairSupported(fromToken as string, toToken as string)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Unsupported token pair: ${fromToken}/${toToken}`,
      });
    }

    console.log(`Getting best route: ${amountNum} ${fromToken} -> ${toToken}`);

    const route = await atomiqService.getBestRoute(
      fromToken as string,
      toToken as string,
      amountNum
    );

    res.json({
      success: true,
      data: route,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error getting best route:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get best route',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/atomiq/history
 * Get swap history
 */
router.get('/history', async (req: express.Request, res: express.Response) => {
  try {
    const {
      userAddress,
      limit = '50',
      offset = '0',
    } = req.query;

    if (!userAddress) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'userAddress query parameter is required',
      });
    }

    console.log(`Getting swap history for user: ${userAddress}`);

    const history = await atomiqService.getSwapHistory(
      userAddress as string,
      parseInt(limit as string, 10),
      parseInt(offset as string, 10)
    );

    res.json({
      success: true,
      data: history,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error getting swap history:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get swap history',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/atomiq/health
 * Check Atomiq service health
 */
router.get('/health', async (req: express.Request, res: express.Response) => {
  try {
    const isHealthy = await atomiqService.checkAvailability();

    res.json({
      success: true,
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error checking Atomiq health:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to check Atomiq service health',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/atomiq/price/:fromToken/:toToken
 * Get price information for token pair
 */
router.get('/price/:fromToken/:toToken', async (req: express.Request, res: express.Response) => {
  try {
    const { fromToken, toToken } = req.params;

    if (!fromToken || !toToken) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Both fromToken and toToken are required',
      });
    }

    // Check if token pair is supported
    if (!atomiqService.isTokenPairSupported(fromToken, toToken)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Unsupported token pair: ${fromToken}/${toToken}`,
      });
    }

    console.log(`Getting price: ${fromToken}/${toToken}`);

    // Get a quote for 1 unit to get the price
    const quote = await atomiqService.getQuote({
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

  } catch (error) {
    console.error('Error getting price:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get price information',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;