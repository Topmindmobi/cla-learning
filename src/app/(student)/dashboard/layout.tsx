import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/middleware";
import StudentShell from "@/components/student/StudentShell";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return <StudentShell initials="FK">{children}</StudentShell>;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let initials = "FK";
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  if (profile?.full_name) {
    const parts = profile.full_name.trim().split(/\s+/);
    initials = parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }

  return <StudentShell initials={initials}>{children}</StudentShell>;
}
