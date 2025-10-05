import Link from 'next/link';
import { ArrowLeft, MessageCircle, Mail, Github } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SupportPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-4">Support Center</h1>
        <p className="text-lg text-muted-foreground">
          Get help with the Starknet Lightning Mixer.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Live Chat
            </CardTitle>
            <CardDescription>Chat with our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Available Monday-Friday, 9AM-5PM UTC
            </p>
            <Button className="w-full">Start Chat</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Support
            </CardTitle>
            <CardDescription>Send us a detailed message</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Response within 24 hours
            </p>
            <Button variant="outline" className="w-full">Send Email</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              GitHub Issues
            </CardTitle>
            <CardDescription>Report technical issues</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              For bugs and feature requests
            </p>
            <Button variant="outline" className="w-full">View on GitHub</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
            <CardDescription>Find quick answers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Browse our frequently asked questions
            </p>
            <Link href="/faq">
              <Button variant="outline" className="w-full">View FAQ</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Common Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-1">Transaction stuck?</h4>
              <p className="text-sm text-muted-foreground">
                Check the transaction status on Starkscan. If stuck for more than 30 minutes, contact support.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-1">Wallet connection issues?</h4>
              <p className="text-sm text-muted-foreground">
                Try refreshing the page and reconnecting. Ensure your wallet is unlocked and on the correct network.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-1">Gas fees too high?</h4>
              <p className="text-sm text-muted-foreground">
                Gas fees vary with network congestion. Try mixing during off-peak hours or with smaller amounts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}