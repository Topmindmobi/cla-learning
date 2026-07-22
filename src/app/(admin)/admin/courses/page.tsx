import Link from "next/link";
import { listAdminCourses } from "@/lib/admin/data";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { FeatureCourseForm, PublishCourseForm } from "@/components/admin/AdminForms";
import { AdminPageHead, AdminTopBar, ConfigBanner, EmptyRow } from "@/components/admin/AdminUi";

function money(amount: number, currency: string) {
  return `${currency} ${Number(amount || 0).toLocaleString()}`;
}

export default async function AdminCoursesPage() {
  const configured = isAdminClientConfigured();
  const courses = configured ? await listAdminCourses() : [];

  return (
    <>
      <AdminTopBar
        section="Courses"
        title="Courses"
        actions={
          <>
            <Link href="/admin/courses/new" className="cla-btn primary">
              New course
            </Link>
            <Link href="/admin/lms" className="cla-btn">
              LMS
            </Link>
            <Link href="/catalog" className="cla-btn" target="_blank">
              Catalog
            </Link>
          </>
        }
      />
      <div className="content">
        <AdminPageHead
          title="Courses"
          lede="Create and edit catalogue programmes. Use LMS for module/chapter content structure."
        />
        <ConfigBanner ok={configured} />

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
                <EmptyRow cols={5} message="No courses yet. Create one or run npm run import:courses." />
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
                          <span className="cla-pill brand">
                            <i className="dotm" /> Featured
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        <Link href={`/admin/courses/${course.id}/edit`} className="cla-btn sm">
                          Edit
                        </Link>
                        <PublishCourseForm courseId={course.id} published={course.is_published} />
                        <FeatureCourseForm courseId={course.id} featured={course.is_featured} />
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
