"use server";

import { revalidatePath } from "next/cache";
import { requireSession, hasRole, effectiveRole } from "@/lib/auth";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/database";

export type AdminActionState = {
  error?: string;
  message?: string;
};

const STAFF_ROLES: UserRole[] = ["admin", "super_admin", "finance"];
const ASSIGNABLE_ROLES: UserRole[] = ["user", "instructor", "finance", "admin", "super_admin"];

async function requireAdmin() {
  const session = await requireSession({ roles: STAFF_ROLES });
  if (!isAdminClientConfigured()) {
    throw new Error("Admin data access is not configured (missing SUPABASE_SERVICE_ROLE_KEY).");
  }
  return session;
}

export async function updateUserRole(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const session = await requireAdmin();
    const userId = String(formData.get("user_id") ?? "");
    const role = String(formData.get("role") ?? "") as UserRole;

    if (!userId) return { error: "Missing user." };
    if (!ASSIGNABLE_ROLES.includes(role)) return { error: "Invalid role." };

    if (userId === session.userId && role !== "super_admin" && effectiveRole(session.profile) === "super_admin") {
      return { error: "You cannot remove your own super admin role." };
    }

    if (role === "super_admin" && !hasRole(session.profile, "super_admin")) {
      return { error: "Only super admins can assign super admin." };
    }

    const roles: UserRole[] = role === "super_admin" ? ["super_admin", "admin"] : [role];
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        role,
        roles,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) return { error: error.message };

    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath("/admin/students");
    return { message: "Role updated." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update role." };
  }
}

export async function setCoursePublished(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const courseId = String(formData.get("course_id") ?? "");
    const published = String(formData.get("published") ?? "") === "true";
    if (!courseId) return { error: "Missing course." };

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("courses")
      .update({ is_published: published, updated_at: new Date().toISOString() })
      .eq("id", courseId);

    if (error) return { error: error.message };

    revalidatePath("/admin");
    revalidatePath("/admin/courses");
    revalidatePath("/catalog");
    return { message: published ? "Course published." : "Course unpublished." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update course." };
  }
}

export async function setCourseFeatured(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const courseId = String(formData.get("course_id") ?? "");
    const featured = String(formData.get("featured") ?? "") === "true";
    if (!courseId) return { error: "Missing course." };

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("courses")
      .update({ is_featured: featured, updated_at: new Date().toISOString() })
      .eq("id", courseId);

    if (error) return { error: error.message };

    revalidatePath("/admin");
    revalidatePath("/admin/courses");
    revalidatePath("/");
    return { message: featured ? "Marked featured." : "Removed from featured." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update course." };
  }
}

export async function updateEnrollmentStatus(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const enrollmentId = String(formData.get("enrollment_id") ?? "");
    const status = String(formData.get("status") ?? "");
    const allowed = ["active", "completed", "paused", "dropped"];
    if (!enrollmentId) return { error: "Missing enrollment." };
    if (!allowed.includes(status)) return { error: "Invalid status." };

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("enrollments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", enrollmentId);

    if (error) return { error: error.message };

    revalidatePath("/admin");
    revalidatePath("/admin/students");
    return { message: "Enrollment updated." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update enrollment." };
  }
}

function revalidateAdmin(...paths: string[]) {
  revalidatePath("/admin");
  for (const path of paths) revalidatePath(path);
}

export async function createPayment(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const student_email = String(formData.get("student_email") ?? "").trim().toLowerCase();
    const course_id = String(formData.get("course_id") ?? "") || null;
    const amount_due = Number(formData.get("amount_due") ?? 0);
    const amount_paid = Number(formData.get("amount_paid") ?? 0);
    if (!student_email || !amount_due) return { error: "Email and amount due are required." };

    const supabase = createAdminClient();
    const { data: profile } = await supabase.from("profiles").select("id").eq("email", student_email).maybeSingle();
    const status =
      amount_paid <= 0 ? "pending" : amount_paid >= amount_due ? "paid" : "partial";

    const { error } = await supabase.from("payments").insert({
      student_email,
      student_user_id: profile?.id ?? null,
      course_id,
      amount_due,
      amount_paid,
      currency: String(formData.get("currency") ?? "RWF"),
      payment_type: String(formData.get("payment_type") ?? "full"),
      status,
      notes: String(formData.get("notes") ?? "") || null,
    });
    if (error) return { error: error.message };
    revalidateAdmin("/admin/payments", "/admin/revenue");
    return { message: "Payment recorded." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create payment." };
  }
}

