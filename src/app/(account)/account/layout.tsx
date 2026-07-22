import {
  homePathForRole,
  initialsFromName,
  requireSession,
  rolesLabel,
} from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import StudentShell from "@/components/student/StudentShell";
import AdminShell from "@/components/admin/AdminShell";
import InstructorShell from "@/components/instructor/InstructorShell";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return <StudentShell>{children}</StudentShell>;
  }

  const session = await requireSession();
  const name = session.profile.full_name?.trim() || session.email.split("@")[0] || "Account";
  const initials = initialsFromName(session.profile.full_name, session.email);
  const label = rolesLabel(session.profile);
  const home = homePathForRole(session.profile.role);

  if (home === "/instructor") {
    return (
      <InstructorShell initials={initials} name={name} roleLabel={label}>
        <div className="content">
          <div className="cla-account-page">{children}</div>
        </div>
      </InstructorShell>
    );
  }

  if (home === "/admin") {
    return (
      <AdminShell initials={initials} name={name} roleLabel={label}>
        <div className="content">
          <div className="cla-account-page">{children}</div>
        </div>
      </AdminShell>
    );
  }

  return (
    <StudentShell
      initials={initials}
      name={name}
      email={session.email}
      roleLabel={label}
      homeHref={home === "/dashboard" ? undefined : home}
      homeLabel={home === "/admin" ? "Admin" : home === "/instructor" ? "Instructor" : undefined}
    >
      <div className="wrap">
        <div className="cla-account-page" style={{ padding: "32px 0" }}>
          {children}
        </div>
      </div>
    </StudentShell>
  );
}
