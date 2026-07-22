import Link from "next/link";
import { listPublishedLmsCourses } from "@/lib/student/lms";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function LibraryPage() {
  const configured = isAdminClientConfigured();
  const lms = configured ? await listPublishedLmsCourses() : [];

  let docs: { id: string; title: string; description: string | null }[] = [];
  if (configured) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("courses")
      .select("id, title, description")
      .eq("is_published", true)
      .order("title")
      .limit(24);
    docs = (data ?? []) as typeof docs;
  }

  return (
    <div className="wrap">
      <div className="hello" style={{ marginBottom: 22 }}>
        <div>
          <div className="mono eyebrow">Resources</div>
          <h1>
            Resource <span className="serif">library</span>
          </h1>
        </div>
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>LMS programmes</h2>
      <div className="grid3" style={{ marginBottom: 28 }}>
        {lms.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No published LMS programmes.</p>
        ) : (
          lms.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/learn/${c.id}`}
              className="cla-card"
              style={{ padding: 18, textDecoration: "none", color: "inherit" }}
            >
              <span className="cla-pill brand mono">{c.code}</span>
              <h3 style={{ margin: "10px 0 0", fontSize: 16 }}>{c.title}</h3>
            </Link>
          ))
        )}
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Catalogue courses</h2>
      <div className="grid3">
        {docs.map((c) => (
          <article key={c.id} className="cla-card" style={{ padding: 18 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>{c.title}</h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
              {c.description?.slice(0, 120) || "Programme resource"}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
