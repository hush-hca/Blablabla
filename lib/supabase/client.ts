import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Singleton pattern to ensure API keys are properly included in all requests
// Lazy initialization to prevent SSR hydration errors
let supabaseClientInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  // Return existing instance if already created
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

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

  // Create singleton instance with proper configuration
  supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClientInstance;
}

// Use Proxy to lazy-initialize the client only when actually used
// This prevents SSR hydration errors by deferring client creation until runtime
// The client will only be created when accessed in client components
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    // Lazy initialization - only create client when actually accessed
    // This ensures the client is created on the client-side, not during SSR
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

