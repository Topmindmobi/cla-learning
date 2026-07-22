import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { listPublishedQuizzesForLearner } from "@/lib/student/quizzes";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export default async function MyQuizzesPage() {
  const session = await requireSession();
  const configured = isAdminClientConfigured();
  const quizzes = configured
    ? await listPublishedQuizzesForLearner(session.userId)
    : [];

  return (
    <div className="wrap">
      <div className="hello" style={{ marginBottom: 22 }}>
        <div>
          <div className="mono eyebrow">Assessments</div>
          <h1>
            My <span className="serif">quizzes</span>
          </h1>
          <p style={{ color: "var(--muted)", margin: "8px 0 0", maxWidth: "52ch" }}>
            Take published module quizzes, review scores, and track pass marks (default 70%).
          </p>
        </div>
      </div>

      {!configured ? (
        <div className="cla-card" style={{ padding: 24 }}>
          <p style={{ margin: 0, color: "var(--muted)" }}>Quiz data is not configured.</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="cla-card" style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0 }}>No live quizzes yet</h3>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>
            When an admin publishes a quiz under Assessments, it will show up here.
          </p>
        </div>
      ) : (
        <div className="grid3">
          {quizzes.map((q) => {
            const blocked =
              (!q.allow_retake && q.attempt_count > 0) ||
              (q.max_attempts != null && q.attempt_count >= q.max_attempts);
            return (
              <article key={q.id} className="cla-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  <span className="cla-pill">Pass {q.passing_score}%</span>
                  {q.last_passed ? <span className="cla-pill moss">Passed</span> : null}
                  {q.best_score != null ? (
                    <span className="cla-pill brand">Best {q.best_score}%</span>
                  ) : null}
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>{q.title}</h3>
                <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--muted)" }}>
                  {q.course_title ?? "General"} · {q.question_count} questions
                  {q.time_limit_minutes ? ` · ${q.time_limit_minutes} min` : ""}
                </p>
                {q.description ? (
                  <p
                    style={{
                      margin: "0 0 16px",
                      color: "var(--muted)",
                      fontSize: 14,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {q.description}
                  </p>
                ) : (
                  <div style={{ height: 8 }} />
                )}
                <Link
                  href={`/dashboard/quizzes/${q.id}`}
                  className={`cla-btn ${blocked ? "" : "primary"}`}
                >
                  {q.attempt_count === 0 ? "Start quiz" : blocked ? "View / locked" : "Retake"}
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
