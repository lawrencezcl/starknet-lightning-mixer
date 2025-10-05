import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// Temporarily comment out StarknetConfig due to library compatibility issues
// import { StarknetConfig } from "@starknet-react/core";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WalletConnectWrapper } from "@/components/common/WalletConnectWrapper";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Starknet Lightning Privacy Mixer",
  description: "Privacy-enhanced token mixing on Starknet using Lightning Network and Cashu e-cash",
  keywords: "Starknet, Privacy, Mixer, Lightning, Cashu, DeFi",
  authors: [{ name: "Starknet Lightning Mixer Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WalletConnectWrapper />
          <Toaster />
        </div>
      </body>
    </html>
  );
}
