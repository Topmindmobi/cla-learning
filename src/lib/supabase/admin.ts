import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl, isSupabaseConfigured } from "./config";

export function getServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function isAdminClientConfigured(): boolean {
  return isSupabaseConfigured() && Boolean(getServiceRoleKey());
}

/** Server-only Supabase client that bypasses RLS. Never import from client components. */
export function createAdminClient() {
  const url = getSupabaseUrl();
  const key = getServiceRoleKey();
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
