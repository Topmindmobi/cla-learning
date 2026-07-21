import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/database";

async function getCourses(): Promise<Course[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("courses")
      .select("id, title, short_description, category, price, currency, average_rating")
      .eq("is_published", true)
      .order("title");
    return (data as Course[]) ?? [];
  } catch {
    return [];
  }
}

export default async function CatalogPage() {
  const courses = await getCourses();

  return (
    <section style={{ paddingTop: 48, paddingBottom: 78 }}>
      <div className="cla-wrap">
        <div className="head" style={{ marginBottom: 34 }}>
          <span className="mono eyebrow">Courses</span>
          <h2 style={{ marginTop: 10, fontSize: 36 }}>Course catalog</h2>
          <p>Browse professional courses in procurement, finance, and leadership.</p>
        </div>

        {courses.length === 0 ? (
          <div className="cla-card" style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
            <p>No courses in Supabase yet.</p>
            <p style={{ marginTop: 8, fontSize: 14 }}>Featured courses appear on the home page until data is imported.</p>
            <Link href="/" className="cla-btn primary" style={{ marginTop: 20 }}>Back to home</Link>
          </div>
        ) : (
          <div className="grid">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} className="ccard">
                <div className="cover" style={{ background: "var(--brand)" }}>
                  <span className="mono">{course.category.replace(/_/g, " · ")}</span>
                </div>
                <div className="body">
                  <h4>{course.title}</h4>
                  {course.short_description && <p>{course.short_description}</p>}
                  <div className="foot">
                    <span className="star">★ {course.average_rating || "—"}</span>
                    <span className="price">
                      {course.price > 0 ? `${course.currency} ${course.price.toLocaleString()}` : "Free"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
