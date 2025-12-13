import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing env.NEXT_PUBLIC_SUPABASE_URL. Please create a .env.local file with your Supabase credentials. See SETUP.md for instructions."
  );
}

if (!supabaseServiceKey) {
  throw new Error(
    "Missing env.SUPABASE_SERVICE_ROLE_KEY. Please create a .env.local file with your Supabase credentials. See SETUP.md for instructions."
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});


