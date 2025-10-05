'use client';

import { WalletConnect } from './WalletConnect';

export function WalletConnectWrapper() {
  return <WalletConnect open={false} onOpenChange={() => {}} />;
}