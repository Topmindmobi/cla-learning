import { FEATURED_COURSES, filterFeaturedCourses, type FeaturedCourse } from "@/lib/featured-courses";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/database";

export type CatalogCourse =
  | { source: "supabase"; course: Pick<Course, "id" | "slug" | "title" | "short_description" | "category" | "price" | "currency" | "average_rating"> }
  | { source: "featured"; course: FeaturedCourse };

type SupabaseCatalogRow = Pick<Course, "id" | "slug" | "title" | "short_description" | "category" | "price" | "currency" | "average_rating">;

async function getSupabaseCourses(): Promise<CatalogCourse[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("YOUR_PROJECT")) return [];

  try {
    const supabase = await createClient();
    const fields = "id, slug, title, short_description, category, price, currency, average_rating";
    let { data, error } = await supabase
      .from("courses")
      .select(fields)
      .eq("is_published", true)
      .order("title");

    if (error?.message?.includes("slug")) {
      const fallback = await supabase
        .from("courses")
        .select("id, title, short_description, category, price, currency, average_rating")
        .eq("is_published", true)
        .order("title");
      data = fallback.data?.map((row) => ({ ...row, slug: null })) ?? null;
      error = fallback.error;
    }

    if (error || !data?.length) return [];

    return data.map((course) => ({
      source: "supabase" as const,
      course: course as SupabaseCatalogRow,
    }));
  } catch {
    return [];
  }
}

function filterCatalogCourses(items: CatalogCourse[], query?: string): CatalogCourse[] {
  if (!query?.trim()) return items;
  const q = query.trim().toLowerCase();
  return items.filter(({ course, source }) => {
    if (source === "featured") {
      const f = course as FeaturedCourse;
      return (
        f.title.toLowerCase().includes(q) ||
        f.shortDescription.toLowerCase().includes(q) ||
        f.tag.toLowerCase().includes(q)
      );
    }
    const c = course as Course;
    return (
      c.title.toLowerCase().includes(q) ||
      (c.short_description?.toLowerCase().includes(q) ?? false) ||
      c.category.replace(/_/g, " ").toLowerCase().includes(q)
    );
  });
}

/** Supabase catalog when available; otherwise built-in featured programmes. */
export async function getCatalogCourses(query?: string): Promise<CatalogCourse[]> {
  const fromDb = await getSupabaseCourses();
  const items =
    fromDb.length > 0
      ? fromDb
      : filterFeaturedCourses().map((course) => ({ source: "featured" as const, course }));
  return filterCatalogCourses(items, query);
}

export async function getCatalogCourseCount(): Promise<number> {
  const items = await getCatalogCourses();
  return items.length;
}
