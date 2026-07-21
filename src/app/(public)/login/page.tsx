"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    if (!url || !key || url.includes("YOUR_PROJECT")) {
      setMessage("Supabase is not configured yet. Copy .env.local.example to .env.local and add your project keys.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      setMessage(error ? error.message : "Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else window.location.href = "/dashboard";
    }
    setLoading(false);
  }

  return (
    <section style={{ padding: "78px 0" }}>
      <div className="cla-wrap" style={{ maxWidth: 440 }}>
        <span className="mono eyebrow">Student login</span>
        <h1 style={{ fontSize: 32, marginTop: 10 }}>
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>Access your courses and learning dashboard.</p>

        <form onSubmit={handleSubmit} style={{ marginTop: 32, display: "grid", gap: 16 }}>
          <div>
            <label htmlFor="email" style={{ fontSize: 14, fontWeight: 500 }}>Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", height: 44, marginTop: 6, border: "1px solid var(--line)", borderRadius: 10, padding: "0 14px", font: "inherit" }} />
          </div>
          <div>
            <label htmlFor="password" style={{ fontSize: 14, fontWeight: 500 }}>Password</label>
            <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", height: 44, marginTop: 6, border: "1px solid var(--line)", borderRadius: 10, padding: "0 14px", font: "inherit" }} />
          </div>
          {message && <p style={{ background: "var(--wash)", padding: "10px 14px", borderRadius: 10, fontSize: 14 }}>{message}</p>}
          <button type="submit" disabled={loading} className="cla-btn primary" style={{ width: "100%", textAlign: "center" }}>
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>
        <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="cla-link" style={{ marginTop: 16, background: "none", border: "none", cursor: "pointer" }}>
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </section>
  );
}
