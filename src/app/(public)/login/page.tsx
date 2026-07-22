"use client";

import { useActionState, useState } from "react";
import { authenticate, type AuthState } from "./actions";

const initial: AuthState = {};

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [state, formAction, pending] = useActionState(authenticate, initial);

  return (
    <section style={{ padding: "78px 0" }}>
      <div className="cla-wrap" style={{ maxWidth: 440 }}>
        <span className="mono eyebrow">Account</span>
        <h1 style={{ fontSize: 32, marginTop: 10 }}>
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>
          Access your dashboard, courses, and account settings.
        </p>

        <form action={formAction} style={{ marginTop: 32, display: "grid", gap: 16 }}>
          <input type="hidden" name="mode" value={mode} />
          <div>
            <label htmlFor="email" style={{ fontSize: 14, fontWeight: 500 }}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              style={{ width: "100%", height: 44, marginTop: 6, border: "1px solid var(--line)", borderRadius: 10, padding: "0 14px", font: "inherit" }}
            />
          </div>
          <div>
            <label htmlFor="password" style={{ fontSize: 14, fontWeight: 500 }}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              style={{ width: "100%", height: 44, marginTop: 6, border: "1px solid var(--line)", borderRadius: 10, padding: "0 14px", font: "inherit" }}
            />
          </div>
          {state.error && (
            <p style={{ background: "#fef2f2", color: "#991b1b", padding: "10px 14px", borderRadius: 10, fontSize: 14 }}>
              {state.error}
            </p>
          )}
          {state.message && (
            <p style={{ background: "var(--wash)", padding: "10px 14px", borderRadius: 10, fontSize: 14 }}>
              {state.message}
            </p>
          )}
          <button type="submit" disabled={pending} className="cla-btn primary" style={{ width: "100%", textAlign: "center" }}>
            {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="cla-link"
          style={{ marginTop: 16, background: "none", border: "none", cursor: "pointer" }}
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </section>
  );
}
