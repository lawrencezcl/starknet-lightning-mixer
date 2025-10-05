import Link from 'next/link';
import { ArrowLeft, Shield, Zap, Users, Code, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-4">About Starknet Lightning Mixer</h1>
        <p className="text-lg text-muted-foreground">
          A revolutionary privacy solution for Starknet users, combining Lightning Network speed with Cashu e-cash anonymity.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              We believe financial privacy is a fundamental human right. The Starknet Lightning Mixer is designed
              to provide users with maximum privacy while maintaining the efficiency and scalability of the Starknet
              ecosystem. By leveraging cutting-edge technologies like Lightning Network and Cashu e-cash, we offer
              a trustless, decentralized solution for financial privacy.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Key Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-primary" />
                <CardTitle>Lightning Fast</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete mixing transactions in minutes, not hours. Lightning Network enables near-instant
                privacy transactions with minimal fees.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>Maximum Privacy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Using Cashu e-cash technology, we break the on-chain link between sender and receiver,
                ensuring complete transaction anonymity.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Code className="h-6 w-6 text-primary" />
                <CardTitle>Trustless Design</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Built on smart contracts and cryptographic proofs. No custodial risks, no third-party
                dependencies. Your funds remain under your control.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle>Community Driven</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Open-source project with community governance. Regular audits and transparent development
                process ensure security and reliability.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Globe className="h-6 w-6 text-primary" />
                <CardTitle>Global Access</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Available to anyone with an internet connection. No geographic restrictions or
                discriminatory practices.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Layer</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Starknet for scalability and low fees</li>
                <li>• Cairo smart contracts for security</li>
                <li>• STARK proofs for verification</li>
                <li>• Account abstraction support</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Layer</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Lightning Network for instant transfers</li>
                <li>• Cashu e-cash for anonymity</li>
                <li>• Zero-knowledge proofs</li>
                <li>• Cryptographic mixing algorithms</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Our Team</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">
              We are a team of blockchain developers, privacy advocates, and security experts dedicated
              to advancing financial privacy on Starknet. Our contributors come from diverse backgrounds
              in cryptography, distributed systems, and financial technology.
            </p>
            <div className="flex gap-4">
              <Link href="/docs">
                <Button variant="outline">Documentation</Button>
              </Link>
              <Link href="/support">
                <Button variant="outline">Contact Us</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Experience Privacy?</h2>
        <p className="text-muted-foreground mb-6">
          Join thousands of users who have already taken control of their financial privacy.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/mix">
            <Button size="lg">Start Mixing</Button>
          </Link>
          <Link href="/guides">
            <Button variant="outline" size="lg">Learn More</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}