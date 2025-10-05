'use client';

// Mock implementations for Starknet React hooks that have compatibility issues
import { useCallback, useState } from 'react';

interface MockAccount {
  address: string | undefined;
  isConnected: boolean;
}

interface MockConnector {
  id: string;
  name: string;
}

export function useAccount(): MockAccount {
  // Return mock account state
  return {
    address: undefined,
    isConnected: false,
  };
}

export function useConnect() {
  const [isLoading, setIsLoading] = useState(false);

  const connect = useCallback(async (connector: MockConnector) => {
    setIsLoading(true);
    // Mock connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  return {
    connect,
    connectors: [
      { id: 'argent-x', name: 'Argent X' },
      { id: 'braavos', name: 'Braavos' },
    ] as MockConnector[],
    isLoading,
  };
}

export function useDisconnect() {
  const [isLoading, setIsLoading] = useState(false);

  const disconnect = useCallback(async () => {
    setIsLoading(true);
    // Mock disconnection delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
  }, []);

  return {
    disconnect,
    isLoading,
  };
}

export function useContract() {
  // Mock contract hook
  return {
    contract: null,
    isLoading: false,
    error: null,
  };
}