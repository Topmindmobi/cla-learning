import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import type { ModuleQuizRow, QuizQuestion } from "@/lib/admin/assessments";

export type LearnerQuizSummary = {
  id: string;
  title: string;
  description: string | null;
  course_id: string | null;
  course_title?: string;
  question_count: number;
  passing_score: number;
  time_limit_minutes: number | null;
  allow_retake: boolean;
  max_attempts: number | null;
  best_score: number | null;
  attempt_count: number;
  last_passed: boolean;
};

export type LearnerQuizDetail = ModuleQuizRow & {
  allow_retake: boolean;
  max_attempts: number | null;
  attempt_count: number;
  best_score: number | null;
};

export type QuizResultRow = {
  id: string;
  quiz_id: string;
  score_percent: number;
  correct_count: number;
  total_questions: number;
  is_passed: boolean;
  attempt_number: number;
  submitted_at: string;
  responses: Record<string, string>;
};

/** Public view of questions — correct answers stripped until after submit. */
export type LearnerQuizQuestion = {
  id: string;
  question_text: string;
  options: { id: string; text: string }[];
};

export async function listPublishedQuizzesForLearner(
  userId: string,
): Promise<LearnerQuizSummary[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("module_quizzes")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const courseIds = [
    ...new Set((data ?? []).map((r) => r.course_id).filter(Boolean) as string[]),
  ];
  const titles = new Map<string, string>();
  if (courseIds.length) {
    const { data: courses } = await supabase
      .from("courses")
      .select("id, title")
      .in("id", courseIds);
    for (const c of courses ?? []) titles.set(c.id as string, c.title as string);
  }

  const quizIds = (data ?? []).map((r) => r.id as string);
  const best = new Map<string, { score: number; attempts: number; passed: boolean }>();
  if (quizIds.length) {
    const { data: results } = await supabase
      .from("module_quiz_results")
      .select("quiz_id, score_percent, is_passed")
      .eq("user_id", userId)
      .in("quiz_id", quizIds);
    for (const row of results ?? []) {
      const qid = row.quiz_id as string;
      const score = Number(row.score_percent ?? 0);
      const cur = best.get(qid) ?? { score: -1, attempts: 0, passed: false };
      cur.attempts += 1;
      if (score > cur.score) cur.score = score;
      if (row.is_passed) cur.passed = true;
      best.set(qid, cur);
    }
  }

  return (data ?? []).map((r) => {
    const questions = (r.questions as QuizQuestion[]) ?? [];
    const stats = best.get(r.id as string);
    return {
      id: r.id as string,
      title: r.title as string,
      description: (r.description as string | null) ?? null,
      course_id: (r.course_id as string | null) ?? null,
      course_title: r.course_id ? titles.get(r.course_id as string) : undefined,
      question_count: questions.length,
      passing_score: Number(r.passing_score ?? 70),
      time_limit_minutes: (r.time_limit_minutes as number | null) ?? null,
      allow_retake: r.allow_retake !== false,
      max_attempts: (r.max_attempts as number | null) ?? null,
      best_score: stats && stats.score >= 0 ? stats.score : null,
      attempt_count: stats?.attempts ?? 0,
      last_passed: Boolean(stats?.passed),
    };
  });
}

export async function getPublishedQuizForLearner(
  quizId: string,
  userId: string,
): Promise<LearnerQuizDetail | null> {
  if (!isAdminClientConfigured()) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("module_quizzes")
    .select("*")
    .eq("id", quizId)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  let course_title: string | undefined;
  if (data.course_id) {
    const { data: course } = await supabase
      .from("courses")
      .select("title")
      .eq("id", data.course_id)
      .maybeSingle();
    course_title = course?.title as string | undefined;
  }

  const { data: results } = await supabase
    .from("module_quiz_results")
    .select("score_percent, is_passed")
    .eq("user_id", userId)
    .eq("quiz_id", quizId);
  const attempt_count = results?.length ?? 0;
  const best_score =
    results && results.length
      ? Math.max(...results.map((r) => Number(r.score_percent ?? 0)))
      : null;

  return {
    id: data.id as string,
    title: data.title as string,
    description: (data.description as string | null) ?? null,
    course_id: (data.course_id as string | null) ?? null,
    course_title,
    questions: (data.questions as QuizQuestion[]) ?? [],
    passing_score: Number(data.passing_score ?? 70),
    time_limit_minutes: (data.time_limit_minutes as number | null) ?? null,
    is_published: true,
    created_at: (data.created_at as string | null) ?? null,
    allow_retake: data.allow_retake !== false,
    max_attempts: (data.max_attempts as number | null) ?? null,
    attempt_count,
    best_score,
  };
}

export function stripQuizAnswers(questions: QuizQuestion[]): LearnerQuizQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    question_text: q.question_text,
    options: q.options.map((o) => ({ id: o.id, text: o.text })),
  }));
}

export async function listQuizResultsForUser(
  userId: string,
  quizId?: string,
): Promise<QuizResultRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  let q = supabase
    .from("module_quiz_results")
    .select("*")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(50);
  if (quizId) q = q.eq("quiz_id", quizId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    quiz_id: r.quiz_id as string,
    score_percent: Number(r.score_percent ?? 0),
    correct_count: Number(r.correct_count ?? 0),
    total_questions: Number(r.total_questions ?? 0),
    is_passed: Boolean(r.is_passed),
    attempt_number: Number(r.attempt_number ?? 1),
    submitted_at: r.submitted_at as string,
    responses: (r.responses as Record<string, string>) ?? {},
  }));
}

export function gradeQuizAttempt(
  questions: QuizQuestion[],
  responses: Record<string, string>,
): {
  correct_count: number;
  total_questions: number;
  score_percent: number;
  graded: Array<{
    question_id: string;
    selected: string | null;
    correct_option_id: string;
    is_correct: boolean;
    explanation?: string;
  }>;
} {
  const graded = questions.map((q) => {
    const selected = responses[q.id] ?? null;
    const is_correct = selected != null && selected === q.correct_option_id;
    return {
      question_id: q.id,
      selected,
      correct_option_id: q.correct_option_id,
      is_correct,
      explanation: q.explanation,
    };
  });
  const correct_count = graded.filter((g) => g.is_correct).length;
  const total_questions = questions.length;
  const score_percent =
    total_questions === 0 ? 0 : Math.round((correct_count / total_questions) * 100);
  return { correct_count, total_questions, score_percent, graded };
}
