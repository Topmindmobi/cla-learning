import Link from "next/link";
import { ClaLogo } from "@/components/brand/ClaLogo";
import type { FeaturedCourse } from "@/lib/featured-courses";
import type { Course } from "@/types/database";

function formatCategory(category: string) {
  return category.replace(/_/g, " · ");
}

export function FeaturedCourseCard({ course }: { course: FeaturedCourse }) {
  return (
    <Link href={`/courses/${course.id}`} className="ccard">
      <div className="cover" style={{ background: course.color }}>
        <span className="mono">{course.tag}</span>
        <ClaLogo size={30} />
      </div>
      <div className="body">
        <h4>{course.title}</h4>
        <p>{course.shortDescription}</p>
        <div className="foot">
          <span className="star">★ {course.rating}</span>
          <span>{course.duration}</span>
          <span className="price">{course.price}</span>
        </div>
      </div>
    </Link>
  );
}

export function SupabaseCourseCard({ course }: { course: Pick<Course, "id" | "slug" | "title" | "short_description" | "category" | "price" | "currency" | "average_rating"> }) {
  return (
    <Link href={`/courses/${course.slug ?? course.id}`} className="ccard">
      <div className="cover" style={{ background: "var(--brand)" }}>
        <span className="mono">{formatCategory(course.category)}</span>
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
  );
}
