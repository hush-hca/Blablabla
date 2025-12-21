"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export function ConnectWallet() {
  const { isConnected } = useAccount();

  if (isConnected) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
      <div className="flex justify-center">
        <ConnectButton />
      </div>
    </div>
  );
}





