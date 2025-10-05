'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, Zap, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { DepositForm } from '@/components/mixer/DepositForm';
import { TransactionStatus } from '@/components/mixer/TransactionStatus';
import { useMixerStore } from '@/store/mixerStore';

export default function MixPage() {
  const { currentTransaction } = useMixerStore();
  const [showTransactionStatus, setShowTransactionStatus] = useState(false);

  const handleDepositSuccess = (transactionId: string) => {
    setShowTransactionStatus(true);
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold">Privacy Mixer</h1>
          <Badge variant="outline">Testnet</Badge>
        </div>
        <p className="text-lg text-muted-foreground">
          Mix your Starknet assets privately using Lightning Network and Cashu e-cash technology.
        </p>
      </div>

      {/* Important Notice */}
      <Card className="mb-8 border-yellow-200 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-yellow-800">Important Notice</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-yellow-700">
            This is a testnet version for demonstration purposes only. Do not use real funds.
            The mixer is currently in beta testing phase.
          </CardDescription>
        </CardContent>
      </Card>

      {/* Transaction Status */}
      {showTransactionStatus && currentTransaction && (
        <div className="mb-8">
          <TransactionStatus
            transactionId={currentTransaction.id}
            onCancel={() => setShowTransactionStatus(false)}
          />
        </div>
      )}

      {/* Main Mix Interface */}
      {!showTransactionStatus && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Deposit Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Mix
                </CardTitle>
                <CardDescription>
                  Deposit your Starknet tokens to begin the privacy mixing process.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DepositForm onSuccess={handleDepositSuccess} />
              </CardContent>
            </Card>
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Lightning Network integration</li>
                  <li>✓ Cashu e-cash technology</li>
                  <li>✓ Cryptographic unlinkability</li>
                  <li>✓ No personal data storage</li>
                  <li>✓ Trustless operation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Process Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Estimated Time:</span>
                    <span className="font-medium">5-10 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span className="font-medium">Lightning</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Privacy Level:</span>
                    <span className="font-medium">Maximum</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/guides">
                  <Button variant="outline" className="w-full">
                    View Guides
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button variant="ghost" className="w-full">
                    FAQ
                  </Button>
                </Link>
                <Link href="/support">
                  <Button variant="ghost" className="w-full">
                    Get Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}