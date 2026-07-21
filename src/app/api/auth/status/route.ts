import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/config";

function supabaseHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "invalid_url";
  }
}

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
  const host = supabaseHost(url);

  if (host.includes("YOUR_PROJECT") || host.includes("placeholder") || host === "invalid_url") {
    return Response.json({
      ok: false,
      configured: false,
      reason: "placeholder_url",
      host,
      hint: "Replace YOUR_PROJECT with your real Supabase project ref from Settings → API.",
    });
  }

  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        Accept: "application/json",
        apikey: getSupabaseAnonKey(),
      },
      cache: "no-store",
    });
    return Response.json({
      ok: res.ok || res.status === 401 || res.status === 404,
      configured: true,
      status: res.status,
      host,
      hint: res.ok ? undefined : "Supabase responded but returned an unexpected status. Check the anon key.",
    });
  } catch {
    return Response.json({
      ok: false,
      configured: true,
      reason: "network_error",
      host,
      hint: `Cannot reach ${host}. Create a Supabase project or fix the project ref in Render → Environment → SUPABASE_URL.`,
    });
  }
}
