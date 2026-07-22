import Link from "next/link";
import CourseEditorForm from "@/components/admin/CourseEditorForm";
import { AdminPageHead, AdminTopBar } from "@/components/admin/AdminUi";

export default function NewCoursePage() {
  return (
    <>
      <AdminTopBar
        section="Courses"
        title="New"
        actions={
          <Link href="/admin/courses" className="cla-btn">
            Back
          </Link>
        }
      />
      <div className="content">
        <AdminPageHead title="New course" lede="Add a catalogue programme. Publish when ready for the public site." />
        <section className="cla-card panel" style={{ padding: 20 }}>
          <CourseEditorForm />
        </section>
      </div>
    </>
  );
}
