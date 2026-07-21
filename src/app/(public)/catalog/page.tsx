import Link from "next/link";
import { FeaturedCourseCard, SupabaseCourseCard } from "@/components/catalog/CourseCatalogGrid";
import { getCatalogCourses } from "@/lib/catalog-courses";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const courses = await getCatalogCourses(q);

  return (
    <section style={{ paddingTop: 48, paddingBottom: 78 }}>
      <div className="cla-wrap">
        <div className="head" style={{ marginBottom: 34 }}>
          <span className="mono eyebrow">Courses</span>
          <h2 style={{ marginTop: 10, fontSize: 36 }}>Course catalog</h2>
          <p>Browse professional courses in procurement, finance, and leadership.</p>
        </div>

        <form className="finder catalog-finder" action="/catalog" method="get" style={{ marginBottom: 28 }}>
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search CIPS, ACCA, PMP, short courses…"
            aria-label="Search courses"
          />
          <button type="submit" className="cla-btn primary">Search</button>
        </form>

        {courses.length === 0 ? (
          <div className="cla-card" style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
            <p>No courses match &ldquo;{q}&rdquo;.</p>
            <Link href="/catalog" className="cla-btn primary" style={{ marginTop: 20 }}>Clear search</Link>
          </div>
        ) : (
          <div className="grid">
            {courses.map((item) =>
              item.source === "featured" ? (
                <FeaturedCourseCard key={item.course.id} course={item.course} />
              ) : (
                <SupabaseCourseCard key={item.course.id} course={item.course} />
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
