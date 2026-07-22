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

export type CourseEditorRow = {
  id: string;
  slug: string | null;
  title: string;
  subtitle: string | null;
  short_description: string | null;
  full_description: string | null;
  learning_outcomes: string | null;
  target_audience: string | null;
  course_requirements: string | null;
  career_benefits: string | null;
  category: string;
  difficulty: string;
  thumbnail_url: string | null;
  instructor_name: string | null;
  instructor_title: string | null;
  duration_hours: number | null;
  price: number;
  currency: string;
  language: string | null;
  what_you_will_learn: string[];
  requirements: string[];
  is_published: boolean;
  is_featured: boolean;
};

export async function getAdminCourse(id: string): Promise<CourseEditorRow | null> {
  if (!isAdminClientConfigured()) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("courses").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    id: data.id as string,
    slug: (data.slug as string | null) ?? null,
    title: data.title as string,
    subtitle: (data.subtitle as string | null) ?? null,
    short_description: (data.short_description as string | null) ?? null,
    full_description: (data.full_description as string | null) ?? null,
    learning_outcomes: (data.learning_outcomes as string | null) ?? null,
    target_audience: (data.target_audience as string | null) ?? null,
    course_requirements: (data.course_requirements as string | null) ?? null,
    career_benefits: (data.career_benefits as string | null) ?? null,
    category: data.category as string,
    difficulty: (data.difficulty as string) ?? "beginner",
    thumbnail_url: (data.thumbnail_url as string | null) ?? null,
    instructor_name: (data.instructor_name as string | null) ?? null,
    instructor_title: (data.instructor_title as string | null) ?? null,
    duration_hours: data.duration_hours != null ? Number(data.duration_hours) : null,
    price: Number(data.price ?? 0),
    currency: (data.currency as string) ?? "RWF",
    language: (data.language as string | null) ?? "English",
    what_you_will_learn: Array.isArray(data.what_you_will_learn)
      ? (data.what_you_will_learn as string[])
      : [],
    requirements: Array.isArray(data.requirements) ? (data.requirements as string[]) : [],
    is_published: Boolean(data.is_published),
    is_featured: Boolean(data.is_featured),
  };
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
