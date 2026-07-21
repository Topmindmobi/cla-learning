import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/database";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getPublishedCourse(idOrSlug: string): Promise<Course | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  try {
    const supabase = await createClient();
    const column = UUID_RE.test(idOrSlug) ? "id" : "slug";
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq(column, idOrSlug)
      .eq("is_published", true)
      .maybeSingle();
    return (data as Course) ?? null;
  } catch {
    return null;
  }
}
