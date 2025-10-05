'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMixerStore } from '@/store/mixerStore';
import { formatTokenAmount, formatDuration, formatAddress } from '@/lib/utils';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Zap,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface TransactionStatusProps {
  transactionId: string;
  onCancel?: () => void;
}

const statusConfig = {
  pending: {
    color: 'bg-gray-500',
    icon: Clock,
    label: 'Pending',
    description: 'Transaction is waiting to be confirmed on Starknet',
  },
  confirmed: {
    color: 'bg-yellow-500',
    icon: Loader2,
    label: 'Confirmed',
    description: 'Transaction confirmed, starting privacy mixing',
  },
  processing: {
    color: 'bg-blue-500',
    icon: Loader2,
    label: 'Processing',
    description: 'Privacy mixing in progress',
  },
  completed: {
    color: 'bg-green-500',
    icon: CheckCircle,
    label: 'Completed',
    description: 'Privacy mixing completed successfully',
  },
  failed: {
    color: 'bg-red-500',
    icon: AlertTriangle,
    label: 'Failed',
    description: 'Transaction failed or was cancelled',
  },
  refunded: {
    color: 'bg-orange-500',
    icon: RefreshCw,
    label: 'Refunded',
    description: 'Transaction was refunded due to failure',
  },
};

const mixingSteps = [
  { key: 'deposit', name: 'Deposit', description: 'Processing deposit on Starknet' },
  { key: 'swap', name: 'Swap', description: 'Swapping to Bitcoin' },
  { key: 'lightning', name: 'Lightning', description: 'Creating Lightning payment' },
  { key: 'cashu', name: 'Cashu Mint', description: 'Minting Cashu tokens' },
  { key: 'mixing', name: 'Privacy Mix', description: 'Applying privacy transformations' },
  { key: 'redeem', name: 'Redeem', description: 'Redeeming and swapping back' },
  { key: 'withdrawal', name: 'Withdrawal', description: 'Sending to recipient' },
];

export function TransactionStatus({ transactionId, onCancel }: TransactionStatusProps) {
  const { currentTransaction, transactions } = useMixerStore();
  const [timeElapsed, setTimeElapsed] = useState(0);

  const transaction = currentTransaction?.id === transactionId
    ? currentTransaction
    : transactions.find(t => t.id === transactionId);

  // Update elapsed time
  useEffect(() => {
    if (!transaction) return;

    const interval = setInterval(() => {
      setTimeElapsed(Date.now() - transaction.createdAt);
    }, 1000);

    return () => clearInterval(interval);
  }, [transaction]);

  if (!transaction) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Transaction not found
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = statusConfig[transaction.status];
  const Icon = config.icon;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className={`h-5 w-5 ${transaction.status === 'processing' ? 'animate-spin' : ''}`} />
            <span>Transaction Status</span>
          </div>
          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
            {config.label}
          </Badge>
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{transaction.progress || 0}%</span>
          </div>
          <Progress value={transaction.progress || 0} className="w-full" />
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Transaction Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono">{transaction.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span>{formatTokenAmount(transaction.amount, transaction.token)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee:</span>
                <span>{formatTokenAmount(transaction.fee, transaction.token)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">From:</span>
                <span className="font-mono">{formatAddress(transaction.from)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span className="font-mono">{formatAddress(transaction.to)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Timing</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(transaction.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Elapsed:</span>
                <span>{formatDuration(timeElapsed)}</span>
              </div>
              {transaction.completedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <span>{new Date(transaction.completedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium text-sm mb-2">Privacy Settings</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Level: {transaction.privacySettings.privacyLevel}
            </Badge>
            <Badge variant="outline">
              Delay: {transaction.privacySettings.delayHours}h
            </Badge>
            {transaction.privacySettings.splitIntoMultiple && (
              <Badge variant="outline">
                Split: {transaction.privacySettings.splitCount} outputs
              </Badge>
            )}
            {transaction.privacySettings.useRandomAmounts && (
              <Badge variant="outline">Random amounts</Badge>
            )}
          </div>
        </div>

        {/* Error Display */}
        {transaction.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{transaction.error}</AlertDescription>
          </Alert>
        )}

        {/* Transaction Hash */}
        {transaction.transactionHash && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Transaction Details</h4>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">{transaction.transactionHash}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const network = 'sepolia'; // This should come from transaction data
                  const explorerUrl = `https://sepolia.starkscan.io/tx/${transaction.transactionHash}`;
                  window.open(explorerUrl, '_blank');
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View on Explorer
              </Button>
            </div>
          </div>
        )}

        {/* Mixing Steps */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Mixing Steps</h4>
          <div className="space-y-2">
            {mixingSteps.map((step, index) => {
              const stepStatus = transaction.status === 'completed'
                ? 'completed'
                : transaction.status === 'failed'
                ? 'failed'
                : transaction.progress
                ? transaction.progress > (index + 1) * (100 / mixingSteps.length)
                  ? 'completed'
                  : transaction.progress > index * (100 / mixingSteps.length)
                  ? 'in-progress'
                  : 'pending'
                : 'pending';

              return (
                <div
                  key={step.key}
                  className={`flex items-center space-x-3 p-2 rounded-lg ${
                    stepStatus === 'completed' ? 'bg-green-50 border border-green-200' :
                    stepStatus === 'in-progress' ? 'bg-blue-50 border border-blue-200' :
                    stepStatus === 'failed' ? 'bg-red-50 border border-red-200' :
                    'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    stepStatus === 'completed' ? 'bg-green-500' :
                    stepStatus === 'in-progress' ? 'bg-blue-500' :
                    stepStatus === 'failed' ? 'bg-red-500' :
                    'bg-gray-300'
                  }`}>
                    {stepStatus === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                    {stepStatus === 'in-progress' && (
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    )}
                    {stepStatus === 'failed' && (
                      <AlertTriangle className="h-4 w-4 text-white" />
                    )}
                    {stepStatus === 'pending' && (
                      <Clock className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{step.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {stepStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <div className="flex space-x-2">
            {transaction.status === 'failed' && (
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
            {transaction.status === 'failed' && onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>

          {transaction.status === 'completed' && (
            <Button size="sm">
              <Zap className="h-4 w-4 mr-2" />
              New Mix
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}