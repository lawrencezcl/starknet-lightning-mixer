export interface SwapRequest {
    fromToken: string;
    toToken: string;
    amount: number;
    recipient?: string;
    lightningInvoice?: string;
    slippageTolerance?: number;
    deadline?: number;
}
export interface SwapQuote {
    fromToken: string;
    toToken: string;
    fromAmount: number;
    toAmount: number;
    price: number;
    priceImpact: number;
    slippageTolerance: number;
    gasEstimate: number;
    route: Array<{
        token: string;
        amount: number;
        protocol: string;
    }>;
    validUntil: number;
}
export interface SwapExecution {
    id: string;
    quote: SwapQuote;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    transactionHash?: string;
    executedAt?: number;
    completedAt?: number;
    error?: string;
    actualOutputAmount?: number;
    fees: {
        protocol: number;
        gas: number;
        slippage: number;
    };
}
export interface TokenInfo {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
    price: number;
    liquidity: number;
    volume24h: number;
}
export interface SwapHistory {
    id: string;
    fromToken: string;
    toToken: string;
    fromAmount: number;
    toAmount: number;
    price: number;
    status: string;
    timestamp: number;
    transactionHash?: string;
    user: string;
}
export declare class AtomiqService {
    private apiUrl;
    private apiKey;
    private supportedTokens;
    constructor(apiUrl: string, apiKey: string);
    private initializeTokens;
    getQuote(request: {
        fromToken: string;
        toToken: string;
        amount: number;
        slippageTolerance?: number;
    }): Promise<SwapQuote>;
    executeSwap(request: SwapRequest): Promise<SwapExecution>;
    getSwapStatus(swapId: string): Promise<SwapExecution | null>;
    getSupportedTokens(): Promise<TokenInfo[]>;
    getToken(symbol: string): TokenInfo | undefined;
    getSwapHistory(userAddress: string, limit?: number, offset?: number): Promise<{
        swaps: SwapHistory[];
        totalCount: number;
    }>;
    private calculateLiquidityImpact;
    private estimateGas;
    private calculateProtocolFee;
    private simulateSwapExecution;
    isTokenPairSupported(fromToken: string, toToken: string): boolean;
    getBestRoute(fromToken: string, toToken: string, amount: number): Promise<SwapQuote['route']>;
    checkAvailability(): Promise<boolean>;
}
//# sourceMappingURL=AtomiqService.d.ts.map