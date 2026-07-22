import { createClient } from "@supabase/supabase-js";
import ws from "ws";

/** Service-role client for Node scripts (Node 20 needs `ws` for realtime init). */
export function createServiceClient(url, serviceKey) {
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: ws },
  });
}
