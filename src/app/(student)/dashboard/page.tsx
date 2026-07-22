import Link from "next/link";
import StudentDashboardPage from "@/components/student/StudentDashboardPage";
import { listPublishedLmsCourses } from "@/lib/student/lms";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export default async function Page() {
  const courses = isAdminClientConfigured() ? await listPublishedLmsCourses() : [];
  const primary = courses[0] ?? null;

  return (
    <>
      {primary ? (
        <div className="wrap" style={{ paddingBottom: 0 }}>
          <div
            className="cla-card"
            style={{
              marginTop: 18,
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div className="mono eyebrow">Published LMS</div>
              <strong>{primary.title}</strong>
              <span className="mono" style={{ marginLeft: 8, fontSize: 12, color: "var(--muted)" }}>
                {primary.code}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href={`/dashboard/learn/${primary.id}`} className="cla-btn primary">
                Resume learning
              </Link>
              <Link href="/dashboard/course" className="cla-btn">
                All programmes
              </Link>
            </div>
          </div>
        </div>
      ) : null}
      <StudentDashboardPage />
    </>
  );
}
