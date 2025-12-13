import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { metaMask, walletConnect } from "wagmi/connectors";

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
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [selectedChain.id]: http(process.env.NEXT_PUBLIC_RPC_URL || defaultRpcUrl),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}




