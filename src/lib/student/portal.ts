import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import type { QuizResultRow } from "@/lib/student/quizzes";
import { listQuizResultsForUser } from "@/lib/student/quizzes";

export type LearnerPayment = {
  id: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string;
  payment_type: string;
  approved_by_admin: boolean;
  course_title?: string;
  created_at: string | null;
};

export type LearnerInvoice = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string | null;
  course_title?: string;
};

export type LearnerSession = {
  id: string;
  title: string;
  start_at: string | null;
  end_at: string | null;
  location: string | null;
  meeting_url: string | null;
  status: string;
  course_title?: string;
};

export type LearnerAssignment = {
  id: string;
  assignment_title: string;
  status: string;
  grade: number | null;
  max_score: number;
  feedback: string | null;
  submission_text: string | null;
  submitted_at: string | null;
  course_title?: string;
  course_id: string | null;
};

export type LearnerCertificate = {
  enrollment_id: string;
  course_id: string;
  course_title: string;
  completed_date: string | null;
  progress_percent: number;
  certificate_issued: boolean;
};

export type LearnerNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export type GradeItem = {
  id: string;
  kind: "quiz" | "assignment";
  title: string;
  score: number | null;
  max: number;
  percent: number | null;
  status: string;
  when: string | null;
  passed?: boolean;
};

async function courseTitles(ids: string[]) {
  if (!ids.length) return new Map<string, string>();
  const supabase = createAdminClient();
  const { data } = await supabase.from("courses").select("id, title").in("id", ids);
  return new Map((data ?? []).map((c) => [c.id as string, c.title as string]));
}

function ownRowsFilter(userId: string, email: string) {
  const safe = email.replace(/"/g, "");
  return `student_user_id.eq.${userId},student_email.eq."${safe}"`;
}

export async function listLearnerPayments(
  userId: string,
  email: string,
): Promise<LearnerPayment[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .or(ownRowsFilter(userId, email))
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  const map = await courseTitles([
    ...new Set((data ?? []).map((r) => r.course_id).filter(Boolean) as string[]),
  ]);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    amount_due: Number(r.amount_due ?? 0),
    amount_paid: Number(r.amount_paid ?? 0),
    currency: (r.currency as string) || "RWF",
    status: r.status as string,
    payment_type: (r.payment_type as string) || "full",
    approved_by_admin: Boolean(r.approved_by_admin),
    course_title: r.course_id ? map.get(r.course_id as string) : undefined,
    created_at: (r.created_at as string | null) ?? null,
  }));
}

export async function listLearnerInvoices(
  userId: string,
  email: string,
): Promise<LearnerInvoice[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .or(ownRowsFilter(userId, email))
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  const map = await courseTitles([
    ...new Set((data ?? []).map((r) => r.course_id).filter(Boolean) as string[]),
  ]);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    amount: Number(r.amount ?? 0),
    currency: (r.currency as string) || "RWF",
    status: r.status as string,
    due_date: (r.due_date as string | null) ?? null,
    course_title: r.course_id ? map.get(r.course_id as string) : undefined,
  }));
}

export async function listLearnerSessions(userId: string): Promise<LearnerSession[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", userId)
    .neq("status", "dropped");
  const courseIds = (enrollments ?? []).map((e) => e.course_id as string);

  let q = supabase
    .from("class_sessions")
    .select("*")
    .order("start_at", { ascending: true })
    .limit(50);

  if (courseIds.length) {
    q = q.or(`course_id.in.(${courseIds.join(",")}),course_id.is.null`);
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const map = await courseTitles([
    ...new Set((data ?? []).map((r) => r.course_id).filter(Boolean) as string[]),
  ]);

  return (data ?? []).map((r) => ({
    id: r.id as string,
    title: r.title as string,
    start_at: (r.start_at as string | null) ?? null,
    end_at: (r.end_at as string | null) ?? null,
    location: (r.location as string | null) ?? null,
    meeting_url: (r.meeting_url as string | null) ?? null,
    status: r.status as string,
    course_title: r.course_id ? map.get(r.course_id as string) : undefined,
  }));
}

export async function listLearnerAssignments(
  userId: string,
  email: string,
): Promise<LearnerAssignment[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("assignment_submissions")
    .select("*")
    .or(ownRowsFilter(userId, email))
    .order("submitted_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  const map = await courseTitles([
    ...new Set((data ?? []).map((r) => r.course_id).filter(Boolean) as string[]),
  ]);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    assignment_title: r.assignment_title as string,
    status: r.status as string,
    grade: r.grade != null ? Number(r.grade) : null,
    max_score: Number(r.max_score ?? 100),
    feedback: (r.feedback as string | null) ?? null,
    submission_text: (r.submission_text as string | null) ?? null,
    submitted_at: (r.submitted_at as string | null) ?? null,
    course_id: (r.course_id as string | null) ?? null,
    course_title: r.course_id ? map.get(r.course_id as string) : undefined,
  }));
}

