import Link from 'next/link';
import { ArrowLeft, Book } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function GuidesPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <Book className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">User Guides</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Step-by-step guides to help you get started with privacy mixing.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🚀 Getting Started</CardTitle>
            <CardDescription>New to privacy mixing? Start here.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2 mb-4">
              <li>Install a Starknet wallet (Argent or Braavos)</li>
              <li>Get testnet tokens from a faucet</li>
              <li>Connect your wallet to our mixer</li>
              <li>Start with a small test amount</li>
            </ol>
            <Button className="w-full">Start Guide</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔒 Your First Mix</CardTitle>
            <CardDescription>Learn how to make your first privacy mix</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2 mb-4">
              <li>Navigate to the Mix page</li>
              <li>Choose the amount and token</li>
              <li>Configure privacy settings</li>
              <li>Confirm and wait for completion</li>
            </ol>
            <Button className="w-full">View Guide</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⚡ Advanced Privacy</CardTitle>
            <CardDescription>Maximize your privacy with advanced techniques</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2 mb-4">
              <li>Use multiple smaller transactions</li>
              <li>Enable random delays</li>
              <li>Vary withdrawal addresses</li>
              <li>Understand privacy scores</li>
            </ol>
            <Button className="w-full">Advanced Guide</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🛡️ Security Best Practices</CardTitle>
            <CardDescription>Keep your funds safe while mixing</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2 mb-4">
              <li>Never share your private keys</li>
              <li>Use secure internet connections</li>
              <li>Verify transaction details carefully</li>
              <li>Start with small amounts</li>
            </ol>
            <Button className="w-full">Security Guide</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}