import { requireSession } from "@/lib/auth";
import { listLearnerGrades } from "@/lib/student/portal";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export default async function GradesPage() {
  const session = await requireSession();
  const grades = isAdminClientConfigured()
    ? await listLearnerGrades(session.userId, session.email)
    : [];

  return (
    <div className="wrap">
      <div className="hello" style={{ marginBottom: 22 }}>
        <div>
          <div className="mono eyebrow">Assessment</div>
          <h1>
            My <span className="serif">grades</span>
          </h1>
        </div>
      </div>

      <section className="cla-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
              <th style={{ padding: 14 }}>Item</th>
              <th style={{ padding: 14 }}>Type</th>
              <th style={{ padding: 14 }}>Score</th>
              <th style={{ padding: 14 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {grades.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 24, color: "var(--muted)" }}>
                  No quiz or assignment grades yet.
                </td>
              </tr>
            ) : (
              grades.map((g) => (
                <tr key={`${g.kind}-${g.id}`} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: 14 }}>
                    <strong>{g.title}</strong>
                    {g.when ? (
                      <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                        {new Date(g.when).toLocaleString("en-GB", { timeZone: "Africa/Kigali" })}
                      </div>
                    ) : null}
                  </td>
                  <td style={{ padding: 14 }}>
                    <span className="cla-pill">{g.kind}</span>
                  </td>
                  <td style={{ padding: 14 }}>
                    {g.percent != null ? `${g.percent}%` : "—"}
                    {g.score != null ? (
                      <span style={{ color: "var(--muted)", marginLeft: 6 }}>
                        ({g.score}/{g.max})
                      </span>
                    ) : null}
                  </td>
                  <td style={{ padding: 14 }}>
                    <span
                      className={`cla-pill ${
                        g.status === "passed" || g.status === "graded" ? "moss" : "amber"
                      }`}
                    >
                      {g.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
