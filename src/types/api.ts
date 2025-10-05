export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    totalCount: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface HistoryRequest {
  userAddress: string;
  limit?: number;
  offset?: number;
  status?: import('./mixer').TransactionStatus;
}

export interface HistoryResponse {
  transactions: import('./mixer').Transaction[];
  totalCount: number;
  hasMore: boolean;
}

export interface WebSocketEvents {
  // Client -> Server
  subscribe: {
    transactionId: string;
  };

  unsubscribe: {
    transactionId: string;
  };

  // Server -> Client
  transactionUpdate: {
    transactionId: string;
    status: import('./mixer').TransactionStatus;
    progress: number;
    step: string;
    timestamp: number;
  };

  transactionCompleted: {
    transactionId: string;
    status: 'completed' | 'failed';
    result?: {
      amount: number;
      recipient: string;
      transactionHash: string;
    };
    error?: string;
  };
}