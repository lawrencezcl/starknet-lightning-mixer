import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Starknet wallet
jest.mock('@starknet-react/core', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890123456789012345678901234',
    isConnected: true,
    connector: {
      available: true,
      name: 'Argent X',
    },
  }),
  useConnect: () => ({
    connect: jest.fn(),
    connectors: [
      {
        id: 'argentX',
        name: 'Argent X',
        available: true,
      },
    ],
  }),
  useDisconnect: () => ({
    disconnect: jest.fn(),
  }),
  useContractWrite: () => ({
    writeAsync: jest.fn(),
    isPending: false,
    error: null,
  }),
  useWaitForTransaction: () => ({
    data: { status: 'success' },
    isLoading: false,
    error: null,
  }),
}))

// Mock Sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))