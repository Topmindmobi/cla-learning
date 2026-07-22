import Link from "next/link";
import { listPublishedLmsCourses } from "@/lib/student/lms";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export default async function MyLearningPage() {
  const configured = isAdminClientConfigured();
  const courses = configured ? await listPublishedLmsCourses() : [];

  return (
    <div className="wrap">
      <div className="hello" style={{ marginBottom: 22 }}>
        <div>
          <div className="mono eyebrow">My learning</div>
          <h1>
            Your <span className="serif">programmes</span>
          </h1>
          <p style={{ color: "var(--muted)", margin: "8px 0 0", maxWidth: "52ch" }}>
            Open a published CLA LMS programme to work through modules, chapters, lessons, and activities.
          </p>
        </div>
      </div>

      {!configured ? (
        <div className="cla-card" style={{ padding: 24 }}>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Learning data is not configured in this environment.
          </p>
        </div>
      ) : courses.length === 0 ? (
        <div className="cla-card" style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0 }}>No published programmes yet</h3>
          <p style={{ color: "var(--muted)", marginBottom: 16 }}>
            When an admin publishes an LMS course (and its lessons/activities), it will appear here.
          </p>
          <Link href="/dashboard/catalog" className="cla-btn">
            Browse catalog
          </Link>
        </div>
      ) : (
        <div className="grid3">
          {courses.map((c) => (
            <article key={c.id} className="cla-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <span className="cla-pill brand mono">{c.code}</span>
                {c.level != null ? <span className="cla-pill">Level {c.level}</span> : null}
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>{c.title}</h3>
              {c.description ? (
                <p
                  style={{
                    margin: "0 0 16px",
                    color: "var(--muted)",
                    fontSize: 14,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {c.description}
                </p>
              ) : (
                <p style={{ margin: "0 0 16px", color: "var(--muted)", fontSize: 14 }}>
                  Structured CLA learning pathway
                </p>
              )}
              <Link href={`/dashboard/learn/${c.id}`} className="cla-btn primary">
                Open player
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