export async function listLearnerCertificates(userId: string): Promise<LearnerCertificate[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("id, course_id, completed_date, progress_percent, certificate_issued, status")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);

  const map = await courseTitles([
    ...new Set((data ?? []).map((r) => r.course_id as string)),
  ]);

  return (data ?? [])
    .filter((r) => r.certificate_issued || r.status === "completed" || Number(r.progress_percent) >= 100)
    .map((r) => ({
      enrollment_id: r.id as string,
      course_id: r.course_id as string,
      course_title: map.get(r.course_id as string) ?? "Course",
      completed_date: (r.completed_date as string | null) ?? null,
      progress_percent: Number(r.progress_percent ?? 0),
      certificate_issued: Boolean(r.certificate_issued),
    }));
}

export async function listLearnerGrades(
  userId: string,
  email: string,
): Promise<GradeItem[]> {
  const [quizResults, assignments] = await Promise.all([
    listQuizResultsForUser(userId),
    listLearnerAssignments(userId, email),
  ]);

  const quizTitles = new Map<string, string>();
  if (isAdminClientConfigured() && quizResults.length) {
    const supabase = createAdminClient();
    const ids = [...new Set(quizResults.map((r) => r.quiz_id))];
    const { data } = await supabase.from("module_quizzes").select("id, title").in("id", ids);
    for (const q of data ?? []) quizTitles.set(q.id as string, q.title as string);
  }

  const items: GradeItem[] = [];
  for (const r of quizResults as QuizResultRow[]) {
    items.push({
      id: r.id,
      kind: "quiz",
      title: quizTitles.get(r.quiz_id) ?? "Quiz",
      score: r.correct_count,
      max: r.total_questions,
      percent: r.score_percent,
      status: r.is_passed ? "passed" : "failed",
      when: r.submitted_at,
      passed: r.is_passed,
    });
  }
  for (const a of assignments) {
    items.push({
      id: a.id,
      kind: "assignment",
      title: a.assignment_title,
      score: a.grade,
      max: a.max_score,
      percent: a.grade != null ? Math.round((a.grade / a.max_score) * 100) : null,
      status: a.status,
      when: a.submitted_at,
    });
  }

  return items.sort((a, b) => (b.when ?? "").localeCompare(a.when ?? ""));
}

export async function listLearnerNotifications(userId: string): Promise<LearnerNotification[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    // Table may not exist yet before migration 008
    if (error.message.includes("notifications")) return [];
    throw new Error(error.message);
  }
  return (data ?? []).map((r) => ({
    id: r.id as string,
    title: r.title as string,
    message: r.message as string,
    type: (r.type as string) || "info",
    link: (r.link as string | null) ?? null,
    is_read: Boolean(r.is_read),
    created_at: r.created_at as string,
  }));
}

export async function listDiscussionPosts(activityId: string) {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("discussion_posts")
    .select("*")
    .eq("activity_id", activityId)
    .order("created_at", { ascending: true });
  if (error) {
    if (error.message.includes("discussion_posts")) return [];
    throw new Error(error.message);
  }
  return data ?? [];
}
