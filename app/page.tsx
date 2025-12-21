"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChatInterface } from "@/components/ChatInterface";
import { TopMessages } from "@/components/TopMessages";
import { Logo } from "@/components/Logo";
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
        <header className="mb-8 flex items-center justify-between">
          <div>
            <Logo size={48} className="mb-4" />
            <p className="text-gray-400">Share your bear market feelings anonymously</p>
          </div>
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </header>

        {/* Top Messages는 항상 표시 */}
        <TopMessages />

        {/* Chat Interface는 지갑 연결 후에만 표시 */}
        {isConnected ? (
          <>
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
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center mt-8">
            <p className="text-gray-400 mb-4">
              Connect your wallet to share your voice message
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}





