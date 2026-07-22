import Link from "next/link";
import { getAdminStats, listAdminEnrollments, listAdminProfiles } from "@/lib/admin/data";
import { rolesLabel } from "@/lib/auth";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export default async function AdminTodayPage() {
  const configured = isAdminClientConfigured();
  const stats = configured ? await getAdminStats() : null;
  const recentUsers = configured ? (await listAdminProfiles()).slice(0, 6) : [];
  const recentEnrollments = configured ? (await listAdminEnrollments()).slice(0, 5) : [];
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <div className="topbar">
        <div className="crumbs">Admin / <b>Today</b></div>
        <div className="right">
          <Link href="/admin/students" className="cla-btn">Students</Link>
          <Link href="/admin/users" className="cla-btn primary">Manage users</Link>
        </div>
      </div>
      <div className="content">
        <div className="pagehead">
          <div>
            <h1>{today}</h1>
            <p>Live overview from your Supabase data — users, courses and enrollments.</p>
          </div>
        </div>

        {!configured ? (
          <div className="attention">
            <b>Admin data access needs SUPABASE_SERVICE_ROLE_KEY</b>
            <span>· Add it in Render → Environment, then redeploy.</span>
          </div>
        ) : null}

        <div className="kpis">
          <div className="cla-card kpi">
            <small>Student accounts</small>
            <b className="num">{stats?.studentCount ?? "—"}</b>
            <span className="trend up">{stats ? `${stats.staffCount} staff` : "Waiting for config"}</span>
          </div>
          <div className="cla-card kpi">
            <small>Published courses</small>
            <b className="num">{stats?.publishedCourses ?? "—"}</b>
            <span className="trend up">{stats ? `${stats.draftCourses} drafts` : "—"}</span>
          </div>
          <div className="cla-card kpi">
            <small>Active enrollments</small>
            <b className="num">{stats?.activeEnrollments ?? "—"}</b>
            <span className="trend up">Across all programmes</span>
          </div>
          <div className="cla-card kpi">
            <small>Quick actions</small>
            <b className="num" style={{ fontSize: 22 }}>Go</b>
            <span className="trend up">
              <Link href="/admin/courses">Courses</Link>
              {" · "}
              <Link href="/admin/users">Roles</Link>
            </span>
          </div>
        </div>

        <div className="cols">
          <section className="cla-card panel" style={{ marginBottom: 18 }}>
            <div className="ph">
              <div>
                <h3>Recent accounts</h3>
                <small>Newest signups and staff</small>
              </div>
              <Link href="/admin/users" className="cla-btn sm">All users</Link>
            </div>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ color: "var(--muted)" }}>No accounts yet.</td>
                  </tr>
                ) : (
                  recentUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div>
                          <p style={{ margin: 0 }}>{user.full_name?.trim() || user.email.split("@")[0]}</p>
                          <span style={{ color: "var(--muted)", fontSize: 12 }}>{user.email}</span>
                        </div>
                      </td>
                      <td>{rolesLabel(user)}</td>
                      <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          <section className="cla-card panel" style={{ marginBottom: 18 }}>
            <div className="ph">
              <div>
                <h3>Recent enrollments</h3>
                <small>Latest course joins</small>
              </div>
              <Link href="/admin/students" className="cla-btn sm">All students</Link>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Course</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ color: "var(--muted)" }}>No enrollments yet.</td>
                  </tr>
                ) : (
                  recentEnrollments.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div>
                          <p style={{ margin: 0 }}>{row.user_name?.trim() || row.user_email.split("@")[0] || "Learner"}</p>
                          <span style={{ color: "var(--muted)", fontSize: 12 }}>{row.user_email}</span>
                        </div>
                      </td>
                      <td>{row.course_title}</td>
                      <td><span className="cla-pill">{row.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </>
  );
}
