import { useState, useCallback, useEffect } from 'react';
import { useAccount } from '@/lib/starknet-mock';
import { useMixerStore } from '@/store/mixerStore';
import { Transaction, PrivacySettings, LightningInvoiceRequest, DepositParams } from '@/types/mixer';
import { toast } from 'sonner';
import { generateId } from '@/lib/utils';
import { API_ENDPOINTS } from '@/lib/constants';

// Mock WebSocket connection for real-time updates
class WebSocketManager {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect() {
    try {
      this.ws = new WebSocket(API_ENDPOINTS.WS_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private handleMessage(data: any) {
    if (data.type === 'transactionUpdate' && data.transactionId) {
      const callback = this.subscriptions.get(data.transactionId);
      if (callback) {
        callback(data);
      }
    }
  }

  subscribe(transactionId: string, callback: (data: any) => void) {
    this.subscriptions.set(transactionId, callback);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        transactionId,
      }));
    }
  }

  unsubscribe(transactionId: string) {
    this.subscriptions.delete(transactionId);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        transactionId,
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
  }
}

// Global WebSocket manager
const wsManager = new WebSocketManager();

// Connect WebSocket when module loads
if (typeof window !== 'undefined') {
  wsManager.connect();
}

export function useMixer() {
  const { address, isConnected } = useAccount();
  const {
    setCurrentTransaction,
    addTransaction,
    updateTransaction,
    setProcessing,
    transactions,
    privacySettings,
  } = useMixerStore();

  const [error, setError] = useState<string | null>(null);

  // Mock contract write - in a real implementation, this would interact with the Starknet contract
  const mockContractWrite = {
    writeAsync: async (params: any) => {
      // Simulate contract call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      };
    },
    isPending: false,
    data: null,
  };

  // Mock transaction waiting - in a real implementation, this would use useWaitForTransaction
  const waitForTransaction = {
    data: null,
    isLoading: false,
  };

  // Generate Lightning invoice
  const generateLightningInvoice = useCallback(async (
    params: LightningInvoiceRequest
  ): Promise<string> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.LIGHTNING.INVOICE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Lightning invoice');
      }

      const data = await response.json();
      return data.data.invoice;
    } catch (error) {
      console.error('Error generating Lightning invoice:', error);
      throw error;
    }
  }, []);

  // Execute deposit
  const deposit = useCallback(async (params: DepositParams): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setError(null);
    setProcessing(true);

    try {
      // Create Lightning invoice first
      const lightningInvoice = await generateLightningInvoice({
        amount: params.amount,
        token: params.token,
        userAddress: address,
        privacySettings: privacySettings,
      });

      // Create transaction record
      const transaction: Transaction = {
        id: generateId('tx'),
        status: 'pending',
        token: params.token,
        amount: params.amount.toString(),
        fee: calculateFee(params.amount, params.token).toString(),
        from: address,
        to: params.recipient,
        lightningInvoice,
        privacySettings,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Add transaction to store
      addTransaction(transaction);
      setCurrentTransaction(transaction);

      // Mock contract interaction
      const contractResult = await mockContractWrite.writeAsync({
        args: [
          params.token, // token_address
          params.amount, // amount
          lightningInvoice, // lightning_invoice
        ],
      });

      // Monitor transaction progress
      monitorTransactionProgress(transaction.id);

      // Update transaction with hash
      updateTransaction(transaction.id, {
        transactionHash: contractResult.transaction_hash,
        status: 'confirmed',
      });

      toast.success('Deposit initiated successfully');
      return transaction.id;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Deposit failed';
      setError(errorMessage);
      toast.error(errorMessage);

      // Update transaction status to failed
      if (currentTransaction) {
        updateTransaction(currentTransaction.id, {
          status: 'failed',
          error: errorMessage,
          updatedAt: Date.now(),
        });
      }

      throw err;
    } finally {
      setProcessing(false);
    }
  }, [isConnected, address, privacySettings, addTransaction, setCurrentTransaction, updateTransaction, setProcessing]);

  // Monitor transaction progress via WebSocket
  const monitorTransactionProgress = useCallback((transactionId: string) => {
    wsManager.subscribe(transactionId, (data) => {
      if (data.transactionId === transactionId) {
        updateTransaction(transactionId, {
          status: data.status,
          progress: data.progress,
          updatedAt: Date.now(),
        });

        // Handle completion
        if (data.status === 'completed') {
          toast.success('Privacy mixing completed successfully!');
        } else if (data.status === 'failed') {
          toast.error('Privacy mixing failed');
        }
      }
    });
  }, [updateTransaction]);

  // Clean up WebSocket subscription when component unmounts
  useEffect(() => {
    return () => {
      if (currentTransaction) {
        wsManager.unsubscribe(currentTransaction.id);
      }
    };
  }, [currentTransaction]);

  // Get transaction history
  const getTransactionHistory = useCallback(async (
    limit: number = 50,
    offset: number = 0
  ) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.MIXING.HISTORY}?userAddress=${address}&limit=${limit}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transaction history');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }, [address]);

  // Cancel transaction
  const cancelTransaction = useCallback(async (transactionId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.MIXING.CANCEL}/${transactionId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel transaction');
      }

      updateTransaction(transactionId, {
        status: 'failed',
        error: 'Cancelled by user',
        updatedAt: Date.now(),
      });

      toast.success('Transaction cancelled');
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      throw error;
    }
  }, [updateTransaction]);

  return {
    deposit,
    isProcessing: useMixerStore(state => state.isProcessing) || mockContractWrite.isPending,
    error,
    currentTransaction: useMixerStore(state => state.currentTransaction),
    transactions: useMixerStore(state => state.transactions),
    privacySettings: useMixerStore(state => state.privacySettings),
    getTransactionHistory,
    cancelTransaction,
    transactionReceipt: waitForTransaction.data,
    isLoading: waitForTransaction.isLoading,
  };
}

// Calculate fee based on token and amount
function calculateFee(amount: number, token: string): number {
  const feeRates = {
    STRK: 0.005, // 0.5%
    ETH: 0.003,   // 0.3%
    USDC: 0.002,  // 0.2%
  };

  const feeRate = feeRates[token as keyof typeof feeRates] || 0.005;
  return amount * feeRate;
}