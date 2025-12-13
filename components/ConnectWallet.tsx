"use client";

import { useConnect, useAccount } from "wagmi";

export function ConnectWallet() {
  const { connectors, connect } = useConnect();
  const { isConnected } = useAccount();

  if (isConnected) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
      <div className="flex flex-col gap-3">
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Connect {connector.name}
          </button>
        ))}
      </div>
    </div>
  );
}

