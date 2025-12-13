"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ChatInterface } from "@/components/ChatInterface";
import { TopMessages } from "@/components/TopMessages";
import { ConnectWallet } from "@/components/ConnectWallet";
import Link from "next/link";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Blabla</h1>
          <p className="text-gray-400">Share your bear market feelings anonymously</p>
        </header>

        {!isConnected ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <ConnectWallet />
          </div>
        ) : (
          <>
            <TopMessages />
            <div className="mt-8">
              <ChatInterface walletAddress={address!} />
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/claim"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Claim Your BLA Tokens
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

