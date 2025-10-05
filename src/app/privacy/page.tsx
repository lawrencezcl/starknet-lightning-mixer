import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Our commitment to your privacy and data protection.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We collect minimal data necessary for service operation:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Transaction hashes (public blockchain data)</li>
              <li>Processing timestamps</li>
              <li>Technical error logs (no personal information)</li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              We do NOT collect: personal information, IP addresses, wallet tracking, or browsing behavior.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Data is used exclusively for:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Processing your mixing transactions</li>
              <li>Improving service reliability</li>
              <li>Technical support (when requested)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Protection</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We implement strong security measures:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>End-to-end encryption</li>
              <li>No personal data storage</li>
              <li>Regular security audits</li>
              <li>GDPR and privacy law compliance</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}