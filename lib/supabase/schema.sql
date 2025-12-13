-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked to wallet addresses)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  farcaster_fid INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice messages table
CREATE TABLE IF NOT EXISTS voice_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  voice_url TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  payment_token TEXT NOT NULL, -- 'BLA', 'HUNT', or 'USDC'
  payment_amount TEXT NOT NULL,
  transaction_hash TEXT,
  farcaster_cast_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reactions table
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES voice_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, wallet_address, emoji)
);

-- BB Points (off-chain points)
CREATE TABLE IF NOT EXISTS bb_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL, -- 'reaction', 'conversion', etc.
  source_id UUID, -- reference to reaction or other source
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily claims table
CREATE TABLE IF NOT EXISTS daily_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  claim_date DATE NOT NULL,
  bb_points_converted INTEGER DEFAULT 0,
  top_message_reward INTEGER DEFAULT 0,
  total_claimed INTEGER NOT NULL,
  transaction_hash TEXT,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wallet_address, claim_date)
);

-- Top messages rewards (for tracking daily top 2)
CREATE TABLE IF NOT EXISTS top_message_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES voice_messages(id) ON DELETE CASCADE,
  reward_date DATE NOT NULL,
  rank INTEGER NOT NULL, -- 1 or 2
  reward_amount INTEGER NOT NULL,
  claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_voice_messages_created_at ON voice_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_messages_wallet ON voice_messages(wallet_address);
CREATE INDEX IF NOT EXISTS idx_reactions_message_id ON reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_reactions_wallet ON reactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_bb_points_wallet ON bb_points(wallet_address);
CREATE INDEX IF NOT EXISTS idx_daily_claims_wallet_date ON daily_claims(wallet_address, claim_date);
CREATE INDEX IF NOT EXISTS idx_top_message_rewards_date ON top_message_rewards(reward_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_messages_updated_at BEFORE UPDATE ON voice_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


