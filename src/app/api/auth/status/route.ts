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
    const key = getSupabaseAnonKey();
    // Prefer Auth settings — `/rest/v1/` root rejects anon keys on newer projects.
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: {
        Accept: "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: "no-store",
    });
    let message: string | undefined;
    try {
      const body = (await res.json()) as { message?: string; msg?: string; error?: string };
      message = body.message || body.msg || body.error;
    } catch {
      message = undefined;
    }
    return Response.json({
      ok: res.ok,
      configured: true,
      status: res.status,
      host,
      keyLen: key.length,
      message: res.ok ? undefined : message,
      hint: res.ok
        ? undefined
        : "Anon key was rejected. Set SUPABASE_ANON_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY from Supabase → Settings → API Keys → Legacy, then redeploy.",
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
