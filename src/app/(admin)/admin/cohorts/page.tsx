import { AdminTopBar, AdminPageHead, ConfigBanner, EmptyRow } from "@/components/admin/AdminUi";
import { CreateCohortForm } from "@/components/admin/OpsForms";
import { listCohorts, listCourseOptions } from "@/lib/admin/ops";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export default async function AdminCohortsPage() {
  const configured = isAdminClientConfigured();
  const [cohorts, courses] = configured
    ? await Promise.all([listCohorts(), listCourseOptions()])
    : [[], []];

  return (
    <>
      <AdminTopBar section="Cohorts & timetable" title="Cohorts" />
      <div className="content">
        <AdminPageHead
          title="Cohorts & timetable"
          lede="Manage learner cohorts and their course schedules."
        />
        <ConfigBanner ok={configured} />

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Create cohort</h3>
              <small>Add a new cohort for a course</small>
            </div>
          </div>
          <CreateCohortForm courses={courses} />
        </section>

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>Cohorts</h3>
              <small>{cohorts.length} cohorts</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Course</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.length === 0 ? (
                <EmptyRow cols={5} message="No cohorts yet." />
              ) : (
                cohorts.map((row) => (
                  <tr key={row.id}>
                    <td><b>{row.name}</b></td>
                    <td>{row.course_title || "—"}</td>
                    <td>{row.start_date ? new Date(row.start_date).toLocaleDateString() : "—"}</td>
                    <td>{row.end_date ? new Date(row.end_date).toLocaleDateString() : "—"}</td>
                    <td><span className="cla-pill">{row.status}</span></td>
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
