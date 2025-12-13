# Deployment Guide

## Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables from `.env.example`
4. Deploy

The cron job will automatically be set up via `vercel.json`.

## Environment Variables Checklist

Make sure to set these in your deployment platform:

### Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_BLA_TOKEN`
- `NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS`
- `NEXT_PUBLIC_APP_URL` (your production URL)

### Optional
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `CRON_SECRET` (for cron job authentication)
- Farcaster variables (if implementing full Farcaster integration)

## Supabase Storage Setup

1. Create a storage bucket named `voice-messages`
2. Set it to public
3. Configure CORS if needed for your domain

## Cron Job Setup

If not using Vercel, set up an external cron service to call:
```
GET https://your-domain.com/api/cron/daily-rewards
Authorization: Bearer YOUR_CRON_SECRET
```

Schedule: Daily at midnight UTC (`0 0 * * *`)

## Testing

1. Test wallet connection
2. Test voice recording and posting
3. Test payment flow (use testnet tokens if possible)
4. Test reactions and BB points
5. Test claim functionality
6. Test cron job manually by calling the API endpoint


