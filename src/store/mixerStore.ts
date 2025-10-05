import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, PrivacySettings } from '@/types/mixer';

interface MixerState {
  // Current transaction
  currentTransaction: Transaction | null;
  isProcessing: boolean;

  // Transaction history
  transactions: Transaction[];

  // Settings
  privacySettings: PrivacySettings;

  // UI state
  showTransactionModal: boolean;
  selectedTransactionId: string | null;

  // Actions
  setCurrentTransaction: (transaction: Transaction | null) => void;
  setProcessing: (processing: boolean) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  clearTransactions: () => void;
  setShowTransactionModal: (show: boolean) => void;
  setSelectedTransactionId: (id: string | null) => void;
}

const defaultPrivacySettings: PrivacySettings = {
  delayHours: 2,
  splitIntoMultiple: false,
  splitCount: 3,
  useRandomAmounts: false,
  privacyLevel: 'medium',
};

export const useMixerStore = create<MixerState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentTransaction: null,
      isProcessing: false,
      transactions: [],
      privacySettings: defaultPrivacySettings,
      showTransactionModal: false,
      selectedTransactionId: null,

      // Actions
      setCurrentTransaction: (transaction) =>
        set({ currentTransaction: transaction }),

      setProcessing: (processing) =>
        set({ isProcessing: processing }),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions],
          currentTransaction: transaction,
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map(tx =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
          currentTransaction:
            state.currentTransaction?.id === id
              ? { ...state.currentTransaction, ...updates }
              : state.currentTransaction,
        })),

      updatePrivacySettings: (settings) =>
        set((state) => ({
          privacySettings: { ...state.privacySettings, ...settings }
        })),

      clearTransactions: () =>
        set({
          transactions: [],
          currentTransaction: null,
          selectedTransactionId: null,
        }),

      setShowTransactionModal: (show) =>
        set({ showTransactionModal: show }),

      setSelectedTransactionId: (id) =>
        set({ selectedTransactionId: id }),

      reset: () =>
        set({
          currentTransaction: null,
          isProcessing: false,
          transactions: [],
          privacySettings: defaultPrivacySettings,
          showTransactionModal: false,
          selectedTransactionId: null,
        }),
    }),
    {
      name: 'mixer-storage',
      partialize: (state) => ({
        transactions: state.transactions,
        privacySettings: state.privacySettings,
      }),
    }
  )
);