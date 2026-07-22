import { AdminTopBar, AdminPageHead, ConfigBanner, EmptyRow } from "@/components/admin/AdminUi";
import { MarkAttendanceForm } from "@/components/admin/OpsForms";
import { AttendanceRosterForm } from "@/components/admin/TeachingForms";
import { listAttendance, listSessions } from "@/lib/admin/ops";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export default async function AdminAttendancePage() {
  const configured = isAdminClientConfigured();
  const [attendance, sessions] = configured
    ? await Promise.all([listAttendance(), listSessions()])
    : [[], []];

  return (
    <>
      <AdminTopBar section="Attendance" title="Attendance" />
      <div className="content">
        <AdminPageHead
          title="Attendance"
          lede="Mark one learner or paste a whole roster for a session."
        />
        <ConfigBanner ok={configured} />

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Mark one</h3>
              <small>Single student</small>
            </div>
          </div>
          <MarkAttendanceForm sessions={sessions} />
        </section>

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Roster mark</h3>
              <small>email[,status] per line — present · absent · late · excused</small>
            </div>
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            <AttendanceRosterForm sessions={sessions.map((s) => ({ id: s.id, title: s.title }))} />
          </div>
        </section>

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>Attendance log</h3>
              <small>{attendance.length} records</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <EmptyRow cols={4} message="No attendance records yet." />
              ) : (
                attendance.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="who">
                        <div className="ini">
                          {(row.student_name || row.student_email).slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p>{row.student_name || row.student_email.split("@")[0]}</p>
                          <span>{row.student_email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{row.class_title || "—"}</td>
                    <td><span className="cla-pill">{row.status}</span></td>
                    <td>
                      {row.class_start
                        ? new Date(row.class_start).toLocaleString()
                        : "—"}
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
