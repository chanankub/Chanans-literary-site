import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  if (!client) {
    client = createClient(
      url,
      anonKey,
      {
        auth: {
          detectSessionInUrl: true,
          persistSession: true,
          flowType: "pkce",
        },
      },
    );
  }
  return client;
}
