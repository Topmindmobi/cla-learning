import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { AdminPageHead, AdminTopBar, ConfigBanner, EmptyRow } from "@/components/admin/AdminUi";
import { RoleConfigForm } from "@/components/admin/TeachingForms";

export default async function AdminRolesPage() {
  const configured = isAdminClientConfigured();
  let configs: { role: string; allowed_paths: string[]; notes: string | null }[] = [];
  if (configured) {
    const supabase = createAdminClient();
    const { data } = await supabase.from("role_configs").select("*").order("role");
    configs = (data ?? []).map((r) => ({
      role: r.role as string,
      allowed_paths: (r.allowed_paths as string[]) ?? [],
      notes: (r.notes as string | null) ?? null,
    }));
  }

  return (
    <>
      <AdminTopBar section="Roles" title="Role privileges" />
      <div className="content">
        <AdminPageHead
          title="Role privileges"
          lede="Declare which admin paths each role may use. Enforcement can be wired to the shell next — config is stored now."
        />
        <ConfigBanner ok={configured} />

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Save path allow-list</h3>
              <small>One path per line</small>
            </div>
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            <RoleConfigForm />
          </div>
        </section>

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>Saved configs</h3>
              <small>{configs.length}</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Paths</th>
              </tr>
            </thead>
            <tbody>
              {configs.length === 0 ? (
                <EmptyRow cols={2} message="No role configs yet." />
              ) : (
                configs.map((c) => (
                  <tr key={c.role}>
                    <td className="mono">{c.role}</td>
                    <td style={{ fontSize: 13 }}>{c.allowed_paths.join(", ") || "—"}</td>
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
