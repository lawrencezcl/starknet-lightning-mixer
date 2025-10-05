'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useConnect, useAccount } from '@/lib/starknet-mock';
import { useWalletStore } from '@/store/walletStore';
import { ExternalLink, Wallet, AlertCircle } from 'lucide-react';

interface WalletConnectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletConnect({ open, onOpenChange }: WalletConnectProps) {
  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();
  const { setConnecting, setConnectionError } = useWalletStore();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleConnect = async (walletId: string) => {
    const wallet = connectors.find(c => c.id === walletId);
    if (!wallet) return;

    setSelectedWallet(walletId);
    setConnecting(true);
    setConnectionError(null);

    try {
      await connect(wallet);
      onOpenChange(false);
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setConnecting(false);
      setSelectedWallet(null);
    }
  };

  const walletInfo = [
    {
      id: 'argentX',
      name: 'Argent X',
      description: 'Popular Starknet wallet with mobile app',
      downloadUrl: 'https://argent.xyz/argent-x',
      icon: '🦾',
      recommended: true,
    },
    {
      id: 'braavos',
      name: 'Braavos',
      description: 'Secure Starknet wallet with advanced features',
      downloadUrl: 'https://braavos.app/',
      icon: '🔮',
      recommended: true,
    },
    {
      id: 'argent',
      name: 'Argent',
      description: 'Original Argent wallet for Starknet',
      downloadUrl: 'https://argent.xyz/',
      icon: '💼',
      recommended: false,
    },
    {
      id: 'webwallet',
      name: 'Web Wallet',
      description: 'Browser-based wallet for quick access',
      downloadUrl: '#',
      icon: '🌐',
      recommended: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to Starknet and start mixing tokens privately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isConnected && address && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are already connected with wallet {address.slice(0, 6)}...{address.slice(-4)}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-3">
            {walletInfo.map((wallet) => (
              <Card
                key={wallet.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedWallet === wallet.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleConnect(wallet.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <span className="text-lg">{wallet.icon}</span>
                      <span>{wallet.name}</span>
                      {wallet.recommended && (
                        <Badge variant="secondary" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm">
                    {wallet.description}
                  </CardDescription>
                  <div className="mt-2 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(wallet.downloadUrl, '_blank');
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      className="h-8"
                      disabled={selectedWallet === wallet.id}
                    >
                      <Wallet className="h-3 w-3 mr-1" />
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>New to Starknet?</strong> You will need a Starknet wallet to use this
              service. We recommend Argent X for the best experience.
            </AlertDescription>
          </Alert>

          <div className="text-center text-xs text-muted-foreground">
            By connecting your wallet, you agree to our{' '}
            <a href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}