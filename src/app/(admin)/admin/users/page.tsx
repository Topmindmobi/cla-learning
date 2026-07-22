import Link from "next/link";
import { listAdminProfiles } from "@/lib/admin/data";
import { rolesLabel } from "@/lib/auth";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { RoleSelectForm } from "@/components/admin/AdminForms";

function initials(name: string | null, email: string) {
  const trimmed = name?.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default async function AdminUsersPage() {
  const configured = isAdminClientConfigured();
  const users = configured ? await listAdminProfiles() : [];

  return (
    <>
      <div className="topbar">
        <div className="crumbs">Admin / <b>Users &amp; roles</b></div>
        <div className="right">
          <Link href="/admin" className="cla-btn">Today</Link>
        </div>
      </div>
      <div className="content">
        <div className="pagehead">
          <div>
            <h1>Users &amp; roles</h1>
            <p>Manage account roles for learners, instructors and staff.</p>
          </div>
        </div>

        {!configured ? (
          <div className="attention">
            <b>Service role key missing</b>
            <span>· Add SUPABASE_SERVICE_ROLE_KEY in Render Environment, then redeploy.</span>
          </div>
        ) : null}

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>All accounts</h3>
              <small>{users.length} users</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Current role</th>
                <th>Joined</th>
                <th style={{ textAlign: "right" }}>Change role</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ color: "var(--muted)" }}>No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="who">
                        <div className="ini">{initials(user.full_name, user.email)}</div>
                        <div>
                          <p>{user.full_name?.trim() || user.email.split("@")[0]}</p>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{rolesLabel(user)}</td>
                    <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</td>
                    <td>
                      <RoleSelectForm userId={user.id} role={user.role} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
