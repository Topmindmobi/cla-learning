"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AccountState = {
  error?: string;
  message?: string;
};

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}

export async function updateProfile(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await getSessionProfile();
  if (!session) redirect("/login");

  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) return { error: "Full name is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq("id", session.userId);

  if (error) return { error: error.message };

  revalidatePath("/account");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/instructor");
  return { message: "Profile updated." };
}

export async function updatePassword(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await getSessionProfile();
  if (!session) redirect("/login");

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { message: "Password updated." };
}
