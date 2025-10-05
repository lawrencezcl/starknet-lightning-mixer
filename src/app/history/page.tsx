'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccount } from '@/lib/starknet-mock';

// Mock transaction data
const mockTransactions = [
  {
    id: '0x1234567890abcdef',
    type: 'deposit',
    amount: '0.5',
    token: 'ETH',
    status: 'completed',
    timestamp: new Date('2024-01-15T10:30:00'),
    txHash: '0xabcdef1234567890',
    privacyScore: 95
  },
  {
    id: '0x2345678901bcdef1',
    type: 'withdraw',
    amount: '0.48',
    token: 'ETH',
    status: 'completed',
    timestamp: new Date('2024-01-15T11:45:00'),
    txHash: '0xbcdef12345678901',
    privacyScore: 95
  },
  {
    id: '0x3456789012cdef23',
    type: 'deposit',
    amount: '100',
    token: 'USDC',
    status: 'processing',
    timestamp: new Date('2024-01-16T09:15:00'),
    txHash: '0xcdef23456789012',
    privacyScore: 92
  },
  {
    id: '0x4567890123def345',
    type: 'deposit',
    amount: '1.0',
    token: 'ETH',
    status: 'failed',
    timestamp: new Date('2024-01-14T14:20:00'),
    txHash: '0xdef34567890123',
    privacyScore: 0,
    error: 'Insufficient gas fees'
  }
];

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'processing':
      return <Clock className="h-4 w-4 text-blue-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
    case 'processing':
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Processing</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export default function HistoryPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('all');

  const filteredTransactions = mockTransactions.filter(tx => {
    if (activeTab === 'all') return true;
    return tx.type === activeTab;
  });

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-4">Transaction History</h1>
        <p className="text-lg text-muted-foreground">
          View your complete mixing transaction history and privacy scores.
        </p>
      </div>

      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to view your transaction history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Connect Wallet</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  {mockTransactions.filter(tx => tx.status === 'completed').length}
                </div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {mockTransactions.filter(tx => tx.status === 'processing').length}
                </div>
                <p className="text-sm text-muted-foreground">Processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {mockTransactions
                    .filter(tx => tx.status === 'completed')
                    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
                    .toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">Total Mixed</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {mockTransactions
                    .filter(tx => tx.privacyScore > 0)
                    .reduce((sum, tx) => sum + tx.privacyScore, 0) /
                    Math.max(mockTransactions.filter(tx => tx.privacyScore > 0).length, 1) | 0}%
                </div>
                <p className="text-sm text-muted-foreground">Avg Privacy Score</p>
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                Your recent mixing transactions and their current status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="deposit">Deposits</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdrawals</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No transactions found.</p>
                      <Link href="/mix">
                        <Button>Start Mixing</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTransactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            {getStatusIcon(tx.status)}
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium capitalize">{tx.type}</span>
                                <span className="text-lg font-semibold">
                                  {tx.amount} {tx.token}
                                </span>
                                {getStatusBadge(tx.status)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {tx.timestamp.toLocaleString()}
                              </div>
                              {tx.error && (
                                <div className="text-sm text-red-600 mt-1">
                                  {tx.error}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {tx.privacyScore > 0 && (
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  Privacy Score
                                </div>
                                <div className="text-lg font-semibold text-green-600">
                                  {tx.privacyScore}%
                                </div>
                              </div>
                            )}
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}