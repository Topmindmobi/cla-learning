"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { importLmsJson } from "@/lib/admin/lms";
import { parseQuizCsv } from "@/lib/admin/assessments";
import type { UserRole } from "@/types/database";
import type { AdminActionState } from "./actions";

const STAFF_ROLES: UserRole[] = ["admin", "super_admin", "finance"];

async function requireAdmin() {
  const session = await requireSession({ roles: STAFF_ROLES });
  if (!isAdminClientConfigured()) {
    throw new Error("Admin data access is not configured (missing SUPABASE_SERVICE_ROLE_KEY).");
  }
  return session;
}

function revalidateTeaching(...paths: string[]) {
  revalidatePath("/admin");
  for (const p of paths) revalidatePath(p);
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function upsertCourse(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const id = String(formData.get("id") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return { error: "Title is required." };

    const slugInput = String(formData.get("slug") ?? "").trim();
    const slug = slugInput || slugify(title);
    const learnRaw = String(formData.get("what_you_will_learn") ?? "");
    const reqRaw = String(formData.get("requirements") ?? "");

    const row = {
      title,
      slug,
      subtitle: String(formData.get("subtitle") ?? "") || null,
      short_description: String(formData.get("short_description") ?? "") || null,
      full_description: String(formData.get("full_description") ?? "") || null,
      learning_outcomes: String(formData.get("learning_outcomes") ?? "") || null,
      target_audience: String(formData.get("target_audience") ?? "") || null,
      course_requirements: String(formData.get("course_requirements") ?? "") || null,
      career_benefits: String(formData.get("career_benefits") ?? "") || null,
      category: String(formData.get("category") ?? "professional_courses"),
      difficulty: String(formData.get("difficulty") ?? "beginner"),
      instructor_name: String(formData.get("instructor_name") ?? "") || null,
      instructor_title: String(formData.get("instructor_title") ?? "") || null,
      duration_hours: Number(formData.get("duration_hours") ?? 0) || null,
      price: Number(formData.get("price") ?? 0),
      currency: String(formData.get("currency") ?? "RWF"),
      language: String(formData.get("language") ?? "English"),
      thumbnail_url: String(formData.get("thumbnail_url") ?? "") || null,
      what_you_will_learn: learnRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      requirements: reqRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      is_published: String(formData.get("is_published") ?? "") === "on",
      is_featured: String(formData.get("is_featured") ?? "") === "on",
      updated_at: new Date().toISOString(),
    };

    const supabase = createAdminClient();
    if (id) {
      const { error } = await supabase.from("courses").update(row).eq("id", id);
      if (error) return { error: error.message };
      revalidateTeaching("/admin/courses", `/admin/courses/${id}/edit`, "/catalog");
      return { message: "Course saved." };
    }

    const { data, error } = await supabase.from("courses").insert(row).select("id").single();
    if (error) return { error: error.message };
    revalidateTeaching("/admin/courses", "/catalog");
    redirect(`/admin/courses/${data.id}/edit`);
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return { error: err instanceof Error ? err.message : "Could not save course." };
  }
}

export async function createLmsCourse(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const code = String(formData.get("code") ?? "").trim().toUpperCase();
    const title = String(formData.get("title") ?? "").trim();
    if (!code || !title) return { error: "Code and title are required." };

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("lms_courses")
      .insert({
        code,
        title,
        level: Number(formData.get("level") ?? 0) || null,
        description: String(formData.get("description") ?? "") || null,
        status: "draft",
        synced_course_id: String(formData.get("synced_course_id") ?? "") || null,
      })
      .select("id")
      .single();
    if (error) return { error: error.message };
    revalidateTeaching("/admin/lms");
    redirect(`/admin/lms/${data.id}`);
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return { error: err instanceof Error ? err.message : "Could not create LMS course." };
  }
}

export async function importLmsStructure(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const raw = String(formData.get("json") ?? "").trim();
    if (!raw) return { error: "Paste LMS JSON to import." };
    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return { error: "Invalid JSON." };
    }
    const result = await importLmsJson(payload as Parameters<typeof importLmsJson>[0]);
    revalidateTeaching("/admin/lms", `/admin/lms/${result.courseId}`);
    return {
      message: `Imported ${result.moduleCount} modules, ${result.lessonCount} lessons.`,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Import failed." };
  }
}

