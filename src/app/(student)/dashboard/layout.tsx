import { redirect } from "next/navigation";
import {
  initialsFromName,
  requireSession,
  roleLabel,
} from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import StudentShell from "@/components/student/StudentShell";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return <StudentShell>{children}</StudentShell>;
  }

  const session = await requireSession();
  if (session.profile.role === "admin" || session.profile.role === "super_admin" || session.profile.role === "finance") {
    redirect("/admin");
  }
  if (session.profile.role === "instructor") {
    redirect("/instructor");
  }

  const name = session.profile.full_name?.trim() || session.email.split("@")[0] || "Learner";
  const initials = initialsFromName(session.profile.full_name, session.email);

  return (
    <StudentShell
      initials={initials}
      name={name}
      email={session.email}
      roleLabel={roleLabel(session.profile.role)}
    >
      {children}
    </StudentShell>
  );
}
