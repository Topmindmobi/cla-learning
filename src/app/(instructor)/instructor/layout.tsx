import {
  initialsFromName,
  requireSession,
  roleLabel,
} from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import InstructorShell from "@/components/instructor/InstructorShell";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return <InstructorShell>{children}</InstructorShell>;
  }

  const session = await requireSession({
    roles: ["instructor", "admin", "super_admin"],
  });
  const name = session.profile.full_name?.trim() || session.email.split("@")[0] || "Instructor";
  const initials = initialsFromName(session.profile.full_name, session.email);

  return (
    <InstructorShell
      initials={initials}
      name={name}
      roleLabel={roleLabel(session.profile.role)}
    >
      {children}
    </InstructorShell>
  );
}
