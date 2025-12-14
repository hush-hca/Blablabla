import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Only check environment variables at runtime, not during build
// This prevents build-time errors when env vars are not set
function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing env.NEXT_PUBLIC_SUPABASE_URL. Please create a .env.local file with your Supabase credentials. See SETUP.md for instructions."
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY. Please create a .env.local file with your Supabase credentials. See SETUP.md for instructions."
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Create a proxy that validates env vars only when actually used (runtime, not build time)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

