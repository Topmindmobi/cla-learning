import Link from "next/link";
import { notFound } from "next/navigation";
import { getLmsCourseTree } from "@/lib/admin/lms";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { AdminPageHead, AdminTopBar, ConfigBanner } from "@/components/admin/AdminUi";
import {
  AddLmsChapterForm,
  AddLmsLessonForm,
  AddLmsModuleForm,
  LmsStatusForm,
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
          lede={`${tree?.course.code ?? ""} · build the teaching tree below`}
        />
        <ConfigBanner ok={configured} />

        {tree ? (
          <>
            <section className="cla-card panel" style={{ marginBottom: 18, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
                    {modules.length} modules · {chapters.length} chapters · {lessons.length} lessons
                  </p>
                </div>
                <LmsStatusForm id={tree.course.id} status={tree.course.status} />
              </div>
            </section>

            <section className="cla-card panel" style={{ marginBottom: 18 }}>
              <div className="ph">
                <div>
                  <h3>Add structure</h3>
                  <small>Module → chapter → lesson</small>
                </div>
              </div>
              <div style={{ padding: "0 16px 16px", display: "grid", gap: 14 }}>
                <AddLmsModuleForm courseId={id} />
                <AddLmsChapterForm
                  courseId={id}
                  modules={modules.map((m) => ({ id: m.id, code: m.code, title: m.title }))}
                />
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
            </section>

            <section className="cla-card panel">
              <div className="ph">
                <div>
                  <h3>Tree</h3>
                  <small>Read-only outline</small>
                </div>
              </div>
              <div style={{ padding: "8px 16px 20px" }}>
                {modules.length === 0 ? (
                  <p style={{ color: "var(--muted)" }}>No modules yet.</p>
                ) : (
                  modules.map((m) => (
                    <div key={m.id} style={{ marginBottom: 16 }}>
                      <p style={{ margin: "0 0 6px", fontWeight: 600 }}>
                        <span className="mono" style={{ fontSize: 12, marginRight: 8 }}>
                          {m.code}
                        </span>
                        {m.title}
                      </p>
                      {chapters
                        .filter((c) => c.module_id === m.id)
                        .map((c) => (
                          <div key={c.id} style={{ marginLeft: 16, marginBottom: 8 }}>
                            <p style={{ margin: "0 0 4px", fontSize: 14 }}>
                              <span className="mono" style={{ fontSize: 11, marginRight: 6 }}>
                                {c.code}
                              </span>
                              {c.title}
                            </p>
                            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--muted)", fontSize: 13 }}>
                              {lessons
                                .filter((l) => l.chapter_id === c.id)
                                .map((l) => (
                                  <li key={l.id}>
                                    {l.code} — {l.title}{" "}
                                    <span className="cla-pill" style={{ fontSize: 10 }}>
                                      {l.lesson_type}
                                    </span>
                                  </li>
                                ))}
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
