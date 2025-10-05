export interface PrivacySettings {
  privacyLevel: 'low' | 'medium' | 'high';
  delayHours: number;
  splitIntoMultiple: boolean;
  splitCount: number;
  useRandomAmounts: boolean;
}

export interface Transaction {
  id: string;
  depositor: string;
  recipient: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount: string;
  fee: string;
  lightningInvoice: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'failed' | 'refunded';
  privacySettings: PrivacySettings;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  transactionHash?: string;
  error?: string;
  progress?: number;
}

export interface MixingStep {
  id: number;
  transactionId: string;
  stepName: string;
  stepDescription: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
}

export interface MixingProgress {
  transactionId: string;
  currentStep: number;
  totalSteps: number;
  steps: MixingStep[];
  overallProgress: number;
  estimatedCompletion?: number;
}

export interface DepositRequest {
  userAddress: string;
  token: string;
  amount: number;
  recipient: string;
  privacySettings: PrivacySettings;
}

export interface DepositResponse {
  transactionId: string;
  lightningInvoice: string;
  estimatedCompletion: number;
  fee: number;
}

export interface StatusResponse {
  transactionId: string;
  status: string;
  progress: number;
  steps: MixingStep[];
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  transactionHash?: string;
  error?: string;
  estimatedCompletion?: number;
}

export interface HistoryRequest {
  userAddress: string;
  limit?: number;
  offset?: number;
  status?: string;
}

export interface HistoryResponse {
  transactions: Array<{
    id: string;
    tokenSymbol: string;
    amount: string;
    fee: string;
    status: string;
    privacyLevel: string;
    createdAt: number;
    updatedAt: number;
    completedAt?: number;
    transactionHash?: string;
    error?: string;
    progress?: number;
  }>;
  totalCount: number;
  hasMore: boolean;
}

export interface CancelRequest {
  transactionId: string;
  reason?: string;
}

export interface CancelResponse {
  success: boolean;
  message: string;
  transactionId: string;
}

export interface RetryRequest {
  transactionId: string;
  stepName?: string;
}

export interface RetryResponse {
  success: boolean;
  message: string;
  transactionId: string;
  stepName?: string;
}

export interface TransactionStats {
  period: string;
  startTime: number;
  endTime: number;
  totalTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalVolume: number;
  averageProcessingTime: number;
  successRate: number;
  privacyLevelBreakdown: {
    low: number;
    medium: number;
    high: number;
  };
  tokenBreakdown: {
    STRK: number;
    ETH: number;
    USDC: number;
    other: number;
  };
}

export interface SearchParams {
  query?: string;
  status?: string;
  tokenSymbol?: string;
  privacyLevel?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  transactions: Transaction[];
  totalCount: number;
  hasMore: boolean;
}