// Contract addresses
export const MIXER_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MIXER_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890123456789012345678901234'
export const ACCESS_CONTROL_ADDRESS = process.env.NEXT_PUBLIC_ACCESS_CONTROL_ADDRESS || '0x1234567890123456789012345678901234567890123456789012345678901234'

// Network configurations
export const STARKNET_NETWORKS = {
  mainnet: {
    name: 'mainnet' as const,
    chainId: '0x534e5f4d41494e',
    rpcUrl: 'https://rpc.mainnet.starknet.io',
    blockExplorerUrl: 'https://starkscan.io',
  },
  sepolia: {
    name: 'sepolia' as const,
    chainId: '0x534e5f5345504f4c4941',
    rpcUrl: 'https://sepolia.starknet.io',
    blockExplorerUrl: 'https://sepolia.starkscan.io',
  },
  goerli: {
    name: 'goerli' as const,
    chainId: '0x534e5f474f45524c49',
    rpcUrl: 'https://rpc.goerli.starknet.io',
    blockExplorerUrl: 'https://goerli.starkscan.io',
  },
}

// Token configurations
export const SUPPORTED_TOKENS = {
  STRK: {
    address: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    symbol: 'STRK',
    name: 'Starknet Token',
    decimals: 18,
    logoURI: '/tokens/strk.png',
    minAmount: 10,
    maxAmount: 10000,
    feeRate: 0.005, // 0.5%
  },
  ETH: {
    address: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    logoURI: '/tokens/eth.png',
    minAmount: 0.001,
    maxAmount: 100,
    feeRate: 0.003, // 0.3%
  },
  USDC: {
    address: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: '/tokens/usdc.png',
    minAmount: 100,
    maxAmount: 100000,
    feeRate: 0.002, // 0.2%
  },
}

// API endpoints
export const API_ENDPOINTS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://38.14.254.46:3002',
  MIXING: {
    DEPOSIT: '/api/mix/deposit',
    STATUS: (transactionId: string) => `/api/mix/status/${transactionId}`,
    HISTORY: '/api/mix/history',
  },
  LIGHTNING: {
    INVOICE: '/api/lightning/invoice',
    PAY: '/api/lightning/pay',
    STATUS: '/api/lightning/status',
  },
  CASHU: {
    MINT: '/api/cashu/mint',
    REDEEM: '/api/cashu/redeem',
    SPLIT: '/api/cashu/split',
  },
  ATOMIQ: {
    SWAP: '/api/atomiq/swap',
    QUOTE: '/api/atomiq/quote',
    STATUS: '/api/atomiq/status',
  },
}

// WebSocket configuration
export const WS_CONFIG = {
  URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://38.14.254.46:3002',
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 1000,
  PING_INTERVAL: 30000,
}

// Privacy settings presets
export const PRIVACY_PRESETS = {
  low: {
    privacyLevel: 'low' as const,
    delayHours: 0,
    splitIntoMultiple: false,
    splitCount: 1,
    useRandomAmounts: false,
  },
  medium: {
    privacyLevel: 'medium' as const,
    delayHours: 2,
    splitIntoMultiple: true,
    splitCount: 3,
    useRandomAmounts: true,
  },
  high: {
    privacyLevel: 'high' as const,
    delayHours: 6,
    splitIntoMultiple: true,
    splitCount: 5,
    useRandomAmounts: true,
  },
}

// Transaction limits
export const TRANSACTION_LIMITS = {
  MIN_AMOUNT: 0.001,
  MAX_AMOUNT: 1000000,
  MIN_DELAY_HOURS: 0,
  MAX_DELAY_HOURS: 24,
  MIN_SPLIT_COUNT: 2,
  MAX_SPLIT_COUNT: 10,
}

// Fee calculations
export const FEE_CONFIG = {
  BASE_FEE_RATE: 0.005, // 0.5%
  PRIVACY_MULTIPLIER: {
    low: 1.0,
    medium: 1.2,
    high: 1.5,
  },
  VOLUME_DISCOUNTS: [
    { threshold: 1000, discount: 0.1 }, // 10% discount for amounts > 1000
    { threshold: 10000, discount: 0.2 }, // 20% discount for amounts > 10000
    { threshold: 100000, discount: 0.3 }, // 30% discount for amounts > 100000
  ],
}

// Status configurations
export const TRANSACTION_STATUS_CONFIG = {
  pending: { color: 'gray', icon: 'clock', description: 'Transaction is pending' },
  confirmed: { color: 'yellow', icon: 'check-circle', description: 'Transaction confirmed on-chain' },
  processing: { color: 'blue', icon: 'loader', description: 'Privacy mixing in progress' },
  completed: { color: 'green', icon: 'check-circle', description: 'Privacy mixing completed' },
  failed: { color: 'red', icon: 'x-circle', description: 'Transaction failed' },
  refunded: { color: 'orange', icon: 'refresh-ccw', description: 'Transaction refunded' },
}

// UI constants
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 5000,
  MODAL_ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 500,
  POLLING_INTERVAL: 5000,
  REFRESH_INTERVAL: 30000,
}

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  INVALID_AMOUNT: 'Please enter a valid amount',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  TRANSACTION_FAILED: 'Transaction failed',
  NETWORK_ERROR: 'Network error, please try again',
  INVALID_ADDRESS: 'Invalid address format',
  TRANSACTION_TIMEOUT: 'Transaction timed out',
  LIGHTNING_ERROR: 'Lightning network error',
  CASHU_ERROR: 'Cashu mint error',
  ATOMIQ_ERROR: 'Atomiq swap error',
}

// Success messages
export const SUCCESS_MESSAGES = {
  TRANSACTION_INITIATED: 'Transaction initiated successfully',
  TRANSACTION_COMPLETED: 'Privacy mixing completed successfully',
  WALLET_CONNECTED: 'Wallet connected successfully',
  WALLET_DISCONNECTED: 'Wallet disconnected',
  SETTINGS_SAVED: 'Settings saved successfully',
  COPIED_TO_CLIPBOARD: 'Copied to clipboard',
}

// Local storage keys
export const STORAGE_KEYS = {
  PRIVACY_SETTINGS: 'starknet-mixer-privacy-settings',
  TRANSACTION_HISTORY: 'starknet-mixer-transactions',
  WALLET_PREFERENCES: 'starknet-mixer-wallet-preferences',
  UI_PREFERENCES: 'starknet-mixer-ui-preferences',
}

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_ADVANCED_PRIVACY: process.env.NEXT_PUBLIC_ENABLE_ADVANCED_PRIVACY === 'true',
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_TESTNET_ONLY: process.env.NEXT_PUBLIC_ENABLE_TESTNET_ONLY === 'true',
  ENABLE_BETA_FEATURES: process.env.NEXT_PUBLIC_ENABLE_BETA_FEATURES === 'true',
}