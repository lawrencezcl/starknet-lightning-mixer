'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAccount, useConnect, useDisconnect } from '@/lib/starknet-mock';
import { useWalletStore } from '@/store/walletStore';
import { formatAddress } from '@/lib/utils';
import { Menu, X, Wallet, Settings, LogOut, Zap } from 'lucide-react';

export function Header() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { setShowWalletModal } = useWalletStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleConnect = () => {
    if (connectors.length > 0) {
      connect(connectors[0]);
    } else {
      setShowWalletModal(true);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Zap className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Starknet Mixer
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/mix" className="transition-colors hover:text-foreground/80">
              Mix
            </Link>
            <Link href="/history" className="transition-colors hover:text-foreground/80">
              History
            </Link>
            <Link href="/about" className="transition-colors hover:text-foreground/80">
              About
            </Link>
          </nav>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className="flex items-center space-x-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Zap className="h-6 w-6" />
                <span className="font-bold">Starknet Mixer</span>
              </Link>
              <nav className="flex flex-col space-y-3 pt-4">
                <Link
                  href="/mix"
                  className="text-sm font-medium transition-colors hover:text-foreground/80"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Mix
                </Link>
                <Link
                  href="/history"
                  className="text-sm font-medium transition-colors hover:text-foreground/80"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  History
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium transition-colors hover:text-foreground/80"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other header content can go here */}
          </div>

          {/* Wallet Connection */}
          {isConnected && address ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <Wallet className="h-4 w-4 mr-2" />
                  <span className="hidden sm:block">
                    {formatAddress(address, 6)}
                  </span>
                  <span className="sm:hidden">
                    {formatAddress(address, 4)}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Connected Wallet
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/wallet" className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Wallet Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDisconnect}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleConnect} className="w-full md:w-auto">
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          )}

          {/* Status Badge */}
          <Badge variant="outline" className="hidden md:flex">
            Testnet
          </Badge>
        </div>
      </div>
    </header>
  );
}