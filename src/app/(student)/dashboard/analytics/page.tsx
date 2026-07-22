import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { listLearnerGrades } from "@/lib/student/portal";
import { listPublishedQuizzesForLearner } from "@/lib/student/quizzes";
import { listPublishedLmsCourses, getPublishedLmsTree, progressPercent } from "@/lib/student/lms";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export default async function AnalyticsPage() {
  const session = await requireSession();
  const configured = isAdminClientConfigured();

  const [grades, quizzes, lmsCourses] = configured
    ? await Promise.all([
        listLearnerGrades(session.userId, session.email),
        listPublishedQuizzesForLearner(session.userId),
        listPublishedLmsCourses(),
      ])
    : [[], [], []];

  let avgQuiz = 0;
  const quizGrades = grades.filter((g) => g.kind === "quiz" && g.percent != null);
  if (quizGrades.length) {
    avgQuiz = Math.round(
      quizGrades.reduce((s, g) => s + (g.percent ?? 0), 0) / quizGrades.length,
    );
  }

  let lmsProgress = 0;
  if (lmsCourses[0]) {
    const tree = await getPublishedLmsTree(lmsCourses[0].id, session.userId);
    if (tree) lmsProgress = progressPercent(tree);
  }

  const passed = quizzes.filter((q) => q.last_passed).length;

  return (
    <div className="wrap">
      <div className="hello" style={{ marginBottom: 22 }}>
        <div>
          <div className="mono eyebrow">Insights</div>
          <h1>
            Learning <span className="serif">analytics</span>
          </h1>
        </div>
      </div>

      <div className="grid3" style={{ marginBottom: 18 }}>
        <div className="cla-card stat">
          <small>Avg quiz score</small>
          <b>{quizGrades.length ? `${avgQuiz}%` : "—"}</b>
        </div>
        <div className="cla-card stat">
          <small>Quizzes passed</small>
          <b>
            {passed}/{quizzes.length}
          </b>
        </div>
        <div className="cla-card stat">
          <small>LMS progress</small>
          <b>{lmsProgress}%</b>
        </div>
      </div>

      <section className="cla-card" style={{ padding: 20 }}>
        <h3 style={{ marginTop: 0 }}>Focus</h3>
        <p style={{ color: "var(--muted)", marginBottom: 14 }}>
          Weak topics are inferred from quiz attempts below 70%.
        </p>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {quizGrades.filter((g) => (g.percent ?? 0) < 70).slice(0, 5).map((g) => (
            <li key={g.id} style={{ marginBottom: 6 }}>
              {g.title} — {g.percent}%
            </li>
          ))}
          {quizGrades.filter((g) => (g.percent ?? 0) < 70).length === 0 ? (
            <li style={{ color: "var(--muted)" }}>No weak topics yet — keep practising.</li>
          ) : null}
        </ul>
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <Link href="/dashboard/quizzes" className="cla-btn primary">
            Practice quizzes
          </Link>
          <Link href="/dashboard/grades" className="cla-btn">
            Full grades
          </Link>
        </div>
      </section>
    </div>
  );
}
