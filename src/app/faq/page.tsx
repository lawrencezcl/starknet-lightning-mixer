import Link from 'next/link';
import { ArrowLeft, HelpCircle, Shield, Zap, Clock, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FAQPage() {
  const faqs = [
    {
      category: "Getting Started",
      icon: Zap,
      questions: [
        {
          q: "What is Starknet Lightning Mixer?",
          a: "Starknet Lightning Mixer is a privacy-enhancing service that allows you to mix your Starknet tokens using Lightning Network and Cashu e-cash technology. It breaks the on-chain link between your deposit and withdrawal addresses, providing enhanced financial privacy."
        },
        {
          q: "How does the mixing process work?",
          a: "1. You deposit Starknet tokens into our smart contract\n2. We convert them to Bitcoin via Lightning Network\n3. Your funds are mixed using Cashu e-cash for privacy\n4. The mixed funds are converted back to Starknet tokens\n5. You withdraw to your desired recipient address"
        },
        {
          q: "What do I need to start mixing?",
          a: "You need: \n• A Starknet wallet (like Argent or Braavos)\n• Starknet tokens (ETH, USDC, etc.)\n• Small amount for gas fees\n• 5-10 minutes for the mixing process"
        }
      ]
    },
    {
      category: "Privacy & Security",
      icon: Shield,
      questions: [
        {
          q: "How is my privacy guaranteed?",
          a: "We use multiple layers of privacy protection:\n• Lightning Network for off-chain transactions\n• Cashu e-cash for cryptographic anonymity\n• Random delays and transaction splitting\n• No personal data collection or storage"
        },
        {
          q: "Are my funds safe during mixing?",
          a: "Yes. Our system is designed with multiple security measures:\n• Smart contracts with time-locked withdrawals\n• Multi-signature security controls\n• Emergency pause mechanisms\n• Regular security audits"
        },
        {
          q: "What data is collected about me?",
          a: "We are privacy-first and collect minimal data:\n• Transaction hashes (public blockchain data)\n• Timestamps for processing\n• No personal information, IP addresses, or wallet tracking"
        }
      ]
    },
    {
      category: "Technical",
      icon: Clock,
      questions: [
        {
          q: "How long does mixing take?",
          a: "The typical mixing time is 5-10 minutes, depending on:\n• Network congestion on Starknet\n• Lightning Network conditions\n• Amount being mixed\n• Current mixer load"
        },
        {
          q: "What are the minimum and maximum amounts?",
          a: "• Minimum: 0.01 ETH or equivalent\n• Maximum: 10 ETH or equivalent\n• Larger amounts are automatically split into multiple transactions"
        },
        {
          q: "Which tokens are supported?",
          a: "Currently supported:\n• ETH (Ethereum)\n• USDC (USD Coin)\n• USDT (Tether)\n• Major Starknet tokens\n• More tokens added regularly"
        }
      ]
    },
    {
      category: "Fees & Costs",
      icon: Wallet,
      questions: [
        {
          q: "What are the fees for mixing?",
          a: "Our fee structure is simple and transparent:\n• Mixer fee: 0.3% of the mixed amount\n• Lightning Network fees: ~0.01%\n• Starknet gas fees: Variable\n• No hidden fees or charges"
        },
        {
          q: "Who pays for gas fees?",
          a: "You pay gas fees for:\n• Initial deposit transaction\n• Final withdrawal transaction\n• All intermediate fees are covered by the mixer service"
        }
      ]
    }
  ];

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Find answers to common questions about the Starknet Lightning Mixer.
        </p>
      </div>

      <div className="grid gap-6">
        {faqs.map((category, index) => {
          const Icon = category.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <div key={faqIndex} className="border rounded-lg p-4">
                      <h4 className="font-medium text-primary mb-2">{faq.q}</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Still have questions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Still have questions?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
          </p>
          <div className="flex gap-4">
            <Link href="/support">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Contact Support
              </button>
            </Link>
            <Link href="/guides">
              <button className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md">
                View Guides
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}