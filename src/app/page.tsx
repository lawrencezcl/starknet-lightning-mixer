'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Shield, Clock, Wallet } from 'lucide-react';
import { DepositForm } from '@/components/mixer/DepositForm';
import { TransactionStatus } from '@/components/mixer/TransactionStatus';
import { useMixerStore } from '@/store/mixerStore';
import { useState } from 'react';

export default function Home() {
  const { currentTransaction } = useMixerStore();
  const [showTransactionStatus, setShowTransactionStatus] = useState(false);

  const handleDepositSuccess = (transactionId: string) => {
    setShowTransactionStatus(true);
  };

  return (
    <div className="container py-8">
      {/* Hero Section */}
      <section className="text-center py-12">
        <Badge className="mb-4" variant="secondary">
          Starknet Testnet
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight lg:text-6xl mb-6">
          Starknet Lightning
          <span className="text-primary"> Privacy Mixer</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Mix your Starknet assets privately using Lightning Network and Cashu e-cash.
          Break the on-chain link between sender and receiver with our trustless privacy solution.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/mix">
            <Button size="lg" className="gap-2">
              Start Mixing
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Transaction Status (shown when there's an active transaction) */}
      {showTransactionStatus && currentTransaction && (
        <section className="py-8">
          <TransactionStatus
            transactionId={currentTransaction.id}
            onCancel={() => setShowTransactionStatus(false)}
          />
        </section>
      )}

      {/* Quick Mix Form */}
      {!showTransactionStatus && (
        <section className="py-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Quick Mix
            </h2>
            <DepositForm onSuccess={handleDepositSuccess} />
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose Starknet Lightning Mixer?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Lightning Fast</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete mixing in minutes, not hours. Lightning Network enables near-instant
                transactions with minimal fees.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-primary" />
                <CardTitle>Privacy First</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Uses cryptographic techniques to break transaction links. No personal data
                is stored, and you control your privacy settings.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Wallet className="h-8 w-8 text-primary" />
                <CardTitle>Trustless</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Built on blockchain technology. No custodial risks, no third-party
                dependencies. Your funds remain under your control.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="font-semibold mb-2">Deposit</h3>
            <p className="text-sm text-muted-foreground">
              Deposit your Starknet tokens into our smart contract
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="font-semibold mb-2">Lightning</h3>
            <p className="text-sm text-muted-foreground">
              Convert to Bitcoin via Lightning Network for privacy
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="font-semibold mb-2">Mix</h3>
            <p className="text-sm text-muted-foreground">
              Apply privacy transformations using Cashu e-cash
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
              <span className="text-2xl font-bold text-primary">4</span>
            </div>
            <h3 className="font-semibold mb-2">Withdraw</h3>
            <p className="text-sm text-muted-foreground">
              Convert back to Starknet tokens and send to recipient
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Platform Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                $0M+
              </div>
              <p className="text-sm text-muted-foreground">
                Total Volume Mixed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                0
              </div>
              <p className="text-sm text-muted-foreground">
                Transactions Completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                <Clock className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-muted-foreground">
                Average Time: 5 min
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                <Shield className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-muted-foreground">
                100% Private
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Security */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Security & Trust
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Smart Contract Security</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Audited Cairo smart contracts</li>
                <li>✓ Multi-signature security</li>
                <li>✓ Emergency pause mechanisms</li>
                <li>✓ Transparent on-chain operations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ No personal data storage</li>
                <li>✓ Cryptographic unlinkability</li>
                <li>✓ Configurable privacy levels</li>
                <li>✓ User-controlled settings</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}