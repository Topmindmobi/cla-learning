import { AdminTopBar, AdminPageHead, ConfigBanner, EmptyRow } from "@/components/admin/AdminUi";
import { CreateSessionForm } from "@/components/admin/OpsForms";
import { listCourseOptions, listSessions } from "@/lib/admin/ops";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export default async function AdminSessionsPage() {
  const configured = isAdminClientConfigured();
  const [sessions, courses] = configured
    ? await Promise.all([listSessions(), listCourseOptions()])
    : [[], []];

  const now = Date.now();
  const upcoming = sessions.filter((s) => !s.start_at || new Date(s.start_at).getTime() >= now - 3600_000);
  const past = sessions.filter((s) => s.start_at && new Date(s.start_at).getTime() < now - 3600_000);

  return (
    <>
      <AdminTopBar section="Timetable" title="Timetable" />
      <div className="content">
        <AdminPageHead
          title="Timetable"
          lede="Schedule live sessions. Meeting URL is optional — paste Zoom links manually without Zoom account setup."
        />
        <ConfigBanner ok={configured} />

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Schedule session</h3>
              <small>Title + start time required</small>
            </div>
          </div>
          <CreateSessionForm courses={courses} />
        </section>

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Upcoming</h3>
              <small>{upcoming.length}</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>When</th>
                <th>Where</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.length === 0 ? (
                <EmptyRow cols={5} message="No upcoming sessions." />
              ) : (
                upcoming.map((row) => (
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
                    <td>{row.location || "Online"}</td>
                    <td><span className="cla-pill">{row.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>Past</h3>
              <small>{past.length}</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>When</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {past.length === 0 ? (
                <EmptyRow cols={4} message="No past sessions." />
              ) : (
                past.map((row) => (
                  <tr key={row.id}>
                    <td>{row.title}</td>
                    <td>{row.course_title || "—"}</td>
                    <td>{row.start_at ? new Date(row.start_at).toLocaleString() : "—"}</td>
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
