import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DisclaimerPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">Disclaimer</h1>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Important Notice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              This service is currently in BETA testing mode. Do not use real funds or amounts you cannot afford to lose.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risks & Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-red-600">Financial Risk</h4>
                <p>Cryptocurrency mixing carries financial risks. You may lose funds due to technical issues, smart contract vulnerabilities, or other factors.</p>
              </div>

              <div>
                <h4 className="font-medium text-red-600">Legal Risk</h4>
                <p>Ensure compliance with your local laws. Some jurisdictions have regulations regarding cryptocurrency mixing services.</p>
              </div>

              <div>
                <h4 className="font-medium text-red-600">Technical Risk</h4>
                <p>The service relies on complex technologies including smart contracts, Lightning Network, and third-party services that may fail.</p>
              </div>

              <div>
                <h4 className="font-medium text-red-600">No Guarantee</h4>
                <p>We make no guarantees about privacy, timing, or successful completion of transactions.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testnet Only</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This version operates exclusively on Starknet testnet. All tokens have no real value and are used for testing purposes only.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Use at Your Own Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <p>By using this service, you acknowledge and accept all risks associated with cryptocurrency mixing. You are solely responsible for your decisions and actions.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Link href="/mix">
          <Button>I Understand the Risks</Button>
        </Link>
      </div>
    </div>
  );
}