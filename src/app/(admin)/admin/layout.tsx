import {
  initialsFromName,
  requireSession,
  rolesLabel,
} from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return <AdminShell>{children}</AdminShell>;
  }

  const session = await requireSession({
    roles: ["admin", "super_admin", "finance"],
  });
  const name = session.profile.full_name?.trim() || session.email.split("@")[0] || "Admin";
  const initials = initialsFromName(session.profile.full_name, session.email);

  return (
    <AdminShell
      initials={initials}
      name={name}
      roleLabel={rolesLabel(session.profile)}
    >
      {children}
    </AdminShell>
  );
}
