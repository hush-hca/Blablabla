import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { metaMask, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "your-project-id";

export const config = createConfig({
  chains: [base],
  connectors: [
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

