import { requireSession } from "@/lib/auth";
import { listLearnerAssignments } from "@/lib/student/portal";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { SubmitAssignmentForm } from "@/components/student/LearnerPortalForms";

export default async function AssignmentsPage() {
  const session = await requireSession();
  const rows = isAdminClientConfigured()
    ? await listLearnerAssignments(session.userId, session.email)
    : [];

  return (
    <div className="wrap">
      <div className="hello" style={{ marginBottom: 22 }}>
        <div>
          <div className="mono eyebrow">Coursework</div>
          <h1>
            My <span className="serif">assignments</span>
          </h1>
        </div>
      </div>

      <section className="cla-card" style={{ padding: 20, marginBottom: 18 }}>
        <h3 style={{ marginTop: 0 }}>New submission</h3>
        <SubmitAssignmentForm />
      </section>

      {rows.length === 0 ? (
        <div className="cla-card" style={{ padding: 24 }}>
          <p style={{ margin: 0, color: "var(--muted)" }}>No assignments yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {rows.map((a) => (
            <article key={a.id} className="cla-card" style={{ padding: 18 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                <span className={`cla-pill ${a.status === "graded" ? "moss" : "amber"}`}>
                  {a.status}
                </span>
                {a.course_title ? <span className="cla-pill">{a.course_title}</span> : null}
                {a.grade != null ? (
                  <span className="cla-pill brand">
                    {a.grade}/{a.max_score}
                  </span>
                ) : null}
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>{a.assignment_title}</h3>
              {a.feedback ? (
                <p style={{ margin: "0 0 10px", fontSize: 14, color: "var(--muted)" }}>
                  Feedback: {a.feedback}
                </p>
              ) : null}
              {a.status !== "graded" ? (
                <SubmitAssignmentForm
                  id={a.id}
                  title={a.assignment_title}
                  courseId={a.course_id}
                  existingText={a.submission_text}
                />
              ) : a.submission_text ? (
                <p style={{ margin: 0, fontSize: 14, whiteSpace: "pre-wrap" }}>{a.submission_text}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
