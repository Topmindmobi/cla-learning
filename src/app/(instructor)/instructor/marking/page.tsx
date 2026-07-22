import { listAssignments } from "@/lib/admin/assessments";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { InstructorGradeForm } from "@/components/instructor/InstructorGradeForm";

export default async function InstructorMarkingPage() {
  const configured = isAdminClientConfigured();
  const rows = configured ? await listAssignments() : [];
  const pending = rows.filter((r) => r.status !== "graded");
  const graded = rows.filter((r) => r.status === "graded");

  return (
    <div className="content" style={{ padding: 24 }}>
      <div style={{ marginBottom: 22 }}>
        <div className="mono eyebrow">Assessment</div>
        <h1 style={{ margin: "6px 0 0", fontSize: 28 }}>Marking</h1>
        <p style={{ color: "var(--muted)", margin: "8px 0 0" }}>
          Grade learner assignment submissions. {pending.length} awaiting feedback.
        </p>
      </div>

      <section className="cla-card" style={{ marginBottom: 18, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
          <h3 style={{ margin: 0 }}>Queue</h3>
        </div>
        {pending.length === 0 ? (
          <p style={{ padding: 20, color: "var(--muted)", margin: 0 }}>Inbox clear.</p>
        ) : (
          <div style={{ display: "grid", gap: 0 }}>
            {pending.map((a) => (
              <div
                key={a.id}
                style={{ padding: 18, borderBottom: "1px solid var(--line)" }}
              >
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  <span className="cla-pill amber">{a.status}</span>
                  {a.course_title ? <span className="cla-pill">{a.course_title}</span> : null}
                </div>
                <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>{a.assignment_title}</h3>
                <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--muted)" }}>
                  {a.student_email}
                  {a.submitted_at
                    ? ` · ${new Date(a.submitted_at).toLocaleString("en-GB", { timeZone: "Africa/Kigali" })}`
                    : ""}
                </p>
                {a.submission_text ? (
                  <p
                    style={{
                      margin: "0 0 12px",
                      fontSize: 14,
                      whiteSpace: "pre-wrap",
                      background: "var(--wash)",
                      padding: 12,
                      borderRadius: 8,
                    }}
                  >
                    {a.submission_text}
                  </p>
                ) : null}
                <InstructorGradeForm id={a.id} maxScore={a.max_score} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="cla-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
          <h3 style={{ margin: 0 }}>Recently graded ({graded.length})</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
              <th style={{ padding: 12 }}>Assignment</th>
              <th style={{ padding: 12 }}>Student</th>
              <th style={{ padding: 12 }}>Grade</th>
            </tr>
          </thead>
          <tbody>
            {graded.slice(0, 20).map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: 12 }}>{a.assignment_title}</td>
                <td style={{ padding: 12 }}>{a.student_email}</td>
                <td style={{ padding: 12 }}>
                  {a.grade != null ? `${a.grade}/${a.max_score}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
