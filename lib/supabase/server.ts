import { createClient } from "@supabase/supabase-js";

// Only check environment variables at runtime, not during build
// This prevents build-time errors when env vars are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Create client with empty strings if env vars are missing (will fail at runtime with proper error)
// This allows the build to succeed even without env vars
export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceKey || "placeholder-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Validate environment variables at runtime (not build time)
export function validateSupabaseEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error(
      "Missing env.NEXT_PUBLIC_SUPABASE_URL. Please create a .env.local file with your Supabase credentials. See SETUP.md for instructions."
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing env.SUPABASE_SERVICE_ROLE_KEY. Please create a .env.local file with your Supabase credentials. See SETUP.md for instructions."
    );
  }
}


