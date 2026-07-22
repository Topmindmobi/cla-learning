import { listSessions } from "@/lib/admin/ops";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export default async function InstructorTimetablePage() {
  const sessions = isAdminClientConfigured() ? await listSessions() : [];

  return (
    <div className="content" style={{ padding: 24 }}>
      <div style={{ marginBottom: 22 }}>
        <div className="mono eyebrow">Teaching</div>
        <h1 style={{ margin: "6px 0 0", fontSize: 28 }}>My timetable</h1>
        <p style={{ color: "var(--muted)", margin: "8px 0 0" }}>
          Class sessions from the CLA timetable (Africa/Kigali).
        </p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {sessions.length === 0 ? (
          <div className="cla-card" style={{ padding: 20 }}>
            <p style={{ margin: 0, color: "var(--muted)" }}>No sessions scheduled.</p>
          </div>
        ) : (
          sessions.map((s) => (
            <article key={s.id} className="cla-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <span className="cla-pill">{s.status}</span>
                  {s.course_title ? (
                    <span className="cla-pill" style={{ marginLeft: 6 }}>
                      {s.course_title}
                    </span>
                  ) : null}
                  <h3 style={{ margin: "10px 0 4px", fontSize: 16 }}>{s.title}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
                    {s.start_at
                      ? new Date(s.start_at).toLocaleString("en-GB", { timeZone: "Africa/Kigali" })
                      : "TBA"}
                    {s.location ? ` · ${s.location}` : ""}
                  </p>
                </div>
                {s.meeting_url ? (
                  <a href={s.meeting_url} target="_blank" rel="noreferrer" className="cla-btn primary sm">
                    Open link
                  </a>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