export async function addLmsModule(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const course_id = String(formData.get("course_id") ?? "");
    const code = String(formData.get("code") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    if (!course_id || !code || !title) return { error: "Course, code and title required." };

    const supabase = createAdminClient();
    const { count } = await supabase
      .from("lms_modules")
      .select("id", { count: "exact", head: true })
      .eq("course_id", course_id);
    const { error } = await supabase.from("lms_modules").insert({
      course_id,
      code,
      title,
      overview: String(formData.get("overview") ?? "") || null,
      sort_order: count ?? 0,
    });
    if (error) return { error: error.message };
    revalidateTeaching(`/admin/lms/${course_id}`);
    return { message: "Module added." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not add module." };
  }
}

export async function addLmsChapter(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const course_id = String(formData.get("course_id") ?? "");
    const module_id = String(formData.get("module_id") ?? "");
    const code = String(formData.get("code") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    if (!course_id || !module_id || !code || !title) {
      return { error: "Module, code and title required." };
    }

    const supabase = createAdminClient();
    const { count } = await supabase
      .from("lms_chapters")
      .select("id", { count: "exact", head: true })
      .eq("module_id", module_id);
    const { error } = await supabase.from("lms_chapters").insert({
      course_id,
      module_id,
      code,
      title,
      learning_outcome: String(formData.get("learning_outcome") ?? "") || null,
      sort_order: count ?? 0,
    });
    if (error) return { error: error.message };
    revalidateTeaching(`/admin/lms/${course_id}`);
    return { message: "Chapter added." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not add chapter." };
  }
}

export async function addLmsLesson(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const course_id = String(formData.get("course_id") ?? "");
    const pick = String(formData.get("chapter_pick") ?? "");
    const [module_id, chapter_id] = pick.includes("|")
      ? pick.split("|")
      : [String(formData.get("module_id") ?? ""), String(formData.get("chapter_id") ?? "")];
    const code = String(formData.get("code") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    if (!course_id || !module_id || !chapter_id || !code || !title) {
      return { error: "Chapter, code and title required." };
    }

    const supabase = createAdminClient();
    const { count } = await supabase
      .from("lms_lessons")
      .select("id", { count: "exact", head: true })
      .eq("chapter_id", chapter_id);
    const { error } = await supabase.from("lms_lessons").insert({
      course_id,
      module_id,
      chapter_id,
      code,
      title,
      lesson_type: String(formData.get("lesson_type") ?? "concept"),
      sort_order: count ?? 0,
      is_published: false,
    });
    if (error) return { error: error.message };
    revalidateTeaching(`/admin/lms/${course_id}`);
    return { message: "Lesson added." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not add lesson." };
  }
}

export async function setLmsCourseStatus(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "draft");
    if (!id) return { error: "Missing course." };
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("lms_courses")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidateTeaching("/admin/lms", `/admin/lms/${id}`);
    return { message: `Status → ${status}.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update status." };
  }
}

export async function createQuiz(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return { error: "Quiz title is required." };

    const csv = String(formData.get("csv") ?? "").trim();
    const questions = csv ? parseQuizCsv(csv) : [];

    const supabase = createAdminClient();
    const { error } = await supabase.from("module_quizzes").insert({
      title,
      description: String(formData.get("description") ?? "") || null,
      course_id: String(formData.get("course_id") ?? "") || null,
      questions,
      passing_score: Number(formData.get("passing_score") ?? 70),
      time_limit_minutes: Number(formData.get("time_limit_minutes") ?? 0) || null,
      is_published: String(formData.get("is_published") ?? "") === "on",
    });
    if (error) return { error: error.message };
    revalidateTeaching("/admin/assessments");
    return { message: `Quiz created${questions.length ? ` with ${questions.length} questions` : ""}.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create quiz." };
  }
}

export async function toggleQuizPublished(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const id = String(formData.get("id") ?? "");
    const published = String(formData.get("published") ?? "") === "true";
    if (!id) return { error: "Missing quiz." };
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("module_quizzes")
      .update({ is_published: published, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidateTeaching("/admin/assessments");
    return { message: published ? "Quiz published." : "Quiz unpublished." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update quiz." };
  }
}

export async function createQuestionBank(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { error: "Bank name is required." };
    const supabase = createAdminClient();
    const { error } = await supabase.from("question_banks").insert({
      name,
      description: String(formData.get("description") ?? "") || null,
      course_id: String(formData.get("course_id") ?? "") || null,
    });
    if (error) return { error: error.message };
    revalidateTeaching("/admin/assessments");
    return { message: "Question bank created." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create bank." };
  }
}

export async function addBankQuestion(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const bank_id = String(formData.get("bank_id") ?? "");
    const question_text = String(formData.get("question_text") ?? "").trim();
    if (!bank_id || !question_text) return { error: "Bank and question text required." };

    const options = [
      String(formData.get("option_a") ?? "").trim(),
      String(formData.get("option_b") ?? "").trim(),
      String(formData.get("option_c") ?? "").trim(),
      String(formData.get("option_d") ?? "").trim(),
    ].filter(Boolean);
    if (options.length < 2) return { error: "Need at least two options." };

    const correct = String(formData.get("correct") ?? "A").toUpperCase();
    const correct_index = Math.max(0, "ABCD".indexOf(correct));

    const supabase = createAdminClient();
    const { error } = await supabase.from("questions").insert({
      bank_id,
      course_id: String(formData.get("course_id") ?? "") || null,
      question_text,
      options,
      correct_index,
      explanation: String(formData.get("explanation") ?? "") || null,
      difficulty: String(formData.get("difficulty") ?? "medium"),
      topic: String(formData.get("topic") ?? "") || null,
    });
    if (error) return { error: error.message };
    revalidateTeaching("/admin/assessments");
    return { message: "Question added." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not add question." };
  }
}

export async function gradeAssignment(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const session = await requireAdmin();
    const id = String(formData.get("id") ?? "");
    const grade = Number(formData.get("grade") ?? 0);
    if (!id) return { error: "Missing submission." };

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("assignment_submissions")
      .update({
        grade,
        feedback: String(formData.get("feedback") ?? "") || null,
        status: "graded",
        graded_at: new Date().toISOString(),
        graded_by: session.email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidateTeaching("/admin/assessments");
    return { message: "Graded." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not grade." };
  }
}

export async function createAssignmentStub(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const student_email = String(formData.get("student_email") ?? "").trim().toLowerCase();
    const assignment_title = String(formData.get("assignment_title") ?? "").trim();
    if (!student_email || !assignment_title) return { error: "Email and title required." };

    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", student_email)
      .maybeSingle();
    const { error } = await supabase.from("assignment_submissions").insert({
      student_email,
      student_user_id: profile?.id ?? null,
      course_id: String(formData.get("course_id") ?? "") || null,
      assignment_title,
      submission_text: String(formData.get("submission_text") ?? "") || null,
      status: "submitted",
    });
    if (error) return { error: error.message };
    revalidateTeaching("/admin/assessments");
    return { message: "Submission recorded." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not record submission." };
  }
}
