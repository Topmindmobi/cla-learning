import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";

export type QuizQuestion = {
  id: string;
  question_text: string;
  options: { id: string; text: string }[];
  correct_option_id: string;
  explanation?: string;
};

export type ModuleQuizRow = {
  id: string;
  title: string;
  description: string | null;
  course_id: string | null;
  course_title?: string;
  questions: QuizQuestion[];
  passing_score: number;
  time_limit_minutes: number | null;
  is_published: boolean;
  created_at: string | null;
};

export type QuestionBankRow = {
  id: string;
  name: string;
  description: string | null;
  course_id: string | null;
  course_title?: string;
  question_count?: number;
};

export type QuestionRow = {
  id: string;
  bank_id: string | null;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  difficulty: string | null;
  topic: string | null;
};

export type AssignmentRow = {
  id: string;
  student_email: string;
  assignment_title: string;
  status: string;
  grade: number | null;
  max_score: number;
  submitted_at: string | null;
  course_title?: string;
  submission_text: string | null;
};

export type ApplicantRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  course_id: string | null;
  course_title?: string;
  notes: string | null;
  created_at: string | null;
};

async function courseTitles(ids: string[]) {
  if (!ids.length) return new Map<string, string>();
  const supabase = createAdminClient();
  const { data } = await supabase.from("courses").select("id, title").in("id", ids);
  return new Map((data ?? []).map((c) => [c.id as string, c.title as string]));
}

export async function listModuleQuizzes(): Promise<ModuleQuizRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("module_quizzes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const map = await courseTitles([
    ...new Set((data ?? []).map((r) => r.course_id).filter(Boolean) as string[]),
  ]);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    title: r.title as string,
    description: (r.description as string | null) ?? null,
    course_id: (r.course_id as string | null) ?? null,
    course_title: r.course_id ? map.get(r.course_id as string) : undefined,
    questions: (r.questions as QuizQuestion[]) ?? [],
    passing_score: Number(r.passing_score ?? 70),
    time_limit_minutes: (r.time_limit_minutes as number | null) ?? null,
    is_published: Boolean(r.is_published),
    created_at: (r.created_at as string | null) ?? null,
  }));
}

export async function listQuestionBanks(): Promise<QuestionBankRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("question_banks").select("*").order("name");
  if (error) throw new Error(error.message);
  const ids = (data ?? []).map((b) => b.id as string);
  const counts = new Map<string, number>();
  if (ids.length) {
    const { data: qs } = await supabase.from("questions").select("id, bank_id").in("bank_id", ids);
    for (const q of qs ?? []) {
      const bid = q.bank_id as string;
      counts.set(bid, (counts.get(bid) ?? 0) + 1);
    }
  }
  const map = await courseTitles([
    ...new Set((data ?? []).map((r) => r.course_id).filter(Boolean) as string[]),
  ]);
  return (data ?? []).map((b) => ({
    id: b.id as string,
    name: b.name as string,
    description: (b.description as string | null) ?? null,
    course_id: (b.course_id as string | null) ?? null,
    course_title: b.course_id ? map.get(b.course_id as string) : undefined,
    question_count: counts.get(b.id as string) ?? 0,
  }));
}

export async function listQuestions(bankId?: string): Promise<QuestionRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  let q = supabase.from("questions").select("*").order("sort_order").limit(200);
  if (bankId) q = q.eq("bank_id", bankId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    bank_id: (r.bank_id as string | null) ?? null,
    question_text: r.question_text as string,
    options: (r.options as string[]) ?? [],
    correct_index: Number(r.correct_index ?? 0),
    explanation: (r.explanation as string | null) ?? null,
    difficulty: (r.difficulty as string | null) ?? null,
    topic: (r.topic as string | null) ?? null,
  }));
}

export async function listAssignments(): Promise<AssignmentRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("assignment_submissions")
    .select("*")
    .order("submitted_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  const map = await courseTitles([
    ...new Set((data ?? []).map((r) => r.course_id).filter(Boolean) as string[]),
  ]);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    student_email: r.student_email as string,
    assignment_title: r.assignment_title as string,
    status: r.status as string,
    grade: r.grade != null ? Number(r.grade) : null,
    max_score: Number(r.max_score ?? 100),
    submitted_at: (r.submitted_at as string | null) ?? null,
    course_title: r.course_id ? map.get(r.course_id as string) : undefined,
    submission_text: (r.submission_text as string | null) ?? null,
  }));
}

export async function listApplicants(): Promise<ApplicantRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applicants")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  const map = await courseTitles([
    ...new Set((data ?? []).map((r) => r.course_id).filter(Boolean) as string[]),
  ]);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    full_name: r.full_name as string,
    email: r.email as string,
    phone: (r.phone as string | null) ?? null,
    status: r.status as string,
    course_id: (r.course_id as string | null) ?? null,
    course_title: r.course_id ? map.get(r.course_id as string) : undefined,
    notes: (r.notes as string | null) ?? null,
    created_at: (r.created_at as string | null) ?? null,
  }));
}

/** Parse quiz CSV: question_text,option_a,option_b,option_c,option_d,correct_option,explanation */
export function parseQuizCsv(text: string): QuizQuestion[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.toLowerCase().startsWith("question_text"));
  return lines.map((line, i) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const [question_text, a, b, c, d, correct, explanation] = cols;
    const options = [
      { id: "A", text: a || "" },
      { id: "B", text: b || "" },
      { id: "C", text: c || "" },
      { id: "D", text: d || "" },
    ].filter((o) => o.text);
    const correct_option_id = (correct || "A").toUpperCase().slice(0, 1);
    return {
      id: `q${i + 1}`,
      question_text: question_text || `Question ${i + 1}`,
      options,
      correct_option_id,
      explanation: explanation || undefined,
    };
  });
}
