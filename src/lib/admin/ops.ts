import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";

export type PaymentRow = {
  id: string;
  student_email: string;
  course_id: string | null;
  course_title?: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  payment_type: string;
  status: string;
  approved_by_admin: boolean;
  notes: string | null;
  created_at: string | null;
};

export type CohortRow = {
  id: string;
  name: string;
  course_id: string | null;
  course_title?: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  notes: string | null;
};

export type InstructorRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  title: string | null;
  status: string;
  availability: string | null;
};

export type SessionRow = {
  id: string;
  title: string;
  course_id: string | null;
  course_title?: string;
  start_at: string | null;
  end_at: string | null;
  location: string | null;
  meeting_url: string | null;
  status: string;
};

export type AttendanceRow = {
  id: string;
  class_id: string | null;
  student_email: string;
  student_name: string | null;
  status: string;
  class_title: string | null;
  class_start: string | null;
  course_id: string | null;
};

export type InvoiceRow = {
  id: string;
  student_email: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string | null;
  course_title?: string;
};

export type CouponRow = {
  id: string;
  code: string;
  description: string | null;
  discount_percent: number | null;
  discount_amount: number | null;
  active: boolean;
  expires_at: string | null;
};

async function courseTitleMap(ids: string[]) {
  if (!ids.length) return new Map<string, string>();
  const supabase = createAdminClient();
  const { data } = await supabase.from("courses").select("id, title").in("id", ids);
  return new Map((data ?? []).map((c) => [c.id as string, c.title as string]));
}

export async function listPayments(): Promise<PaymentRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  const map = await courseTitleMap([
    ...new Set((data ?? []).map((r) => r.course_id).filter(Boolean) as string[]),
  ]);
  return (data ?? []).map((r) => ({
    ...(r as PaymentRow),
    course_title: r.course_id ? map.get(r.course_id as string) : undefined,
  }));
}

export async function listCohorts(): Promise<CohortRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("cohorts").select("*").order("start_date", { ascending: false });
  if (error) throw new Error(error.message);
  const map = await courseTitleMap([
    ...new Set((data ?? []).map((r) => r.course_id).filter(Boolean) as string[]),
  ]);
  return (data ?? []).map((r) => ({
    ...(r as CohortRow),
    course_title: r.course_id ? map.get(r.course_id as string) : undefined,
  }));
}

export async function listInstructors(): Promise<InstructorRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("instructors").select("*").order("full_name");
  if (error) throw new Error(error.message);
  return (data ?? []) as InstructorRow[];
}

export async function listSessions(): Promise<SessionRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("class_sessions")
    .select("*")
    .order("start_at", { ascending: true })
    .limit(200);
  if (error) throw new Error(error.message);
  const map = await courseTitleMap([
    ...new Set((data ?? []).map((r) => r.course_id).filter(Boolean) as string[]),
  ]);
  return (data ?? []).map((r) => ({
    ...(r as SessionRow),
    course_title: r.course_id ? map.get(r.course_id as string) : undefined,
  }));
}

export async function listAttendance(): Promise<AttendanceRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("class_attendance")
    .select("*")
    .order("class_start", { ascending: false })
    .limit(300);
  if (error) throw new Error(error.message);
  return (data ?? []) as AttendanceRow[];
}

export async function listInvoices(): Promise<InvoiceRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  const map = await courseTitleMap([
    ...new Set((data ?? []).map((r) => r.course_id).filter(Boolean) as string[]),
  ]);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    student_email: r.student_email as string,
    amount: Number(r.amount ?? 0),
    currency: (r.currency as string) || "RWF",
    status: r.status as string,
    due_date: (r.due_date as string | null) ?? null,
    course_title: r.course_id ? map.get(r.course_id as string) : undefined,
  }));
}

export async function listCoupons(): Promise<CouponRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("coupons").select("*").order("code");
  if (error) throw new Error(error.message);
  return (data ?? []) as CouponRow[];
}

export async function listPaymentPlans() {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("payment_plans").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const map = await courseTitleMap([
    ...new Set((data ?? []).map((r) => r.course_id).filter(Boolean) as string[]),
  ]);
  return (data ?? []).map((r) => ({
    ...r,
    course_title: r.course_id ? map.get(r.course_id as string) : undefined,
  }));
}

export async function getRevenueSummary() {
  const payments = await listPayments();
  const collected = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
  const outstanding = payments.reduce(
    (sum, p) => sum + Math.max(0, Number(p.amount_due || 0) - Number(p.amount_paid || 0)),
    0,
  );
  const overdue = payments.filter((p) => p.status === "overdue").length;
  const pendingApproval = payments.filter((p) => !p.approved_by_admin).length;
  return { collected, outstanding, overdue, pendingApproval, currency: "RWF", payments };
}

export async function listAtRiskStudents() {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select("id, user_id, course_id, progress_percent, status, updated_at")
    .eq("status", "active")
    .lt("progress_percent", 40)
    .order("progress_percent", { ascending: true })
    .limit(100);
  if (error) throw new Error(error.message);
  if (!enrollments?.length) return [];

  const userIds = [...new Set(enrollments.map((e) => e.user_id as string))];
  const courseIds = [...new Set(enrollments.map((e) => e.course_id as string))];
  const [{ data: profiles }, { data: courses }] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name").in("id", userIds),
    supabase.from("courses").select("id, title").in("id", courseIds),
  ]);
  const pMap = new Map((profiles ?? []).map((p) => [p.id as string, p]));
  const cMap = new Map((courses ?? []).map((c) => [c.id as string, c]));

  return enrollments.map((e) => {
    const profile = pMap.get(e.user_id as string);
    const course = cMap.get(e.course_id as string);
    return {
      id: e.id as string,
      progress_percent: Number(e.progress_percent ?? 0),
      email: (profile?.email as string) || "",
      name: (profile?.full_name as string | null) || null,
      course_title: (course?.title as string) || "Course",
      updated_at: (e.updated_at as string | null) || null,
    };
  });
}

export async function listCourseOptions() {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data } = await supabase.from("courses").select("id, title").order("title");
  return (data ?? []) as { id: string; title: string }[];
}
