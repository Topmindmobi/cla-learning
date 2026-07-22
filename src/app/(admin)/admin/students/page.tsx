import Link from "next/link";
import { listAdminEnrollments, listStudentProfiles } from "@/lib/admin/data";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { EnrollmentStatusForm } from "@/components/admin/AdminForms";

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

export default async function AdminStudentsPage() {
  const configured = isAdminClientConfigured();
  const [students, enrollments] = configured
    ? await Promise.all([listStudentProfiles(), listAdminEnrollments()])
    : [[], []];

  return (
    <>
      <div className="topbar">
        <div className="crumbs">Admin / <b>Students</b></div>
        <div className="right">
          <Link href="/admin/users" className="cla-btn">Manage roles</Link>
        </div>
      </div>
      <div className="content">
        <div className="pagehead">
          <div>
            <h1>Students</h1>
            <p>Learner accounts and course enrollments.</p>
          </div>
        </div>

        {!configured ? (
          <div className="attention">
            <b>Service role key missing</b>
            <span>· Add SUPABASE_SERVICE_ROLE_KEY in Render Environment, then redeploy.</span>
          </div>
        ) : null}

        <div className="kpis" style={{ marginBottom: 18 }}>
          <div className="cla-card kpi">
            <small>Student accounts</small>
            <b className="num">{students.length}</b>
            <span className="trend up">Role = student</span>
          </div>
          <div className="cla-card kpi">
            <small>Enrollments</small>
            <b className="num">{enrollments.length}</b>
            <span className="trend up">All statuses</span>
          </div>
          <div className="cla-card kpi">
            <small>Active enrollments</small>
            <b className="num">{enrollments.filter((e) => e.status === "active").length}</b>
            <span className="trend up">In progress</span>
          </div>
        </div>

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Learner accounts</h3>
              <small>{students.length} students</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ color: "var(--muted)" }}>
                    No student accounts yet. New signups appear here with the student role.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="who">
                        <div className="ini">{initials(student.full_name, student.email)}</div>
                        <div>
                          <p>{student.full_name?.trim() || student.email.split("@")[0]}</p>
                          <span>{student.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td>{student.email}</td>
                    <td>{student.created_at ? new Date(student.created_at).toLocaleDateString() : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>Enrollments</h3>
              <small>Update status for active learning records</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Progress</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Update</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ color: "var(--muted)" }}>
                    No enrollments yet.
                  </td>
                </tr>
              ) : (
                enrollments.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="who">
                        <div className="ini">{initials(row.user_name, row.user_email)}</div>
                        <div>
                          <p>{row.user_name?.trim() || row.user_email.split("@")[0] || "Learner"}</p>
                          <span>{row.user_email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {row.course_slug ? (
                        <Link href={`/courses/${row.course_slug}`}>{row.course_title}</Link>
                      ) : (
                        row.course_title
                      )}
                    </td>
                    <td>
                      <div className={`prog-bar ${row.progress_percent < 30 ? "risk" : row.progress_percent < 60 ? "low" : ""}`}>
                        <i style={{ width: `${Math.min(100, row.progress_percent)}%` }} />
                      </div>
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>{row.progress_percent}%</span>
                    </td>
                    <td>
                      <span className="cla-pill">{row.status}</span>
                    </td>
                    <td>
                      <EnrollmentStatusForm enrollmentId={row.id} status={row.status} />
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
