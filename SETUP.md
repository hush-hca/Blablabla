# Blabla Setup Guide

## Prerequisites

1. Node.js 18+ and npm
2. Supabase account and project
3. WalletConnect Project ID (optional, for WalletConnect support)
4. BLA Token contract address from Hunt.Town

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the schema from `lib/supabase/schema.sql`
3. Create a storage bucket named `voice-messages` with public access
4. Get your Supabase URL and anon key from Settings > API

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Web3
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org

# Token Contracts (Base Mainnet)
NEXT_PUBLIC_HUNT_TOKEN=0x37f0c2915CeCcE7e977183B8543Fc0864d03e064C
NEXT_PUBLIC_BLA_TOKEN=your_bla_token_address_from_hunt_town
NEXT_PUBLIC_USDC_TOKEN=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# Payment Receiver (where payments go)
NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS=your_payment_receiver_address

# WalletConnect (optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Farcaster (optional - for sharing)
NEXT_PUBLIC_FARCASTER_DEVELOPER_MNEMONIC=your_farcaster_mnemonic
NEXT_PUBLIC_FARCASTER_APP_FID=your_app_fid

# App Configuration
NEXT_PUBLIC_POST_COST_BLA=10
NEXT_PUBLIC_POST_COST_HUNT=5
NEXT_PUBLIC_POST_COST_USDC=1
NEXT_PUBLIC_REACTION_POINTS=100
NEXT_PUBLIC_POINTS_TO_BLA_RATE=1000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Job (for Vercel or other cron services)
CRON_SECRET=your_random_secret_for_cron_authentication
```

## Step 4: Get BLA Token Address

1. Visit https://hunt.town/project/BLA
2. Get the token contract address
3. Add it to `NEXT_PUBLIC_BLA_TOKEN` in `.env.local`

## Step 5: Set Up Cron Job

### Option A: Vercel (Recommended)

If deploying to Vercel, the cron job is automatically configured via `vercel.json`. Make sure to:
1. Set the `CRON_SECRET` environment variable in Vercel
2. The cron will run daily at midnight UTC

### Option B: External Cron Service

Use a service like:
- GitHub Actions
- Cron-job.org
- EasyCron

Configure it to call:
```
GET https://your-domain.com/api/cron/daily-rewards
Authorization: Bearer YOUR_CRON_SECRET
```

Schedule: `0 0 * * *` (daily at midnight UTC)

## Step 6: Run the Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Step 7: Farcaster Integration (Optional)

For full Farcaster integration, follow the setup guide from:
https://github.com/cyh76507707/reviewme-opensource?tab=readme-ov-file#1-farcaster-mini-app-setup

**Note:** The Farcaster connector is currently omitted to avoid the `TypeError: farcasterMiniApp is not a function` issue. The app works with standard wallets (MetaMask, WalletConnect) first. Farcaster connector can be added later after core functionality is stable.

## Troubleshooting

### Database Issues
- Make sure all tables are created by running the schema SQL
- Check that the storage bucket `voice-messages` exists and is public

### Web3 Issues
- Ensure you're connected to Base mainnet
- Check that token contract addresses are correct
- Verify you have sufficient tokens for posting

### Cron Job Issues
- Verify the cron secret matches in both the cron service and environment variables
- Check the API route logs for errors


