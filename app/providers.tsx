"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { 
  metaMaskWallet,
  walletConnectWallet,
  phantomWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { config } from "@/lib/wagmi";
import { useState } from "react";

// 커스텀 지갑 리스트 - MetaMask를 항상 표시
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet, // MetaMask를 명시적으로 포함
        walletConnectWallet,
        phantomWallet,
      ],
    },
  ],
  {
    appName: "Blabla",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "your-project-id",
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          // 커스텀 connectors를 사용하여 MetaMask를 항상 표시
          connectors={connectors}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}





