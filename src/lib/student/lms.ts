import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import type {
  LmsActivityRow,
  LmsChapterRow,
  LmsCourseRow,
  LmsLessonRow,
  LmsModuleRow,
} from "@/lib/admin/lms";

export type LearnerLmsTree = {
  course: LmsCourseRow;
  modules: LmsModuleRow[];
  chapters: LmsChapterRow[];
  lessons: LmsLessonRow[];
  activities: LmsActivityRow[];
  completedActivityIds: Set<string>;
};

export async function listPublishedLmsCourses(): Promise<LmsCourseRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("lms_courses")
    .select("id, code, title, level, description, status, synced_course_id")
    .eq("status", "published")
    .order("code");
  if (error) throw new Error(error.message);
  return (data ?? []) as LmsCourseRow[];
}

/** Published programme tree for the learner player (lessons/activities must be published). */
export async function getPublishedLmsTree(
  courseId: string,
  userId?: string,
): Promise<LearnerLmsTree | null> {
  if (!isAdminClientConfigured()) return null;
  const supabase = createAdminClient();

  const { data: course, error } = await supabase
    .from("lms_courses")
    .select("id, code, title, level, description, status, synced_course_id")
    .eq("id", courseId)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!course) return null;

  const { data: modules } = await supabase
    .from("lms_modules")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order");
  const { data: chapters } = await supabase
    .from("lms_chapters")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order");
  const { data: lessons } = await supabase
    .from("lms_lessons")
    .select("*")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .order("sort_order");

  const lessonIds = (lessons ?? []).map((l) => l.id as string);
  let activities: LmsActivityRow[] = [];
  if (lessonIds.length) {
    const { data: acts } = await supabase
      .from("lms_activities")
      .select("*")
      .in("lesson_id", lessonIds)
      .eq("is_published", true)
      .order("sort_order");
    activities = (acts ?? []) as LmsActivityRow[];
  }

  const completedActivityIds = new Set<string>();
  if (userId && activities.length) {
    const { data: prog } = await supabase
      .from("lms_activity_progress")
      .select("activity_id, completed")
      .eq("user_id", userId)
      .in(
        "activity_id",
        activities.map((a) => a.id),
      )
      .eq("completed", true);
    for (const row of prog ?? []) {
      completedActivityIds.add(row.activity_id as string);
    }
  }

  return {
    course: course as LmsCourseRow,
    modules: (modules ?? []) as LmsModuleRow[],
    chapters: (chapters ?? []) as LmsChapterRow[],
    lessons: (lessons ?? []) as LmsLessonRow[],
    activities,
    completedActivityIds,
  };
}

export function progressPercent(tree: LearnerLmsTree): number {
  const total = tree.activities.length || tree.lessons.length;
  if (!total) return 0;
  if (tree.activities.length) {
    return Math.round((tree.completedActivityIds.size / tree.activities.length) * 100);
  }
  return 0;
}
