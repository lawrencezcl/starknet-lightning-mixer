export interface Transaction {
  id: string;
  status: TransactionStatus;
  token: string;
  amount: string;
  fee: string;
  from: string;
  to: string;
  lightningInvoice?: string;
  transactionHash?: string;
  privacySettings: PrivacySettings;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  error?: string;
  progress?: number;
}

export type TransactionStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface PrivacySettings {
  delayHours: number;
  splitIntoMultiple: boolean;
  splitCount: number;
  useRandomAmounts: boolean;
  privacyLevel: 'low' | 'medium' | 'high';
}

export interface MixingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress: number;
  timestamp?: number;
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

export interface DepositParams {
  token: string;
  amount: number;
  recipient: string;
}

export interface LightningInvoiceRequest {
  amount: number;
  token: string;
  privacySettings: PrivacySettings;
  userAddress: string;
}

export interface LightningInvoiceResponse {
  invoice: string;
  paymentHash: string;
  expiry: number;
  amount: number;
}

export interface TransactionStatusResponse {
  transactionId: string;
  status: TransactionStatus;
  progress: number;
  steps: MixingStep[];
  estimatedCompletion?: number;
  error?: string;
}