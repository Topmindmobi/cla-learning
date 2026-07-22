"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import {
  getPublishedQuizForLearner,
  gradeQuizAttempt,
} from "@/lib/student/quizzes";
import type { QuizQuestion } from "@/lib/admin/assessments";

export type LearnerActionState = {
  error?: string;
  message?: string;
  result?: {
    score_percent: number;
    correct_count: number;
    total_questions: number;
    is_passed: boolean;
    attempt_number: number;
    graded: Array<{
      question_id: string;
      selected: string | null;
      correct_option_id: string;
      is_correct: boolean;
      explanation?: string;
    }>;
  };
};

export async function markActivityComplete(
  _prev: LearnerActionState,
  formData: FormData,
): Promise<LearnerActionState> {
  try {
    const session = await requireSession();
    if (!isAdminClientConfigured()) {
      return { error: "Learning data is not configured." };
    }
    const activity_id = String(formData.get("activity_id") ?? "");
    const course_id = String(formData.get("course_id") ?? "");
    if (!activity_id) return { error: "Missing activity." };

    const supabase = createAdminClient();
    const { error } = await supabase.from("lms_activity_progress").upsert(
      {
        activity_id,
        user_id: session.userId,
        completed: true,
        completed_at: new Date().toISOString(),
        progress_data: {},
      },
      { onConflict: "activity_id,user_id" },
    );
    if (error) return { error: error.message };

    if (course_id) revalidatePath(`/dashboard/learn/${course_id}`);
    revalidatePath("/dashboard/course");
    return { message: `Marked complete:${activity_id}` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save progress." };
  }
}

export async function submitQuizAttempt(
  _prev: LearnerActionState,
  formData: FormData,
): Promise<LearnerActionState> {
  try {
    const session = await requireSession();
    if (!isAdminClientConfigured()) {
      return { error: "Quiz data is not configured." };
    }

    const quiz_id = String(formData.get("quiz_id") ?? "");
    if (!quiz_id) return { error: "Missing quiz." };

    const quiz = await getPublishedQuizForLearner(quiz_id, session.userId);
    if (!quiz) return { error: "Quiz not found or not published." };
    if (!quiz.questions.length) return { error: "This quiz has no questions yet." };

    if (!quiz.allow_retake && quiz.attempt_count > 0) {
      return { error: "Retakes are not allowed for this quiz." };
    }
    if (quiz.max_attempts != null && quiz.attempt_count >= quiz.max_attempts) {
      return { error: `Maximum attempts (${quiz.max_attempts}) reached.` };
    }

    const responses: Record<string, string> = {};
    for (const q of quiz.questions) {
      const val = String(formData.get(`answer_${q.id}`) ?? "").trim();
      if (val) responses[q.id] = val;
    }

    const graded = gradeQuizAttempt(quiz.questions as QuizQuestion[], responses);
    const is_passed = graded.score_percent >= quiz.passing_score;
    const attempt_number = quiz.attempt_count + 1;

    const supabase = createAdminClient();
    const { error } = await supabase.from("module_quiz_results").insert({
      quiz_id,
      user_id: session.userId,
      student_email: session.email,
      responses,
      score_percent: graded.score_percent,
      correct_count: graded.correct_count,
      total_questions: graded.total_questions,
      is_passed,
      attempt_number,
    });
    if (error) return { error: error.message };

    revalidatePath("/dashboard/quizzes");
    revalidatePath(`/dashboard/quizzes/${quiz_id}`);
    return {
      message: is_passed
        ? `Passed with ${graded.score_percent}%`
        : `Scored ${graded.score_percent}% — pass mark is ${quiz.passing_score}%`,
      result: {
        score_percent: graded.score_percent,
        correct_count: graded.correct_count,
        total_questions: graded.total_questions,
        is_passed,
        attempt_number,
        graded: graded.graded,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not submit quiz." };
  }
}

export async function submitAssignment(
  _prev: LearnerActionState,
  formData: FormData,
): Promise<LearnerActionState> {
  try {
    const session = await requireSession();
    if (!isAdminClientConfigured()) return { error: "Assignments are not configured." };

    const assignment_title = String(formData.get("assignment_title") ?? "").trim();
    const submission_text = String(formData.get("submission_text") ?? "").trim();
    const id = String(formData.get("id") ?? "");
    if (!assignment_title) return { error: "Title is required." };
    if (!submission_text) return { error: "Write your submission before sending." };

    const supabase = createAdminClient();
    if (id) {
      const { error } = await supabase
        .from("assignment_submissions")
        .update({
          submission_text,
          status: "submitted",
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("student_user_id", session.userId);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from("assignment_submissions").insert({
        student_email: session.email,
        student_user_id: session.userId,
        course_id: String(formData.get("course_id") ?? "") || null,
        assignment_title,
        submission_text,
        status: "submitted",
      });
      if (error) return { error: error.message };
    }

    revalidatePath("/dashboard/assignments");
    revalidatePath("/dashboard/grades");
    return { message: "Assignment submitted." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not submit." };
  }
}

export async function requestCoursePurchase(
  _prev: LearnerActionState,
  formData: FormData,
): Promise<LearnerActionState> {
  try {
    const session = await requireSession();
    if (!isAdminClientConfigured()) return { error: "Payments are not configured." };

    const course_id = String(formData.get("course_id") ?? "");
    const amount = Number(formData.get("amount") ?? 0);
    if (!course_id) return { error: "Choose a course." };

    const supabase = createAdminClient();
    const { error } = await supabase.from("payments").insert({
      student_email: session.email,
      student_user_id: session.userId,
      course_id,
      amount_due: amount > 0 ? amount : 0,
      amount_paid: 0,
      currency: String(formData.get("currency") ?? "RWF") || "RWF",
      payment_type: "per_course",
      status: "pending",
      approved_by_admin: false,
      notes: String(formData.get("notes") ?? "") || "Learner purchase request",
    });
    if (error) return { error: error.message };

    revalidatePath("/dashboard/billing");
    return { message: "Purchase request sent. Finance will confirm access." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not request purchase." };
  }
}

export async function markNotificationRead(
  _prev: LearnerActionState,
  formData: FormData,
): Promise<LearnerActionState> {
  try {
    const session = await requireSession();
    if (!isAdminClientConfigured()) return { error: "Not configured." };
    const id = String(formData.get("id") ?? "");
    if (!id) return { error: "Missing notification." };
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", session.userId);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/notifications");
    return { message: "Marked read." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update." };
  }
}

export async function postDiscussion(
  _prev: LearnerActionState,
  formData: FormData,
): Promise<LearnerActionState> {
  try {
    const session = await requireSession();
    if (!isAdminClientConfigured()) return { error: "Discussions are not configured." };
    const activity_id = String(formData.get("activity_id") ?? "");
    const course_id = String(formData.get("course_id") ?? "");
    const body = String(formData.get("body") ?? "").trim();
    if (!activity_id || !body) return { error: "Write a short reply." };

    const supabase = createAdminClient();
    const { error } = await supabase.from("discussion_posts").insert({
      activity_id,
      user_id: session.userId,
      author_name: session.profile.full_name || session.email.split("@")[0],
      author_email: session.email,
      body,
      parent_id: String(formData.get("parent_id") ?? "") || null,
    });
    if (error) return { error: error.message };
    if (course_id) revalidatePath(`/dashboard/learn/${course_id}`);
    return { message: "Posted." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not post." };
  }
}

export async function issueCertificateIfEligible(
  _prev: LearnerActionState,
  formData: FormData,
): Promise<LearnerActionState> {
  try {
    const session = await requireSession();
    if (!isAdminClientConfigured()) return { error: "Not configured." };
    const enrollment_id = String(formData.get("enrollment_id") ?? "");
    if (!enrollment_id) return { error: "Missing enrollment." };

    const supabase = createAdminClient();
    const { data: enr, error: readErr } = await supabase
      .from("enrollments")
      .select("id, progress_percent, status, certificate_issued")
      .eq("id", enrollment_id)
      .eq("user_id", session.userId)
      .maybeSingle();
    if (readErr) return { error: readErr.message };
    if (!enr) return { error: "Enrollment not found." };
    if (enr.certificate_issued) return { message: "Certificate already issued." };
    if (Number(enr.progress_percent) < 100 && enr.status !== "completed") {
      return { error: "Finish the course (100%) before claiming a certificate." };
    }

    const { error } = await supabase
      .from("enrollments")
      .update({
        certificate_issued: true,
        status: "completed",
        completed_date: new Date().toISOString().slice(0, 10),
        updated_at: new Date().toISOString(),
      })
      .eq("id", enrollment_id);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/certificates");
    return { message: "Certificate issued." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not issue certificate." };
  }
}
