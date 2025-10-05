import { renderHook, act } from '@testing-library/react';
import { useMixerStore } from '../mixerStore';
import { Transaction, PrivacySettings } from '@/types/mixer';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('MixerStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useMixerStore.getState().reset();
    localStorageMock.clear();
  });

  describe('Transaction Management', () => {
    it('should add transaction correctly', () => {
      const { result } = renderHook(() => useMixerStore());

      const transaction: Transaction = {
        id: 'tx_123',
        status: 'pending',
        token: 'STRK',
        amount: '1000',
        fee: '5',
        from: '0x123...',
        to: '0x456...',
        privacySettings: {
          privacyLevel: 'medium',
          delayHours: 2,
          splitIntoMultiple: false,
          splitCount: 3,
          useRandomAmounts: true,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      act(() => {
        result.current.addTransaction(transaction);
      });

      expect(result.current.transactions).toHaveLength(1);
      expect(result.current.transactions[0]).toEqual(transaction);
      expect(result.current.currentTransaction).toEqual(transaction);
    });

    it('should update transaction correctly', () => {
      const { result } = renderHook(() => useMixerStore());

      // Add initial transaction
      const transaction: Transaction = {
        id: 'tx_123',
        status: 'pending',
        token: 'STRK',
        amount: '1000',
        fee: '5',
        from: '0x123...',
        to: '0x456...',
        privacySettings: {
          privacyLevel: 'medium',
          delayHours: 2,
          splitIntoMultiple: false,
          splitCount: 3,
          useRandomAmounts: true,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      act(() => {
        result.current.addTransaction(transaction);
      });

      // Update transaction status
      act(() => {
        result.current.updateTransaction('tx_123', { status: 'completed' });
      });

      expect(result.current.transactions[0].status).toBe('completed');
      expect(result.current.currentTransaction?.status).toBe('completed');
    });

    it('should clear transactions correctly', () => {
      const { result } = renderHook(() => useMixerStore());

      // Add multiple transactions
      const transactions: Transaction[] = [
        {
          id: 'tx_123',
          status: 'pending',
          token: 'STRK',
          amount: '1000',
          fee: '5',
          from: '0x123...',
          to: '0x456...',
          privacySettings: {
            privacyLevel: 'medium',
            delayHours: 2,
            splitIntoMultiple: false,
            splitCount: 3,
            useRandomAmounts: true,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'tx_456',
          status: 'completed',
          token: 'ETH',
          amount: '0.5',
          fee: '0.0015',
          from: '0x789...',
          to: '0x012...',
          privacySettings: {
            privacyLevel: 'low',
            delayHours: 0,
            splitIntoMultiple: false,
            splitCount: 1,
            useRandomAmounts: false,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      act(() => {
        transactions.forEach(tx => result.current.addTransaction(tx));
      });

      expect(result.current.transactions).toHaveLength(2);

      // Clear transactions
      act(() => {
        result.current.clearTransactions();
      });

      expect(result.current.transactions).toHaveLength(0);
      expect(result.current.currentTransaction).toBeNull();
      expect(result.current.selectedTransactionId).toBeNull();
    });
  });

  describe('Privacy Settings Management', () => {
    it('should have default privacy settings', () => {
      const { result } = renderHook(() => useMixerStore());

      expect(result.current.privacySettings).toEqual({
        delayHours: 2,
        splitIntoMultiple: false,
        splitCount: 3,
        useRandomAmounts: false,
        privacyLevel: 'medium',
      });
    });

    it('should update privacy settings correctly', () => {
      const { result } = renderHook(() => useMixerStore());

      const newSettings: Partial<PrivacySettings> = {
        privacyLevel: 'high',
        delayHours: 6,
        splitIntoMultiple: true,
        splitCount: 5,
      };

      act(() => {
        result.current.updatePrivacySettings(newSettings);
      });

      expect(result.current.privacySettings).toEqual({
        delayHours: 6,
        splitIntoMultiple: true,
        splitCount: 5,
        useRandomAmounts: false, // Should retain existing value
        privacyLevel: 'high',
      });
    });

    it('should merge partial updates correctly', () => {
      const { result } = renderHook(() => useMixerStore());

      // Update only privacy level
      act(() => {
        result.current.updatePrivacySettings({ privacyLevel: 'low' });
      });

      expect(result.current.privacySettings.privacyLevel).toBe('low');
      expect(result.current.privacySettings.delayHours).toBe(2); // Should remain unchanged
    });
  });

  describe('Processing State Management', () => {
    it('should set processing state correctly', () => {
      const { result } = renderHook(() => useMixerStore());

      expect(result.current.isProcessing).toBe(false);

      act(() => {
        result.current.setProcessing(true);
      });

      expect(result.current.isProcessing).toBe(true);

      act(() => {
        result.current.setProcessing(false);
      });

      expect(result.current.isProcessing).toBe(false);
    });
  });

  describe('Current Transaction Management', () => {
    it('should set current transaction correctly', () => {
      const { result } = renderHook(() => useMixerStore());

      const transaction: Transaction = {
        id: 'tx_789',
        status: 'processing',
        token: 'USDC',
        amount: '500',
        fee: '1',
        from: '0xabc...',
        to: '0xdef...',
        privacySettings: {
          privacyLevel: 'high',
          delayHours: 12,
          splitIntoMultiple: true,
          splitCount: 7,
          useRandomAmounts: true,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      act(() => {
        result.current.setCurrentTransaction(transaction);
      });

      expect(result.current.currentTransaction).toEqual(transaction);
    });

    it('should clear current transaction', () => {
      const { result } = renderHook(() => useMixerStore());

      // Set current transaction
      const transaction: Transaction = {
        id: 'tx_789',
        status: 'processing',
        token: 'USDC',
        amount: '500',
        fee: '1',
        from: '0xabc...',
        to: '0xdef...',
        privacySettings: {
          privacyLevel: 'high',
          delayHours: 12,
          splitIntoMultiple: true,
          splitCount: 7,
          useRandomAmounts: true,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      act(() => {
        result.current.setCurrentTransaction(transaction);
      });

      expect(result.current.currentTransaction).not.toBeNull();

      // Clear current transaction
      act(() => {
        result.current.setCurrentTransaction(null);
      });

      expect(result.current.currentTransaction).toBeNull();
    });
  });

  describe('UI State Management', () => {
    it('should manage transaction modal visibility', () => {
      const { result } = renderHook(() => useMixerStore());

      expect(result.current.showTransactionModal).toBe(false);

      act(() => {
        result.current.setShowTransactionModal(true);
      });

      expect(result.current.showTransactionModal).toBe(true);

      act(() => {
        result.current.setShowTransactionModal(false);
      });

      expect(result.current.showTransactionModal).toBe(false);
    });

    it('should manage selected transaction ID', () => {
      const { result } = renderHook(() => useMixerStore());

      expect(result.current.selectedTransactionId).toBeNull();

      act(() => {
        result.current.setSelectedTransactionId('tx_123');
      });

      expect(result.current.selectedTransactionId).toBe('tx_123');

      act(() => {
        result.current.setSelectedTransactionId(null);
      });

      expect(result.current.selectedTransactionId).toBeNull();
    });
  });

  describe('Persistence', () => {
    it('should persist transactions and privacy settings', async () => {
      const { result } = renderHook(() => useMixerStore());

      // Add transaction and update settings
      const transaction: Transaction = {
        id: 'tx_persist',
        status: 'completed',
        token: 'STRK',
        amount: '1000',
        fee: '5',
        from: '0x123...',
        to: '0x456...',
        privacySettings: {
          privacyLevel: 'high',
          delayHours: 8,
          splitIntoMultiple: true,
          splitCount: 5,
          useRandomAmounts: true,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      act(() => {
        result.current.addTransaction(transaction);
        result.current.updatePrivacySettings({ privacyLevel: 'high' });
      });

      // Wait for async persistence
      await new Promise(resolve => setTimeout(resolve, 0));

      // Verify store has the expected data
      expect(result.current.transactions).toHaveLength(1);
      expect(result.current.transactions[0].id).toBe('tx_persist');
      expect(result.current.privacySettings.privacyLevel).toBe('high');
    });
  });
});