export async function approvePayment(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const session = await requireAdmin();
    const paymentId = String(formData.get("payment_id") ?? "");
    if (!paymentId) return { error: "Missing payment." };

    const supabase = createAdminClient();
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .maybeSingle();
    if (fetchError) return { error: fetchError.message };
    if (!payment) return { error: "Payment not found." };

    const { error } = await supabase
      .from("payments")
      .update({
        approved_by_admin: true,
        approved_at: new Date().toISOString(),
        approved_by: session.email,
        notes: String(formData.get("notes") ?? payment.notes ?? "") || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId);
    if (error) return { error: error.message };

    // Auto-enrol if we can resolve the user and course
    if (payment.course_id && payment.student_email) {
      let userId = payment.student_user_id as string | null;
      if (!userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", payment.student_email)
          .maybeSingle();
        userId = (profile?.id as string | undefined) ?? null;
      }
      if (userId) {
        await supabase.from("enrollments").upsert(
          {
            course_id: payment.course_id,
            user_id: userId,
            status: "active",
            enrolled_date: new Date().toISOString().slice(0, 10),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "course_id,user_id" },
        );
      }
    }

    revalidateAdmin("/admin/payments", "/admin/students", "/admin/revenue");
    return { message: "Payment approved." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not approve payment." };
  }
}

export async function createCohort(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const name = String(formData.get("name") ?? "").trim();
    const course_id = String(formData.get("course_id") ?? "") || null;
    if (!name || !course_id) return { error: "Cohort name and course are required." };

    const supabase = createAdminClient();
    const { error } = await supabase.from("cohorts").insert({
      name,
      course_id,
      start_date: String(formData.get("start_date") ?? "") || null,
      end_date: String(formData.get("end_date") ?? "") || null,
      status: String(formData.get("status") ?? "planned"),
      notes: String(formData.get("notes") ?? "") || null,
    });
    if (error) return { error: error.message };
    revalidateAdmin("/admin/cohorts");
    return { message: "Cohort created." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create cohort." };
  }
}

export async function createInstructor(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const full_name = String(formData.get("full_name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    if (!full_name || !email) return { error: "Name and email are required." };

    const supabase = createAdminClient();
    const { error } = await supabase.from("instructors").insert({
      full_name,
      email,
      phone: String(formData.get("phone") ?? "") || null,
      title: String(formData.get("title") ?? "") || null,
      status: String(formData.get("status") ?? "Pending Review"),
      availability: String(formData.get("availability") ?? "Part-time"),
    });
    if (error) return { error: error.message };
    revalidateAdmin("/admin/instructors");
    return { message: "Instructor added." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not add instructor." };
  }
}

export async function createSession(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return { error: "Session title is required." };

    const supabase = createAdminClient();
    const { error } = await supabase.from("class_sessions").insert({
      title,
      course_id: String(formData.get("course_id") ?? "") || null,
      cohort_id: String(formData.get("cohort_id") ?? "") || null,
      start_at: String(formData.get("start_at") ?? "") || null,
      end_at: String(formData.get("end_at") ?? "") || null,
      location: String(formData.get("location") ?? "") || null,
      meeting_url: String(formData.get("meeting_url") ?? "") || null,
      status: "scheduled",
    });
    if (error) return { error: error.message };
    revalidateAdmin("/admin/sessions", "/admin/cohorts");
    return { message: "Session scheduled." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create session." };
  }
}

export async function markAttendance(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const session = await requireAdmin();
    const class_id = String(formData.get("class_id") ?? "") || null;
    const student_email = String(formData.get("student_email") ?? "").trim().toLowerCase();
    const status = String(formData.get("status") ?? "present");
    if (!student_email) return { error: "Student email is required." };

    const supabase = createAdminClient();
    let class_title: string | null = null;
    let class_start: string | null = null;
    let course_id: string | null = null;
    if (class_id) {
      const { data: cls } = await supabase.from("class_sessions").select("*").eq("id", class_id).maybeSingle();
      class_title = (cls?.title as string | undefined) ?? null;
      class_start = (cls?.start_at as string | null | undefined) ?? null;
      course_id = (cls?.course_id as string | null | undefined) ?? null;
    }

    const { error } = await supabase.from("class_attendance").insert({
      class_id,
      course_id,
      student_email,
      student_name: String(formData.get("student_name") ?? "") || null,
      status,
      verified_at: new Date().toISOString(),
      method: "instructor",
      marked_by: session.email,
      class_title,
      class_start,
    });
    if (error) return { error: error.message };
    revalidateAdmin("/admin/attendance");
    return { message: "Attendance marked." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not mark attendance." };
  }
}

export async function createInvoice(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const student_email = String(formData.get("student_email") ?? "").trim().toLowerCase();
    const amount = Number(formData.get("amount") ?? 0);
    if (!student_email || !amount) return { error: "Email and amount are required." };

    const supabase = createAdminClient();
    const { error } = await supabase.from("invoices").insert({
      student_email,
      course_id: String(formData.get("course_id") ?? "") || null,
      amount,
      currency: String(formData.get("currency") ?? "RWF"),
      status: String(formData.get("status") ?? "sent"),
      due_date: String(formData.get("due_date") ?? "") || null,
      issued_at: new Date().toISOString(),
    });
    if (error) return { error: error.message };
    revalidateAdmin("/admin/invoices");
    return { message: "Invoice created." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create invoice." };
  }
}

export async function createCoupon(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const code = String(formData.get("code") ?? "").trim().toUpperCase();
    if (!code) return { error: "Coupon code is required." };

    const supabase = createAdminClient();
    const { error } = await supabase.from("coupons").insert({
      code,
      description: String(formData.get("description") ?? "") || null,
      discount_percent: Number(formData.get("discount_percent") ?? 0) || null,
      discount_amount: Number(formData.get("discount_amount") ?? 0) || null,
      active: true,
    });
    if (error) return { error: error.message };
    revalidateAdmin("/admin/content");
    return { message: "Coupon created." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create coupon." };
  }
}
