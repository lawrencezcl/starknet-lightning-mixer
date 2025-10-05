export interface StarknetNetwork {
  name: 'mainnet' | 'sepolia' | 'goerli';
  chainId: string;
  rpcUrl: string;
  blockExplorerUrl: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  minAmount: number;
  maxAmount: number;
  feeRate: number;
}

export interface WalletInfo {
  address: string;
  isConnected: boolean;
  network: StarknetNetwork;
  balance: Record<string, string>;
}

export interface ContractCall {
  address: string;
  functionName: string;
  args: any[];
}

export interface ContractWriteResult {
  transaction_hash: string;
  status: 'success' | 'error';
  error?: string;
}

export interface TransactionReceipt {
  transaction_hash: string;
  status: 'success' | 'error' | 'pending';
  block_number?: number;
  timestamp?: number;
  events?: any[];
}