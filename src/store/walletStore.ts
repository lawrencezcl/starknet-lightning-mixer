import { create } from 'zustand';
import { WalletInfo, StarknetNetwork } from '@/types/starknet';

interface WalletState {
  // Connection state
  isConnected: boolean;
  address: string | null;
  network: StarknetNetwork | null;
  connector: any | null;

  // Balance state
  balances: Record<string, string>;
  isLoadingBalance: boolean;

  // UI state
  showWalletModal: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Actions
  setConnected: (connected: boolean) => void;
  setAddress: (address: string | null) => void;
  setNetwork: (network: StarknetNetwork | null) => void;
  setConnector: (connector: any) => void;
  setBalances: (balances: Record<string, string>) => void;
  setLoadingBalance: (loading: boolean) => void;
  setShowWalletModal: (show: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setConnectionError: (error: string | null) => void;
  disconnect: () => void;
  reset: () => void;
}

const defaultNetwork: StarknetNetwork = {
  name: 'sepolia',
  chainId: '0x534e5f5345504f4c4941',
  rpcUrl: 'https://sepolia.starknet.io',
  blockExplorerUrl: 'https://sepolia.starkscan.io',
};

export const useWalletStore = create<WalletState>((set) => ({
  // Initial state
  isConnected: false,
  address: null,
  network: defaultNetwork,
  connector: null,
  balances: {},
  isLoadingBalance: false,
  showWalletModal: false,
  isConnecting: false,
  connectionError: null,

  // Actions
  setConnected: (connected) => set({ isConnected: connected }),

  setAddress: (address) => set({ address }),

  setNetwork: (network) => set({ network }),

  setConnector: (connector) => set({ connector }),

  setBalances: (balances) => set({ balances }),

  setLoadingBalance: (loading) => set({ isLoadingBalance: loading }),

  setShowWalletModal: (show) => set({ showWalletModal: show }),

  setConnecting: (connecting) => set({ isConnecting: connecting }),

  setConnectionError: (error) => set({ connectionError: error }),

  disconnect: () => set({
    isConnected: false,
    address: null,
    connector: null,
    balances: {},
    connectionError: null,
  }),

  reset: () => set({
    isConnected: false,
    address: null,
    network: defaultNetwork,
    connector: null,
    balances: {},
    isLoadingBalance: false,
    showWalletModal: false,
    isConnecting: false,
    connectionError: null,
  }),
}));