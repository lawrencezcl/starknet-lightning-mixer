'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAccount } from '@/lib/starknet-mock';
import { useMixer } from '@/hooks/useMixer';
import { SUPPORTED_TOKENS } from '@/lib/constants';
import { formatTokenAmount, calculateFee, calculateNetAmount } from '@/lib/utils';
import { Coins, Zap, Shield } from 'lucide-react';

interface DepositFormProps {
  onSuccess?: (transactionId: string) => void;
}

export function DepositForm({ onSuccess }: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('STRK');
  const [recipient, setRecipient] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { deposit } = useMixer();
  const { address, isConnected } = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const selectedToken = SUPPORTED_TOKENS[token as keyof typeof SUPPORTED_TOKENS];
    if (!selectedToken) {
      setError('Please select a valid token');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < selectedToken.minAmount || amountNum > selectedToken.maxAmount) {
      setError(`Amount must be between ${selectedToken.minAmount} and ${selectedToken.maxAmount} ${token}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const transactionId = await deposit({
        token,
        amount: amountNum,
        recipient: recipient || address,
      });

      onSuccess?.(transactionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedToken = SUPPORTED_TOKENS[token as keyof typeof SUPPORTED_TOKENS];
  const amountNum = parseFloat(amount) || 0;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>Privacy Mix</span>
          <Badge variant="secondary" className="ml-auto">
            <Shield className="h-3 w-3 mr-1" />
            Private
          </Badge>
        </CardTitle>
        <CardDescription>
          Mix your funds privately using Lightning Network and Cashu e-cash
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token Selection */}
          <div className="space-y-2">
            <Label htmlFor="token">Token</Label>
            <Select value={token} onValueChange={setToken}>
              <SelectTrigger>
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SUPPORTED_TOKENS).map(([symbol, info]) => (
                  <SelectItem key={symbol} value={symbol}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <Coins className="h-4 w-4" />
                        <span>{symbol}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {(info.feeRate * 100).toFixed(1)}% fee
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min={selectedToken?.minAmount}
              max={selectedToken?.maxAmount}
              placeholder={`Min: ${selectedToken?.minAmount}, Max: ${selectedToken?.maxAmount}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {selectedToken && (
              <p className="text-xs text-muted-foreground">
                Min: {selectedToken.minAmount} {token}, Max: {selectedToken.maxAmount} {token}
              </p>
            )}
          </div>

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address (Optional)</Label>
            <Input
              id="recipient"
              type="text"
              placeholder="Leave empty to use your connected wallet address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              If you want to send to a different address, enter it here.
              Otherwise, funds will be returned to your connected wallet.
            </p>
          </div>

          {/* Fee Calculation */}
          {selectedToken && amountNum > 0 && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Fee Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Deposit Amount:</span>
                  <span>{formatTokenAmount(amountNum, token)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mixing Fee:</span>
                  <span>{formatTokenAmount(calculateFee(amountNum, selectedToken.feeRate), token)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>You will Receive:</span>
                  <span>{formatTokenAmount(calculateNetAmount(amountNum, selectedToken.feeRate), token)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={!isConnected || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Processing...
              </>
            ) : isConnected ? (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Mix Funds Privately
              </>
            ) : (
              'Connect Wallet'
            )}
          </Button>

          {/* Privacy Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy Enhanced:</strong> Your transaction will be mixed using
              Lightning Network and Cashu e-cash to break the on-chain link between
              sender and receiver. No personal data is stored.
            </AlertDescription>
          </Alert>
        </form>
      </CardContent>
    </Card>
  );
}