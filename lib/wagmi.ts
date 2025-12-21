import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { metaMask, walletConnect } from "wagmi/connectors";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "your-project-id";

// Determine which network to use (default: mainnet)
const isTestnet = process.env.NEXT_PUBLIC_NETWORK === "testnet";
const selectedChain = isTestnet ? baseSepolia : base;
const defaultRpcUrl = isTestnet 
  ? "https://sepolia.base.org" 
  : "https://mainnet.base.org";

export const config = createConfig({
  chains: [selectedChain],
  connectors: [
    // Farcaster mini-app connector를 첫 번째로 배치 (가장 높은 우선순위)
    // Farcaster 앱 내에서는 자동으로 연결되고, 브라우저에서는 다른 지갑으로 폴백
    farcasterMiniApp(),
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [selectedChain.id]: http(process.env.NEXT_PUBLIC_RPC_URL || defaultRpcUrl),
  } as Record<typeof selectedChain.id, ReturnType<typeof http>>,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}




