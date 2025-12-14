import { Address } from "viem";

// Determine network (testnet or mainnet)
const isTestnet = process.env.NEXT_PUBLIC_NETWORK === "testnet";

// Contract Addresses - supports both testnet and mainnet
export const HUNT_TOKEN: Address = (process.env.NEXT_PUBLIC_HUNT_TOKEN as Address) || 
  (isTestnet 
    ? "0x0000000000000000000000000000000000000000" // Testnet HUNT - deploy your own or use test token
    : "0x37f0c2915CeCcE7e977183B8543Fc0864d03e064C"); // Mainnet HUNT

export const USDC_TOKEN: Address = (process.env.NEXT_PUBLIC_USDC_TOKEN as Address) || 
  (isTestnet 
    ? "0x036CbD53842c5426634e7929541eC2318f3dCF7e" // Base Sepolia USDC test token
    : "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"); // Mainnet USDC

// BLA token address - needs to be set from Hunt.Town (mainnet) or deployed (testnet)
export const BLA_TOKEN: Address = (process.env.NEXT_PUBLIC_BLA_TOKEN as Address) || 
  "0x0000000000000000000000000000000000000000";

// Payment receiver address - MUST be set in environment variables
export const PAYMENT_RECEIVER_ADDRESS: Address | null = 
  (process.env.NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS as Address) || null;

// ERC20 ABI (minimal for transfer)
export const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
] as const;

// Payment configuration
export const POST_COSTS = {
  BLA: BigInt(process.env.NEXT_PUBLIC_POST_COST_BLA || "10") * BigInt(10 ** 18),
  HUNT: BigInt(process.env.NEXT_PUBLIC_POST_COST_HUNT || "5") * BigInt(10 ** 18),
  USDC: BigInt(process.env.NEXT_PUBLIC_POST_COST_USDC || "1") * BigInt(10 ** 6), // USDC has 6 decimals
};

export const REACTION_POINTS = parseInt(process.env.NEXT_PUBLIC_REACTION_POINTS || "100");
export const POINTS_TO_BLA_RATE = parseInt(process.env.NEXT_PUBLIC_POINTS_TO_BLA_RATE || "1000");




