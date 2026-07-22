import Link from "next/link";
import { notFound } from "next/navigation";
import { getLmsCourseTree } from "@/lib/admin/lms";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { AdminPageHead, AdminTopBar, ConfigBanner } from "@/components/admin/AdminUi";
import {
  AddLmsActivityForm,
  AddLmsChapterForm,
  AddLmsLessonForm,
  AddLmsModuleForm,
  LmsStatusForm,
  ToggleLmsActivityForm,
  ToggleLmsLessonForm,
} from "@/components/admin/TeachingForms";

export default async function AdminLmsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const configured = isAdminClientConfigured();
  const tree = configured ? await getLmsCourseTree(id) : null;
  if (configured && !tree) notFound();

  const modules = tree?.modules ?? [];
  const chapters = tree?.chapters ?? [];
  const lessons = tree?.lessons ?? [];
  const activities = tree?.activities ?? [];

  return (
    <>
      <AdminTopBar
        section="LMS"
        title={tree?.course.code ?? "Course"}
        actions={
          <Link href="/admin/lms" className="cla-btn">
            All LMS
          </Link>
        }
      />
      <div className="content">
        <AdminPageHead
          title={tree?.course.title ?? "LMS course"}
          lede={`${tree?.course.code ?? ""} · modules → chapters → lessons → activities`}
        />
        <ConfigBanner ok={configured} />

        {tree ? (
          <>
            <section className="cla-card panel" style={{ marginBottom: 18, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
                    {modules.length} modules · {chapters.length} chapters · {lessons.length} lessons ·{" "}
                    {activities.length} activities
                  </p>
                  {tree.course.status === "published" ? (
                    <p style={{ margin: "6px 0 0", fontSize: 12 }}>
                      Learner player:{" "}
                      <Link href={`/dashboard/learn/${tree.course.id}`} className="cla-link">
                        /dashboard/learn/{tree.course.code}
                      </Link>
                    </p>
                  ) : (
                    <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--muted)" }}>
                      Publish the programme (and lessons/activities) for learners to open the player.
                    </p>
                  )}
                </div>
                <LmsStatusForm id={tree.course.id} status={tree.course.status} />
              </div>
            </section>

            <section className="cla-card panel" style={{ marginBottom: 18 }}>
              <div className="ph">
                <div>
                  <h3>Add structure</h3>
                  <small>Module → chapter → lesson → activity</small>
                </div>
              </div>
              <div style={{ padding: "0 16px 16px", display: "grid", gap: 18 }}>
                <div>
                  <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
                    Module
                  </p>
                  <AddLmsModuleForm courseId={id} />
                </div>
                <div>
                  <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
                    Chapter
                  </p>
                  <AddLmsChapterForm
                    courseId={id}
                    modules={modules.map((m) => ({ id: m.id, code: m.code, title: m.title }))}
                  />
                </div>
                <div>
                  <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
                    Lesson
                  </p>
                  <AddLmsLessonForm
                    courseId={id}
                    chapters={chapters.map((c) => ({
                      id: c.id,
                      module_id: c.module_id,
                      code: c.code,
                      title: c.title,
                    }))}
                  />
                </div>
                <div>
                  <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
                    Activity
                  </p>
                  <AddLmsActivityForm
                    courseId={id}
                    lessons={lessons.map((l) => ({ id: l.id, code: l.code, title: l.title }))}
                  />
                </div>
              </div>
            </section>

            <section className="cla-card panel">
              <div className="ph">
                <div>
                  <h3>Tree</h3>
                  <small>Publish individual lessons and activities for the learner player</small>
                </div>
              </div>
              <div style={{ padding: "8px 16px 20px" }}>
                {modules.length === 0 ? (
                  <p style={{ color: "var(--muted)" }}>No modules yet.</p>
                ) : (
                  modules.map((m) => (
                    <div key={m.id} style={{ marginBottom: 18 }}>
                      <p style={{ margin: "0 0 6px", fontWeight: 600 }}>
                        <span className="mono" style={{ fontSize: 12, marginRight: 8 }}>
                          {m.code}
                        </span>
                        {m.title}
                        {m.module_type ? (
                          <span className="cla-pill" style={{ marginLeft: 8, fontSize: 10 }}>
                            {m.module_type}
                          </span>
                        ) : null}
                      </p>
                      {m.overview ? (
                        <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--muted)" }}>{m.overview}</p>
                      ) : null}
                      {chapters
                        .filter((c) => c.module_id === m.id)
                        .map((c) => (
                          <div key={c.id} style={{ marginLeft: 16, marginBottom: 10 }}>
                            <p style={{ margin: "0 0 4px", fontSize: 14 }}>
                              <span className="mono" style={{ fontSize: 11, marginRight: 6 }}>
                                {c.code}
                              </span>
                              {c.title}
                            </p>
                            {c.learning_outcome ? (
                              <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--muted)" }}>
                                LO: {c.learning_outcome}
                              </p>
                            ) : null}
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, listStyle: "none" }}>
                              {lessons
                                .filter((l) => l.chapter_id === c.id)
                                .map((l) => {
                                  const lessonActs = activities.filter((a) => a.lesson_id === l.id);
                                  return (
                                    <li key={l.id} style={{ marginBottom: 8 }}>
                                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                        <span>
                                          {l.code} — {l.title}{" "}
                                          <span className="cla-pill" style={{ fontSize: 10 }}>
                                            {l.lesson_type}
                                          </span>{" "}
                                          <span
                                            className={`cla-pill ${l.is_published ? "moss" : "amber"}`}
                                            style={{ fontSize: 10 }}
                                          >
                                            {l.is_published ? "live" : "draft"}
                                          </span>
                                        </span>
                                        <ToggleLmsLessonForm
                                          courseId={id}
                                          id={l.id}
                                          published={l.is_published}
                                        />
                                      </div>
                                      {lessonActs.length > 0 ? (
                                        <ul style={{ margin: "6px 0 0", paddingLeft: 14, color: "var(--muted)" }}>
                                          {lessonActs.map((a) => (
                                            <li key={a.id} style={{ marginBottom: 4 }}>
                                              <span>
                                                {a.title}{" "}
                                                <span className="cla-pill" style={{ fontSize: 10 }}>
                                                  {a.activity_type}
                                                </span>{" "}
                                                {(() => {
                                                  const cips = [a.module_code, a.lo_code, a.ac_code]
                                                    .filter(Boolean)
                                                    .join(" · ");
                                                  return cips ? (
                                                    <span className="mono" style={{ fontSize: 10 }}>
                                                      {cips}
                                                    </span>
                                                  ) : null;
                                                })()}{" "}
                                                <span
                                                  className={`cla-pill ${a.is_published ? "moss" : "amber"}`}
                                                  style={{ fontSize: 10 }}
                                                >
                                                  {a.is_published ? "live" : "draft"}
                                                </span>
                                              </span>{" "}
                                              <ToggleLmsActivityForm
                                                courseId={id}
                                                id={a.id}
                                                published={a.is_published}
                                              />
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>
                                          No activities yet.
                                        </p>
                                      )}
                                    </li>
                                  );
                                })}
                            </ul>
                          </div>
                        ))}
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </>
  );
}
