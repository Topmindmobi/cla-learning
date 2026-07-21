"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AuthState = {
  error?: string;
  message?: string;
};

export async function authenticate(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Login is not configured yet. Add SUPABASE_URL and SUPABASE_ANON_KEY in Render → Environment, then redeploy.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const mode = String(formData.get("mode") ?? "signin");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const supabase = await createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };
      return { message: "Check your email to confirm your account." };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
  } catch {
    return {
      error:
        "Could not reach Supabase. Check that SUPABASE_URL is correct, the project is active, and Auth → URL Configuration includes https://cla-learning.onrender.com",
    };
  }

  redirect("/dashboard");
}
