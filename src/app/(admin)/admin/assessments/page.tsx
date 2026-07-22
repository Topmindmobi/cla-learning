import Link from "next/link";
import { AdminTopBar, AdminPageHead } from "@/components/admin/AdminUi";

export default function AdminAssessmentsPage() {
  return (
    <>
      <AdminTopBar section="Assessments & banks" title="Assessments & banks" />
      <div className="content">
        <AdminPageHead
          title="Assessments & question banks"
          lede="Quiz management and question banks from Base44 are next in the migration."
        />

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>Migration status</h3>
              <small>Not yet available in this admin</small>
            </div>
          </div>
          <div style={{ padding: "0 0 4px", color: "var(--muted)", lineHeight: 1.6 }}>
            <p style={{ margin: "0 0 12px" }}>
              The Base44 <b>AdminQuizManager</b> and <b>AdminQuestionBanks</b> tools have not been
              migrated yet. This area will cover course assessments, quiz authoring, and shared
              question banks once those modules are ported.
            </p>
            <p style={{ margin: 0 }}>
              In the meantime, manage related content from{" "}
              <Link href="/admin/courses">Courses &amp; syllabus</Link> and schedule live review via{" "}
              <Link href="/admin/sessions">Live sessions</Link>.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
