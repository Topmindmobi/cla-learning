import { listAdminCourses } from "@/lib/admin/data";
import { listApplicants } from "@/lib/admin/assessments";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { AdminPageHead, AdminTopBar, ConfigBanner, EmptyRow } from "@/components/admin/AdminUi";
import { ApplicantStatusForm, CreateApplicantForm } from "@/components/admin/TeachingForms";

export default async function AdminApplicantsPage() {
  const configured = isAdminClientConfigured();
  const [applicants, courses] = configured
    ? await Promise.all([listApplicants(), listAdminCourses()])
    : [[], []];

  return (
    <>
      <AdminTopBar section="Applicants" title="Applicants" />
      <div className="content">
        <AdminPageHead
          title="Applicants"
          lede="Lead pipeline before accounts exist — admit when ready, then enrol from Enrol."
        />
        <ConfigBanner ok={configured} />

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Add lead</h3>
              <small>CRM-lite</small>
            </div>
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            <CreateApplicantForm courses={courses.map((c) => ({ id: c.id, title: c.title }))} />
          </div>
        </section>

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>Pipeline</h3>
              <small>{applicants.length}</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {applicants.length === 0 ? (
                <EmptyRow cols={5} message="No applicants yet. Run migration 005 if this errors." />
              ) : (
                applicants.map((a) => (
                  <tr key={a.id}>
                    <td>{a.full_name}</td>
                    <td>{a.email}</td>
                    <td>{a.course_title ?? "—"}</td>
                    <td>
                      <span className="cla-pill brand">
                        <i className="dotm" /> {a.status}
                      </span>
                    </td>
                    <td>
                      <ApplicantStatusForm id={a.id} status={a.status} />
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
