import { createClient } from "@supabase/supabase-js";

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

