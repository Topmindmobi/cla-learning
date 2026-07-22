import Link from "next/link";
import { AdminTopBar, AdminPageHead, ConfigBanner, EmptyRow } from "@/components/admin/AdminUi";
import { listAtRiskStudents } from "@/lib/admin/ops";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

function initials(name: string | null, email: string) {
  const trimmed = name?.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase() || "ST";
}

export default async function AdminAtRiskPage() {
  const configured = isAdminClientConfigured();
  const students = configured ? await listAtRiskStudents() : [];

  return (
    <>
      <AdminTopBar section="At risk" title="At risk" />
      <div className="content">
        <AdminPageHead
          title="At risk"
          lede="Active enrollments below 40% progress that may need intervention."
        />
        <ConfigBanner ok={configured} />

        <div className="kpis" style={{ marginBottom: 18 }}>
          <div className="cla-card kpi">
            <small>At-risk learners</small>
            <b className="num">{students.length}</b>
            <span className="trend up">Below 40% progress</span>
          </div>
        </div>

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>Learners needing attention</h3>
              <small>{students.length} students</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Progress</th>
                <th>Last updated</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <EmptyRow cols={4} message="No at-risk students right now." />
              ) : (
                students.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="who">
                        <div className="ini">{initials(row.name, row.email)}</div>
                        <div>
                          <p>{row.name?.trim() || row.email.split("@")[0]}</p>
                          <span>{row.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{row.course_title}</td>
                    <td>
                      <div className={`prog-bar ${row.progress_percent < 30 ? "risk" : "low"}`}>
                        <i style={{ width: `${Math.min(100, row.progress_percent)}%` }} />
                      </div>
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>{row.progress_percent}%</span>
                    </td>
                    <td>
                      {row.updated_at
                        ? new Date(row.updated_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <p style={{ marginTop: 18, color: "var(--muted)", fontSize: 14 }}>
          Review enrollments on the{" "}
          <Link href="/admin/students">Students</Link> page to update status.
        </p>
      </div>
    </>
  );
}
