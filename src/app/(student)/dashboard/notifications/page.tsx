import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { listLearnerNotifications } from "@/lib/student/portal";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { MarkNotificationReadForm } from "@/components/student/LearnerPortalForms";

export default async function NotificationsPage() {
  const session = await requireSession();
  const notes = isAdminClientConfigured()
    ? await listLearnerNotifications(session.userId)
    : [];

  return (
    <div className="wrap">
      <div className="hello" style={{ marginBottom: 22 }}>
        <div>
          <div className="mono eyebrow">Inbox</div>
          <h1>
            <span className="serif">Notifications</span>
          </h1>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="cla-card" style={{ padding: 24 }}>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            No notifications yet. Check your{" "}
            <Link href="/dashboard/schedule" className="cla-link">
              schedule
            </Link>{" "}
            and{" "}
            <Link href="/dashboard/billing" className="cla-link">
              billing
            </Link>{" "}
            for updates.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {notes.map((n) => (
            <article
              key={n.id}
              className="cla-card"
              style={{
                padding: 16,
                opacity: n.is_read ? 0.7 : 1,
                borderLeft: n.is_read ? undefined : "3px solid var(--brand)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <span className="cla-pill" style={{ marginBottom: 8 }}>
                    {n.type}
                  </span>
                  <h3 style={{ margin: "8px 0 4px", fontSize: 16 }}>{n.title}</h3>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>{n.message}</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
                  {n.link ? (
                    <Link href={n.link} className="cla-btn sm">
                      Open
                    </Link>
                  ) : null}
                  {!n.is_read ? <MarkNotificationReadForm id={n.id} /> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
