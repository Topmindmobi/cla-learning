import Link from "next/link";
import { listAdminCourses } from "@/lib/admin/data";
import { listLmsCourses } from "@/lib/admin/lms";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { AdminPageHead, AdminTopBar, ConfigBanner, EmptyRow } from "@/components/admin/AdminUi";
import { CreateLmsCourseForm, ImportLmsJsonForm } from "@/components/admin/TeachingForms";

export default async function AdminLmsPage() {
  const configured = isAdminClientConfigured();
  const [lms, courses] = configured
    ? await Promise.all([listLmsCourses(), listAdminCourses()])
    : [[], []];

  return (
    <>
      <AdminTopBar
        section="LMS"
        title="LMS"
        actions={
          <Link href="/admin/courses" className="cla-btn">
            Catalogue
          </Link>
        }
      />
      <div className="content">
        <AdminPageHead
          title="LMS structure"
          lede="Hierarchy for modules, chapters and lessons — separate from the public catalogue. Import Base44 JSON or build manually."
        />
        <ConfigBanner ok={configured} />

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Create LMS course</h3>
              <small>Starts empty — add modules on the detail page</small>
            </div>
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            <CreateLmsCourseForm courses={courses.map((c) => ({ id: c.id, title: c.title }))} />
          </div>
        </section>

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Import JSON</h3>
              <small>Same shape as Base44 LMSImporter</small>
            </div>
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            <ImportLmsJsonForm />
          </div>
        </section>

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>LMS courses</h3>
              <small>{lms.length} programmes</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Level</th>
                <th>Modules</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lms.length === 0 ? (
                <EmptyRow cols={6} message="No LMS courses yet." />
              ) : (
                lms.map((c) => (
                  <tr key={c.id}>
                    <td className="mono">{c.code}</td>
                    <td>{c.title}</td>
                    <td>{c.level ?? "—"}</td>
                    <td>{c.module_count ?? 0}</td>
                    <td>
                      <span className={`cla-pill ${c.status === "published" ? "moss" : "amber"}`}>
                        <i className="dotm" /> {c.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/admin/lms/${c.id}`} className="cla-btn sm">
                        Open
                      </Link>
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
