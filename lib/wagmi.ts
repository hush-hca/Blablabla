import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { metaMaskWallet, walletConnectWallet, phantomWallet } from "@rainbow-me/rainbowkit/wallets";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "your-project-id";

// Determine which network to use (default: mainnet)
const isTestnet = process.env.NEXT_PUBLIC_NETWORK === "testnet";
const selectedChain = isTestnet ? baseSepolia : base;
const defaultRpcUrl = isTestnet 
  ? "https://sepolia.base.org" 
  : "https://mainnet.base.org";

// RainbowKit의 기본 지갑 리스트에 MetaMask를 명시적으로 포함
const wallets = [
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet, // MetaMask를 명시적으로 포함하여 항상 표시
      walletConnectWallet,
      phantomWallet,
    ],
  },
];

// RainbowKit connectors 생성
const rainbowKitConnectors = connectorsForWallets(wallets, {
  appName: "Blabla",
  projectId,
});

// Farcaster connector와 RainbowKit connectors를 결합
export const config = createConfig({
  chains: [selectedChain],
  connectors: [
    // Farcaster mini-app connector를 첫 번째로 배치 (가장 높은 우선순위)
    farcasterMiniApp(),
    // RainbowKit connectors (MetaMask 포함)
    ...rainbowKitConnectors,
  ],
  transports: {
    [selectedChain.id]: http(process.env.NEXT_PUBLIC_RPC_URL || defaultRpcUrl),
  } as Record<typeof selectedChain.id, ReturnType<typeof http>>,
  // Multi-injected provider discovery 활성화하여 모든 설치된 지갑 감지
  multiInjectedProviderDiscovery: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}




