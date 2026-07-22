import { listAdminCourses } from "@/lib/admin/data";
import { listCohorts } from "@/lib/admin/ops";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { AdminPageHead, AdminTopBar, ConfigBanner } from "@/components/admin/AdminUi";
import { BulkEnrolForm, EnrolStudentForm } from "@/components/admin/TeachingForms";

export default async function AdminEnrolPage() {
  const configured = isAdminClientConfigured();
  const [courses, cohorts] = configured
    ? await Promise.all([listAdminCourses(), listCohorts()])
    : [[], []];

  return (
    <>
      <AdminTopBar section="Enrol" title="Enrol" />
      <div className="content">
        <AdminPageHead
          title="Enrol learners"
          lede="Single enrol or paste a list — skips duplicates. Learners must already have an account."
        />
        <ConfigBanner ok={configured} />

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Single enrol</h3>
              <small>Faster than Base44’s 4-step wizard for day-to-day use</small>
            </div>
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            <EnrolStudentForm
              courses={courses.map((c) => ({ id: c.id, title: c.title }))}
              cohorts={cohorts.map((c) => ({ id: c.id, name: c.name }))}
            />
          </div>
        </section>

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>Bulk enrol</h3>
              <small>One email per line (or comma-separated)</small>
            </div>
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            <BulkEnrolForm
              courses={courses.map((c) => ({ id: c.id, title: c.title }))}
              cohorts={cohorts.map((c) => ({ id: c.id, name: c.name }))}
            />
          </div>
        </section>
      </div>
    </>
  );
}
