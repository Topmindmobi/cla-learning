import { AdminTopBar, AdminPageHead, ConfigBanner, EmptyRow } from "@/components/admin/AdminUi";
import { CreateSessionForm } from "@/components/admin/OpsForms";
import { listCourseOptions, listSessions } from "@/lib/admin/ops";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export default async function AdminSessionsPage() {
  const configured = isAdminClientConfigured();
  const [sessions, courses] = configured
    ? await Promise.all([listSessions(), listCourseOptions()])
    : [[], []];

  return (
    <>
      <AdminTopBar section="Live sessions" title="Live sessions" />
      <div className="content">
        <AdminPageHead
          title="Live sessions"
          lede="Schedule and manage live class sessions."
        />
        <ConfigBanner ok={configured} />

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Schedule session</h3>
              <small>Add a new live class session</small>
            </div>
          </div>
          <CreateSessionForm courses={courses} />
        </section>

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>Upcoming sessions</h3>
              <small>{sessions.length} sessions</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Start</th>
                <th>End</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <EmptyRow cols={6} message="No sessions scheduled yet." />
              ) : (
                sessions.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600 }}>{row.title}</p>
                        {row.meeting_url ? (
                          <a href={row.meeting_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
                            Join link
                          </a>
                        ) : null}
                      </div>
                    </td>
                    <td>{row.course_title || "—"}</td>
                    <td>{row.start_at ? new Date(row.start_at).toLocaleString() : "—"}</td>
                    <td>{row.end_at ? new Date(row.end_at).toLocaleString() : "—"}</td>
                    <td>{row.location || "—"}</td>
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
