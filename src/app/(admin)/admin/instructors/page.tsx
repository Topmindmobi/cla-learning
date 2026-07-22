import { AdminTopBar, AdminPageHead, ConfigBanner, EmptyRow } from "@/components/admin/AdminUi";
import { CreateInstructorForm } from "@/components/admin/OpsForms";
import { listInstructors } from "@/lib/admin/ops";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export default async function AdminInstructorsPage() {
  const configured = isAdminClientConfigured();
  const instructors = configured ? await listInstructors() : [];

  return (
    <>
      <AdminTopBar section="Instructors" title="Instructors" />
      <div className="content">
        <AdminPageHead
          title="Instructors"
          lede="Manage teaching staff and their availability."
        />
        <ConfigBanner ok={configured} />

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Add instructor</h3>
              <small>Register a new instructor profile</small>
            </div>
          </div>
          <CreateInstructorForm />
        </section>

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>Instructor roster</h3>
              <small>{instructors.length} instructors</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Title</th>
                <th>Availability</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {instructors.length === 0 ? (
                <EmptyRow cols={5} message="No instructors yet." />
              ) : (
                instructors.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="who">
                        <div className="ini">{row.full_name.slice(0, 2).toUpperCase()}</div>
                        <div>
                          <p>{row.full_name}</p>
                          {row.phone ? <span>{row.phone}</span> : null}
                        </div>
                      </div>
                    </td>
                    <td>{row.email}</td>
                    <td>{row.title || "—"}</td>
                    <td>{row.availability || "—"}</td>
                    <td><span className="cla-pill">{row.status}</span></td>
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
