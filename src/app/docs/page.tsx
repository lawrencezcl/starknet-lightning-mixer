import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DocsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Documentation</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Comprehensive documentation for developers and users.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Guide</CardTitle>
            <CardDescription>Learn how to use the mixer service</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm mb-4">
              <li>• Getting started guide</li>
              <li>• Connecting your wallet</li>
              <li>• Making your first mix</li>
              <li>• Understanding privacy scores</li>
            </ul>
            <Button variant="outline" className="w-full">View User Guide</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Developer API</CardTitle>
            <CardDescription>Integrate with our service</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm mb-4">
              <li>• API endpoints</li>
              <li>• Authentication</li>
              <li>• Code examples</li>
              <li>• SDK documentation</li>
            </ul>
            <Button variant="outline" className="w-full">View API Docs</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
            <CardDescription>How our technology works</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm mb-4">
              <li>• Architecture overview</li>
              <li>• Smart contract details</li>
              <li>• Lightning Network integration</li>
              <li>• Security audits</li>
            </ul>
            <Button variant="outline" className="w-full">View Technical Docs</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Security information and best practices</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm mb-4">
              <li>• Security audit reports</li>
              <li>• Bug bounty program</li>
              <li>• Best practices</li>
              <li>• Incident response</li>
            </ul>
            <Button variant="outline" className="w-full">View Security Info</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}