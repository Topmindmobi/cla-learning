import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/database";

export type AdminProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  roles: UserRole[];
  created_at: string | null;
};

export type AdminCourseRow = {
  id: string;
  slug: string | null;
  title: string;
  category: string;
  instructor_name: string | null;
  price: number;
  currency: string;
  is_published: boolean;
  is_featured: boolean;
  enrollment_count: number;
  updated_at: string | null;
};

export type AdminEnrollmentRow = {
  id: string;
  status: string;
  progress_percent: number;
  enrolled_date: string | null;
  course_title: string;
  course_slug: string | null;
  user_id: string;
  user_email: string;
  user_name: string | null;
};

export type AdminStats = {
  studentCount: number;
  staffCount: number;
  publishedCourses: number;
  draftCourses: number;
  activeEnrollments: number;
};

function emptyStats(): AdminStats {
  return {
    studentCount: 0,
    staffCount: 0,
    publishedCourses: 0,
    draftCourses: 0,
    activeEnrollments: 0,
  };
}

export async function getAdminStats(): Promise<AdminStats> {
  if (!isAdminClientConfigured()) return emptyStats();
  const supabase = createAdminClient();

  const [students, staff, published, drafts, enrollments] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "user"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .in("role", ["admin", "super_admin", "finance", "instructor"]),
    supabase.from("courses").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("courses").select("id", { count: "exact", head: true }).eq("is_published", false),
    supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("status", "active"),
  ]);

  return {
    studentCount: students.count ?? 0,
    staffCount: staff.count ?? 0,
    publishedCourses: published.count ?? 0,
    draftCourses: drafts.count ?? 0,
    activeEnrollments: enrollments.count ?? 0,
  };
}

export async function listAdminProfiles(): Promise<AdminProfileRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, roles, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminProfileRow[];
}

export async function listAdminCourses(): Promise<AdminCourseRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("courses")
    .select(
      "id, slug, title, category, instructor_name, price, currency, is_published, is_featured, enrollment_count, updated_at",
    )
    .order("title", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminCourseRow[];
}

export async function listAdminEnrollments(): Promise<AdminEnrollmentRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("id, status, progress_percent, enrolled_date, user_id, course_id, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  if (!data?.length) return [];

  const userIds = [...new Set(data.map((row) => row.user_id as string))];
  const courseIds = [...new Set(data.map((row) => row.course_id as string))];

  const [{ data: profiles }, { data: courses }] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name").in("id", userIds),
    supabase.from("courses").select("id, title, slug").in("id", courseIds),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id as string, p]));
  const courseMap = new Map((courses ?? []).map((c) => [c.id as string, c]));

  return data.map((row) => {
    const profile = profileMap.get(row.user_id as string);
    const course = courseMap.get(row.course_id as string);
    return {
      id: row.id as string,
      status: row.status as string,
      progress_percent: Number(row.progress_percent ?? 0),
      enrolled_date: (row.enrolled_date as string | null) ?? null,
      course_title: (course?.title as string | undefined) ?? "Course",
      course_slug: (course?.slug as string | null | undefined) ?? null,
      user_id: row.user_id as string,
      user_email: (profile?.email as string | undefined) ?? "",
      user_name: (profile?.full_name as string | null | undefined) ?? null,
    };
  });
}

export async function listStudentProfiles(): Promise<AdminProfileRow[]> {
  if (!isAdminClientConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, roles, created_at")
    .eq("role", "user")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminProfileRow[];
}
