import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { listLearnerSessions } from "@/lib/student/portal";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export default async function SchedulePage() {
  const session = await requireSession();
  const sessions = isAdminClientConfigured()
    ? await listLearnerSessions(session.userId)
    : [];
  const now = Date.now();

  return (
    <div className="wrap">
      <div className="hello" style={{ marginBottom: 22 }}>
        <div>
          <div className="mono eyebrow">Africa/Kigali</div>
          <h1>
            My <span className="serif">schedule</span>
          </h1>
          <p style={{ color: "var(--muted)", margin: "8px 0 0" }}>
            Live classes and timetable sessions for your enrolled programmes.
          </p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="cla-card" style={{ padding: 24 }}>
          <p style={{ margin: 0, color: "var(--muted)" }}>No sessions scheduled yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {sessions.map((s) => {
            const start = s.start_at ? new Date(s.start_at).getTime() : 0;
            const live = start && start <= now && (s.end_at ? new Date(s.end_at).getTime() > now : true);
            const upcoming = start > now;
            return (
              <article key={s.id} className="cla-card" style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <span className={`cla-pill ${live ? "moss" : upcoming ? "brand" : ""}`}>
                        {live ? "Live" : upcoming ? "Upcoming" : s.status}
                      </span>
                      {s.course_title ? <span className="cla-pill">{s.course_title}</span> : null}
                    </div>
                    <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>{s.title}</h3>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
                      {s.start_at
                        ? new Date(s.start_at).toLocaleString("en-GB", {
                            timeZone: "Africa/Kigali",
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Time TBA"}
                      {s.location ? ` · ${s.location}` : ""}
                    </p>
                  </div>
                  {s.meeting_url ? (
                    <a href={s.meeting_url} target="_blank" rel="noreferrer" className="cla-btn primary">
                      Join session
                    </a>
                  ) : (
                    <Link href="/dashboard/course" className="cla-btn">
                      View programme
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
