import { isSupabaseConfigured, getSupabaseUrl } from "@/lib/supabase/config";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return Response.json({
      ok: false,
      configured: false,
      reason: "missing_env",
      hint: "Set SUPABASE_URL and SUPABASE_ANON_KEY on Render, then redeploy.",
    });
  }

  const url = getSupabaseUrl();
  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return Response.json({
      ok: res.ok,
      configured: true,
      status: res.status,
      url: url.replace(/https:\/\//, ""),
    });
  } catch {
    return Response.json({
      ok: false,
      configured: true,
      reason: "network_error",
      hint: "Supabase URL is set but unreachable. Check the project ref and that the project is not paused.",
    });
  }
}
