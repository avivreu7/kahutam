/**
 * Admin Supabase client (service_role key).
 * NEVER import this in Client Components or expose to the browser.
 * Use only inside Server Actions and API Routes to bypass RLS.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
}

export const adminSupabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
