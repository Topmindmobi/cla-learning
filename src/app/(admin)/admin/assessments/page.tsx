import Link from "next/link";
import { listAdminCourses } from "@/lib/admin/data";
import {
  listAssignments,
  listModuleQuizzes,
  listQuestionBanks,
  listQuestions,
} from "@/lib/admin/assessments";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { AdminPageHead, AdminTopBar, ConfigBanner, EmptyRow } from "@/components/admin/AdminUi";
import {
  AddQuestionForm,
  CreateAssignmentForm,
  CreateBankForm,
  CreateQuizForm,
  GradeAssignmentForm,
  ToggleQuizForm,
} from "@/components/admin/TeachingForms";

const TABS = [
  { id: "quizzes", label: "Quizzes" },
  { id: "banks", label: "Question banks" },
  { id: "assignments", label: "Assignments" },
] as const;

export default async function AdminAssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab = TABS.some((t) => t.id === tabParam) ? tabParam! : "quizzes";
  const configured = isAdminClientConfigured();

  const [courses, quizzes, banks, questions, assignments] = configured
    ? await Promise.all([
        listAdminCourses(),
        listModuleQuizzes(),
        listQuestionBanks(),
        listQuestions(),
        listAssignments(),
      ])
    : [[], [], [], [], []];

  const courseOpts = courses.map((c) => ({ id: c.id, title: c.title }));

  return (
    <>
      <AdminTopBar section="Assessments" title="Assessments" />
      <div className="content">
        <AdminPageHead
          title="Assessments"
          lede="Quizzes, question banks and assignment grading in one place — cleaner than Base44’s three separate screens."
        />
        <ConfigBanner ok={configured} />

        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={`/admin/assessments?tab=${t.id}`}
              className={`cla-btn sm${tab === t.id ? " primary" : ""}`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {tab === "quizzes" ? (
          <>
            <section className="cla-card panel" style={{ marginBottom: 18 }}>
              <div className="ph">
                <div>
                  <h3>Create quiz</h3>
                  <small>Optional CSV import for questions</small>
                </div>
              </div>
              <div style={{ padding: "0 16px 16px" }}>
                <CreateQuizForm courses={courseOpts} />
              </div>
            </section>
            <section className="cla-card panel">
              <div className="ph">
                <div>
                  <h3>Quizzes</h3>
                  <small>{quizzes.length}</small>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Course</th>
                    <th>Questions</th>
                    <th>Pass %</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {quizzes.length === 0 ? (
                    <EmptyRow cols={6} message="No quizzes yet." />
                  ) : (
                    quizzes.map((q) => (
                      <tr key={q.id}>
                        <td>{q.title}</td>
                        <td>{q.course_title ?? "—"}</td>
                        <td>{q.questions.length}</td>
                        <td>{q.passing_score}</td>
                        <td>
                          <span className={`cla-pill ${q.is_published ? "moss" : "amber"}`}>
                            <i className="dotm" /> {q.is_published ? "Live" : "Draft"}
                          </span>
                        </td>
                        <td>
                          <ToggleQuizForm id={q.id} published={q.is_published} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          </>
        ) : null}

        {tab === "banks" ? (
          <>
            <section className="cla-card panel" style={{ marginBottom: 18 }}>
              <div className="ph">
                <div>
                  <h3>Banks & questions</h3>
                  <small>Reusable pools for future quiz builders</small>
                </div>
              </div>
              <div style={{ padding: "0 16px 16px", display: "grid", gap: 16 }}>
                <CreateBankForm courses={courseOpts} />
                <AddQuestionForm banks={banks.map((b) => ({ id: b.id, name: b.name }))} />
              </div>
            </section>
            <section className="cla-card panel" style={{ marginBottom: 18 }}>
              <div className="ph">
                <div>
                  <h3>Question banks</h3>
                  <small>{banks.length}</small>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Questions</th>
                  </tr>
                </thead>
                <tbody>
                  {banks.length === 0 ? (
                    <EmptyRow cols={3} message="No banks yet." />
                  ) : (
                    banks.map((b) => (
                      <tr key={b.id}>
                        <td>{b.name}</td>
                        <td>{b.course_title ?? "—"}</td>
                        <td>{b.question_count ?? 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
            <section className="cla-card panel">
              <div className="ph">
                <div>
                  <h3>Recent questions</h3>
                  <small>{questions.length}</small>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Options</th>
                    <th>Correct</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.length === 0 ? (
                    <EmptyRow cols={3} message="No questions yet." />
                  ) : (
                    questions.slice(0, 40).map((q) => (
                      <tr key={q.id}>
                        <td style={{ maxWidth: 360 }}>{q.question_text}</td>
                        <td>{q.options.length}</td>
                        <td>{String.fromCharCode(65 + q.correct_index)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          </>
        ) : null}

        {tab === "assignments" ? (
          <>
            <section className="cla-card panel" style={{ marginBottom: 18 }}>
              <div className="ph">
                <div>
                  <h3>Record submission</h3>
                  <small>Manual capture until learner upload portal is live</small>
                </div>
              </div>
              <div style={{ padding: "0 16px 16px" }}>
                <CreateAssignmentForm courses={courseOpts} />
              </div>
            </section>
            <section className="cla-card panel">
              <div className="ph">
                <div>
                  <h3>Submissions</h3>
                  <small>{assignments.length}</small>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Assignment</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Grade</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.length === 0 ? (
                    <EmptyRow cols={6} message="No submissions yet." />
                  ) : (
                    assignments.map((a) => (
                      <tr key={a.id}>
                        <td>{a.student_email}</td>
                        <td>
                          <div>
                            <p style={{ margin: 0 }}>{a.assignment_title}</p>
                            {a.submission_text ? (
                              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                                {a.submission_text.slice(0, 80)}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td>{a.course_title ?? "—"}</td>
                        <td>{a.status}</td>
                        <td>
                          {a.grade != null ? `${a.grade}/${a.max_score}` : "—"}
                        </td>
                        <td>
                          {a.status !== "graded" ? <GradeAssignmentForm id={a.id} /> : null}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          </>
        ) : null}
      </div>
    </>
  );
}
