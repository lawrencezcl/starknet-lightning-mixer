import Link from 'next/link';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FeesPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Fees & Pricing</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Transparent and competitive fee structure for privacy mixing.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mixer Fees</CardTitle>
            <CardDescription>Simple and transparent pricing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Mixing Fee</div>
                  <div className="text-sm text-muted-foreground">Percentage of mixed amount</div>
                </div>
                <div className="text-2xl font-bold">0.3%</div>
              </div>

              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Lightning Network Fee</div>
                  <div className="text-sm text-muted-foreground">Off-chain transaction costs</div>
                </div>
                <div className="text-2xl font-bold">~0.01%</div>
              </div>

              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Starknet Gas Fees</div>
                  <div className="text-sm text-muted-foreground">Network transaction costs</div>
                </div>
                <div className="text-2xl font-bold">Variable</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Example Calculations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">1 ETH Mix</div>
                <div className="text-sm text-muted-foreground">
                  Mixer fee: 0.003 ETH + Gas fees (≈0.0001 ETH)
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">100 USDC Mix</div>
                <div className="text-sm text-muted-foreground">
                  Mixer fee: 0.3 USDC + Gas fees (≈1 USDC)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}