import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";

export type LmsCourseRow = {
  id: string;
  code: string;
  title: string;
  level: number | null;
  description: string | null;
  status: string;
  synced_course_id: string | null;
  module_count?: number;
};

export type LmsModuleRow = {
  id: string;
  course_id: string;
  code: string;
  title: string;
  sort_order: number;
  overview: string | null;
  module_type: string | null;
  credits: number | null;
  is_published: boolean;
};

export type LmsChapterRow = {
  id: string;
  module_id: string;
  course_id: string;
  code: string;
  title: string;
  sort_order: number;
  learning_outcome: string | null;
};

export type LmsLessonRow = {
  id: string;
  chapter_id: string;
  module_id: string;
  course_id: string;
  code: string;
  title: string;
  lesson_type: string;
  sort_order: number;
  is_published: boolean;
};

export async function listLmsCourses(): Promise<LmsCourseRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("lms_courses")
    .select("id, code, title, level, description, status, synced_course_id")
    .order("code");
  if (error) throw new Error(error.message);

  const ids = (data ?? []).map((c) => c.id as string);
  const counts = new Map<string, number>();
  if (ids.length) {
    const { data: mods } = await supabase.from("lms_modules").select("id, course_id").in("course_id", ids);
    for (const m of mods ?? []) {
      const cid = m.course_id as string;
      counts.set(cid, (counts.get(cid) ?? 0) + 1);
    }
  }

  return (data ?? []).map((c) => ({
    ...(c as LmsCourseRow),
    module_count: counts.get(c.id as string) ?? 0,
  }));
}

export async function getLmsCourseTree(courseId: string) {
  if (!isAdminClientConfigured()) return null;
  const supabase = createAdminClient();
  const { data: course, error } = await supabase
    .from("lms_courses")
    .select("*")
    .eq("id", courseId)
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
    .order("sort_order");

  return {
    course: course as LmsCourseRow & Record<string, unknown>,
    modules: (modules ?? []) as LmsModuleRow[],
    chapters: (chapters ?? []) as LmsChapterRow[],
    lessons: (lessons ?? []) as LmsLessonRow[],
  };
}

/** Import Base44-style LMS JSON. Upserts course by code; replaces modules tree for that course. */
export async function importLmsJson(payload: {
  course: {
    code: string;
    title: string;
    level?: number;
    description?: string;
    credits_total?: number;
    tqt_hours?: number;
    glh_hours?: number;
    entry_requirement?: string;
    structure_note?: string;
    module_selection_rule?: unknown;
  };
  modules?: Array<{
    code: string;
    title: string;
    overview?: string;
    module_type?: string;
    credits?: number;
    chapters?: Array<{
      id?: string;
      code?: string;
      title: string;
      learning_outcome?: string;
      lessons?: Array<{
        id?: string;
        code?: string;
        title: string;
        lesson_type?: string;
        learning_objectives?: string[];
        introduction?: string;
        key_notes?: string;
        activity?: { title?: string; type?: string; description?: string };
      }>;
    }>;
  }>;
}) {
  const supabase = createAdminClient();
  const c = payload.course;
  if (!c?.code || !c?.title) throw new Error("course.code and course.title are required");

  const { data: existing } = await supabase
    .from("lms_courses")
    .select("id")
    .eq("code", c.code)
    .maybeSingle();

  let courseId = existing?.id as string | undefined;
  const courseRow = {
    code: c.code,
    title: c.title,
    level: c.level ?? null,
    description: c.description ?? null,
    credits_total: c.credits_total ?? null,
    tqt_hours: c.tqt_hours ?? null,
    glh_hours: c.glh_hours ?? null,
    entry_requirement: c.entry_requirement ?? null,
    structure_note: c.structure_note ?? null,
    module_selection_rule: c.module_selection_rule ?? {},
    updated_at: new Date().toISOString(),
  };

  if (courseId) {
    const { error } = await supabase.from("lms_courses").update(courseRow).eq("id", courseId);
    if (error) throw new Error(error.message);
    // Clear existing tree for re-import
    await supabase.from("lms_modules").delete().eq("course_id", courseId);
  } else {
    const { data, error } = await supabase
      .from("lms_courses")
      .insert({ ...courseRow, status: "draft" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    courseId = data.id as string;
  }

  let moduleCount = 0;
  let lessonCount = 0;

  for (let mi = 0; mi < (payload.modules ?? []).length; mi++) {
    const mod = payload.modules![mi];
    const { data: modRow, error: modErr } = await supabase
      .from("lms_modules")
      .insert({
        course_id: courseId,
        code: mod.code,
        title: mod.title,
        overview: mod.overview ?? null,
        module_type: mod.module_type ?? "core",
        credits: mod.credits ?? null,
        sort_order: mi,
        is_published: false,
      })
      .select("id")
      .single();
    if (modErr) throw new Error(modErr.message);
    moduleCount++;
    const moduleId = modRow.id as string;

    for (let ci = 0; ci < (mod.chapters ?? []).length; ci++) {
      const ch = mod.chapters![ci];
      const chCode = ch.code || ch.id || `${mod.code}-C${ci + 1}`;
      const { data: chRow, error: chErr } = await supabase
        .from("lms_chapters")
        .insert({
          course_id: courseId,
          module_id: moduleId,
          code: chCode,
          title: ch.title,
          learning_outcome: ch.learning_outcome ?? null,
          sort_order: ci,
          is_published: false,
        })
        .select("id")
        .single();
      if (chErr) throw new Error(chErr.message);
      const chapterId = chRow.id as string;

      for (let li = 0; li < (ch.lessons ?? []).length; li++) {
        const les = ch.lessons![li];
        const lesCode = les.code || les.id || `${chCode}-L${li + 1}`;
        const lessonType = ["concept", "applied_exercise", "case_study", "reading", "video"].includes(
          les.lesson_type ?? "",
        )
          ? les.lesson_type
          : "concept";
        const { data: lesRow, error: lesErr } = await supabase
          .from("lms_lessons")
          .insert({
            course_id: courseId,
            module_id: moduleId,
            chapter_id: chapterId,
            code: lesCode,
            title: les.title,
            lesson_type: lessonType,
            learning_objectives: les.learning_objectives ?? [],
            introduction: les.introduction ?? null,
            key_notes: Array.isArray(les.key_notes)
              ? (les.key_notes as string[]).join("\n")
              : (les.key_notes ?? null),
            sort_order: li,
            is_published: false,
          })
          .select("id")
          .single();
        if (lesErr) throw new Error(lesErr.message);
        lessonCount++;

        if (les.activity?.title) {
          const rawType = (les.activity.type || "content").toLowerCase();
          const activityType =
            rawType.includes("quiz")
              ? "quiz"
              : rawType.includes("assign")
                ? "assignment"
                : rawType.includes("discuss")
                  ? "discussion"
                  : rawType.includes("video")
                    ? "video"
                    : "content";
          await supabase.from("lms_activities").insert({
            lesson_id: lesRow.id,
            title: les.activity.title,
            activity_type: activityType,
            description: les.activity.description ?? null,
            sort_order: 0,
            is_published: false,
          });
        }
      }
    }
  }

  return { courseId, moduleCount, lessonCount };
}
