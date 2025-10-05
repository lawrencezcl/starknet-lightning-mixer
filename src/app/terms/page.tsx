import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p>By using Starknet Lightning Mixer, you agree to these terms and conditions.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Service Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We provide a privacy mixing service for Starknet tokens using Lightning Network and Cashu e-cash technology.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. User Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use only legally obtained funds</li>
              <li>Comply with applicable laws</li>
              <li>Keep your wallet secure</li>
              <li>Understand the risks involved</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Limitations</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Service is provided &quot;as is&quot; without warranties. We are not responsible for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Network delays or failures</li>
              <li>Smart contract vulnerabilities</li>
              <li>Third-party service issues</li>
              <li>User error or negligence</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your privacy is important to us. Please review our Privacy Policy for details on data handling.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}