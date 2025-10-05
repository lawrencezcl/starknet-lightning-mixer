'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, ExternalLink, Settings, Shield, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAccount, useDisconnect } from '@/lib/starknet-mock';
import { useWalletStore } from '@/store/walletStore';
import { formatAddress } from '@/lib/utils';

export default function WalletPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { setShowWalletModal } = useWalletStore();
  const [privacySettings, setPrivacySettings] = useState({
    enhancedPrivacy: true,
    torNetwork: false,
    randomDelays: true,
    splitTransactions: true
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isConnected) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-4">Wallet Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to access wallet settings and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowWalletModal(true)}>
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-4">Wallet Settings</h1>
        <p className="text-lg text-muted-foreground">
          Manage your wallet connection and privacy preferences.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Connected Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">
                    {formatAddress(address, 8)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Starknet Testnet
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(address || '')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={`https://testnet.starkscan.co/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Network</div>
                  <div className="text-muted-foreground">Starknet Testnet</div>
                </div>
                <div>
                  <div className="font-medium">Status</div>
                  <div className="text-green-600">Connected</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/mix">
                <Button className="w-full">Start Mixing</Button>
              </Link>
              <Link href="/history">
                <Button variant="outline" className="w-full">View History</Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={disconnect}
              >
                Disconnect Wallet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Configure your privacy preferences for enhanced mixing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enhanced-privacy">Enhanced Privacy Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use additional privacy-enhancing features
                  </p>
                </div>
                <Switch
                  id="enhanced-privacy"
                  checked={privacySettings.enhancedPrivacy}
                  onCheckedChange={(checked) =>
                    setPrivacySettings(prev => ({ ...prev, enhancedPrivacy: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="tor-network">Tor Network</Label>
                  <p className="text-sm text-muted-foreground">
                    Route transactions through Tor for maximum anonymity
                  </p>
                </div>
                <Switch
                  id="tor-network"
                  checked={privacySettings.torNetwork}
                  onCheckedChange={(checked) =>
                    setPrivacySettings(prev => ({ ...prev, torNetwork: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="random-delays">Random Delays</Label>
                  <p className="text-sm text-muted-foreground">
                    Add random delays to transaction timing
                  </p>
                </div>
                <Switch
                  id="random-delays"
                  checked={privacySettings.randomDelays}
                  onCheckedChange={(checked) =>
                    setPrivacySettings(prev => ({ ...prev, randomDelays: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="split-transactions">Split Transactions</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically split large transactions into smaller amounts
                  </p>
                </div>
                <Switch
                  id="split-transactions"
                  checked={privacySettings.splitTransactions}
                  onCheckedChange={(checked) =>
                    setPrivacySettings(prev => ({ ...prev, splitTransactions: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Level</CardTitle>
              <CardDescription>
                Your current privacy score and recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {Object.values(privacySettings).filter(Boolean).length * 25}%
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Privacy Score
                </div>
                <Badge variant="outline">
                  {Object.values(privacySettings).filter(Boolean).length >= 3 ? 'High' : 'Standard'} Privacy
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                Advanced configuration options for experienced users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Network Configuration</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>RPC Endpoint: testnet.starknet.io</div>
                  <div>Chain ID: 0x534e5f4d41494e</div>
                  <div>Block Explorer: Starkscan</div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Mixer Settings</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Minimum Mix Amount: 0.01 ETH</div>
                  <div>Maximum Mix Amount: 10 ETH</div>
                  <div>Fee: 0.3%</div>
                  <div>Mixing Timeout: 30 minutes</div>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  Reset to Default Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}