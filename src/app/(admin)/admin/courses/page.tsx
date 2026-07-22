import Link from "next/link";
import { listAdminCourses } from "@/lib/admin/data";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { FeatureCourseForm, PublishCourseForm } from "@/components/admin/AdminForms";

function money(amount: number, currency: string) {
  return `${currency} ${Number(amount || 0).toLocaleString()}`;
}

export default async function AdminCoursesPage() {
  const configured = isAdminClientConfigured();
  const courses = configured ? await listAdminCourses() : [];

  return (
    <>
      <div className="topbar">
        <div className="crumbs">Admin / <b>Courses</b></div>
        <div className="right">
          <Link href="/catalog" className="cla-btn" target="_blank">
            View catalog
          </Link>
        </div>
      </div>
      <div className="content">
        <div className="pagehead">
          <div>
            <h1>Courses &amp; syllabus</h1>
            <p>Publish courses to the public catalog and mark featured programmes.</p>
          </div>
        </div>

        {!configured ? (
          <div className="attention">
            <b>Service role key missing</b>
            <span>· Add SUPABASE_SERVICE_ROLE_KEY in Render Environment, then redeploy.</span>
          </div>
        ) : null}

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>Catalogue</h3>
              <small>{courses.length} courses</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ color: "var(--muted)" }}>No courses found.</td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600 }}>{course.title}</p>
                        <span style={{ color: "var(--muted)", fontSize: 12 }}>
                          {course.instructor_name || "CLA Faculty"}
                          {course.slug ? ` · /courses/${course.slug}` : ""}
                        </span>
                      </div>
                    </td>
                    <td>{course.category.replace(/_/g, " ")}</td>
                    <td>{money(course.price, course.currency)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span className={`cla-pill ${course.is_published ? "moss" : "amber"}`}>
                          <i className="dotm" /> {course.is_published ? "Published" : "Draft"}
                        </span>
                        {course.is_featured ? (
                          <span className="cla-pill brand"><i className="dotm" /> Featured</span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <PublishCourseForm courseId={course.id} published={course.is_published} />
                        <FeatureCourseForm courseId={course.id} featured={course.is_featured} />
                        {course.slug ? (
                          <Link href={`/courses/${course.slug}`} className="cla-btn sm" target="_blank">
                            Open
                          </Link>
                        ) : null}
                      </div>
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
