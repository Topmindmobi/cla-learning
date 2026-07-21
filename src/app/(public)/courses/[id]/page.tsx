import Link from "next/link";
import { getFeaturedCourse } from "@/lib/featured-courses";
import { getPublishedCourse } from "@/lib/courses";
import { notFound } from "next/navigation";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabaseCourse = await getPublishedCourse(id);
  const featuredCourse = supabaseCourse ? null : getFeaturedCourse(id);

  if (!supabaseCourse && !featuredCourse) {
    notFound();
  }

  const title = supabaseCourse?.title ?? featuredCourse!.title;
  const tag = supabaseCourse
    ? supabaseCourse.category.replace(/_/g, " · ")
    : featuredCourse!.tag;
  const description = supabaseCourse?.short_description ?? featuredCourse!.shortDescription;
  const fullDescription = supabaseCourse?.full_description;
  const price = supabaseCourse
    ? supabaseCourse.price > 0
      ? `${supabaseCourse.currency} ${supabaseCourse.price.toLocaleString()}`
      : "Free"
    : featuredCourse!.price;
  const rating = supabaseCourse?.average_rating ?? featuredCourse!.rating;
  const duration = featuredCourse?.duration;

  return (
    <section className="page-section" style={{ paddingTop: 48 }}>
      <div className="cla-wrap" style={{ maxWidth: 720 }}>
        <Link href="/catalog" className="cla-link" style={{ display: "inline-block", marginBottom: 20 }}>← Back to catalog</Link>
        <span className="mono eyebrow">{tag}</span>
        <h1 style={{ marginTop: 10, marginBottom: 16, fontSize: 36 }}>{title}</h1>
        {description && (
          <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 24 }}>{description}</p>
        )}
        {(fullDescription || featuredCourse) && (
          <div className="cla-card" style={{ padding: 28, marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>About this course</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {fullDescription ?? featuredCourse!.shortDescription}
            </p>
            {duration && (
              <p style={{ color: "var(--muted)", marginTop: 14, fontSize: 14 }}>
                Duration: {duration}
              </p>
            )}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <span className="cla-pill brand">★ {rating}</span>
          <span className="cla-pill">{price}</span>
          <Link href="/register" className="cla-btn primary">Register to enrol</Link>
          <Link href="/contact" className="cla-btn">Contact admissions</Link>
        </div>
      </div>
    </section>
  );
}
