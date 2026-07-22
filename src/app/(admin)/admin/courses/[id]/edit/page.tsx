import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCourse } from "@/lib/admin/data";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import CourseEditorForm from "@/components/admin/CourseEditorForm";
import { AdminPageHead, AdminTopBar, ConfigBanner } from "@/components/admin/AdminUi";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const configured = isAdminClientConfigured();
  const course = configured ? await getAdminCourse(id) : null;
  if (configured && !course) notFound();

  return (
    <>
      <AdminTopBar
        section="Courses"
        title="Edit"
        actions={
          <Link href="/admin/courses" className="cla-btn">
            Back
          </Link>
        }
      />
      <div className="content">
        <AdminPageHead
          title={course?.title ?? "Edit course"}
          lede="Update catalogue fields. LMS structure is managed separately under Teaching → LMS."
        />
        <ConfigBanner ok={configured} />
        <section className="cla-card panel" style={{ padding: 20 }}>
          {course ? <CourseEditorForm course={course} /> : null}
        </section>
      </div>
    </>
  );
}
