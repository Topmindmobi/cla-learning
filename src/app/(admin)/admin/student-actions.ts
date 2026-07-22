"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/database";
import type { AdminActionState } from "./actions";

const STAFF_ROLES: UserRole[] = ["admin", "super_admin", "finance"];

async function requireAdmin() {
  await requireSession({ roles: STAFF_ROLES });
  if (!isAdminClientConfigured()) {
    throw new Error("Admin data access is not configured (missing SUPABASE_SERVICE_ROLE_KEY).");
  }
}

function rev(...paths: string[]) {
  revalidatePath("/admin");
  for (const p of paths) revalidatePath(p);
}

/** Single-student enrol (wizard step final). */
export async function enrolStudent(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const course_id = String(formData.get("course_id") ?? "");
    const cohort_id = String(formData.get("cohort_id") ?? "") || null;
    if (!email || !course_id) return { error: "Student email and course are required." };

    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("email", email)
      .maybeSingle();
    if (!profile) {
      return {
        error: `No account for ${email}. Ask them to register first, or use Bulk enrol after they sign up.`,
      };
    }

    const { error } = await supabase.from("enrollments").upsert(
      {
        user_id: profile.id,
        course_id,
        cohort_id,
        status: "active",
        progress_percent: 0,
        enrolled_date: new Date().toISOString().slice(0, 10),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "course_id,user_id" },
    );
    if (error) return { error: error.message };

    await supabase
      .from("courses")
      .update({
        enrollment_count: (
          await supabase
            .from("enrollments")
            .select("id", { count: "exact", head: true })
            .eq("course_id", course_id)
        ).count ?? 0,
      })
      .eq("id", course_id);

    rev("/admin/students", "/admin/enrol", "/admin/cohorts");
    return { message: `Enrolled ${profile.full_name || email}.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Enrol failed." };
  }
}

/** Paste emails (one per line) → enrol all that have profiles. */
export async function bulkEnrol(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const course_id = String(formData.get("course_id") ?? "");
    const cohort_id = String(formData.get("cohort_id") ?? "") || null;
    const raw = String(formData.get("emails") ?? "");
    if (!course_id || !raw.trim()) return { error: "Course and email list required." };

    const emails = [
      ...new Set(
        raw
          .split(/[\n,;]+/)
          .map((e) => e.trim().toLowerCase())
          .filter((e) => e.includes("@")),
      ),
    ];
    if (!emails.length) return { error: "No valid emails found." };

    const supabase = createAdminClient();
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("email", emails);
    const found = new Map((profiles ?? []).map((p) => [String(p.email).toLowerCase(), p.id as string]));

    let enrolled = 0;
    const missing: string[] = [];
    for (const email of emails) {
      const userId = found.get(email);
      if (!userId) {
        missing.push(email);
        continue;
      }
      const { error } = await supabase.from("enrollments").upsert(
        {
          user_id: userId,
          course_id,
          cohort_id,
          status: "active",
          enrolled_date: new Date().toISOString().slice(0, 10),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "course_id,user_id" },
      );
      if (!error) enrolled++;
    }

    rev("/admin/students", "/admin/enrol", "/admin/cohorts");
    const missMsg = missing.length ? ` Skipped ${missing.length} without accounts.` : "";
    return { message: `Enrolled ${enrolled} of ${emails.length}.${missMsg}` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Bulk enrol failed." };
  }
}

export async function createApplicant(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const full_name = String(formData.get("full_name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    if (!full_name || !email) return { error: "Name and email required." };

    const supabase = createAdminClient();
    const { error } = await supabase.from("applicants").insert({
      full_name,
      email,
      phone: String(formData.get("phone") ?? "") || null,
      course_id: String(formData.get("course_id") ?? "") || null,
      status: String(formData.get("status") ?? "lead"),
      notes: String(formData.get("notes") ?? "") || null,
      source: "admin",
    });
    if (error) return { error: error.message };
    rev("/admin/applicants", "/admin/students");
    return { message: "Applicant saved." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save applicant." };
  }
}

export async function updateApplicantStatus(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");
    if (!id || !status) return { error: "Missing applicant or status." };
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("applicants")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
    rev("/admin/applicants");
    return { message: "Status updated." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update." };
  }
}

export async function createPaymentPlan(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const name = String(formData.get("name") ?? "").trim();
    const total_amount = Number(formData.get("total_amount") ?? 0);
    const installment_count = Number(formData.get("installment_count") ?? 1);
    if (!name || !total_amount) return { error: "Name and total amount required." };

    const supabase = createAdminClient();
    const { error } = await supabase.from("payment_plans").insert({
      name,
      course_id: String(formData.get("course_id") ?? "") || null,
      total_amount,
      currency: String(formData.get("currency") ?? "RWF"),
      installment_count: Math.max(1, installment_count),
      status: "active",
      notes: String(formData.get("notes") ?? "") || null,
    });
    if (error) return { error: error.message };
    rev("/admin/invoices", "/admin/payment-plans");
    return { message: "Payment plan created." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create plan." };
  }
}

export async function saveRoleConfig(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const role = String(formData.get("role") ?? "").trim();
    const pathsRaw = String(formData.get("allowed_paths") ?? "");
    if (!role) return { error: "Role required." };
    const allowed_paths = pathsRaw
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    const supabase = createAdminClient();
    const { error } = await supabase.from("role_configs").upsert(
      {
        role,
        allowed_paths,
        notes: String(formData.get("notes") ?? "") || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "role" },
    );
    if (error) return { error: error.message };
    rev("/admin/roles");
    return { message: `Privileges saved for ${role}.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save privileges." };
  }
}

/** Mark attendance for multiple students at once (roster). */
export async function markAttendanceRoster(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const session = await requireSession({ roles: STAFF_ROLES });
    if (!isAdminClientConfigured()) throw new Error("Service role missing.");

    const class_id = String(formData.get("class_id") ?? "");
    const roster = String(formData.get("roster") ?? "");
    if (!class_id || !roster.trim()) return { error: "Session and roster required." };

    const supabase = createAdminClient();
    const { data: cls } = await supabase.from("class_sessions").select("*").eq("id", class_id).maybeSingle();
    if (!cls) return { error: "Session not found." };

    const lines = roster
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    let n = 0;
    for (const line of lines) {
      // email[,status] or name <email>
      const statusMatch = line.match(/,(present|absent|late|excused)\s*$/i);
      const status = statusMatch ? statusMatch[1].toLowerCase() : "present";
      const left = statusMatch ? line.slice(0, statusMatch.index).trim() : line;
      const emailMatch = left.match(/[\w.+-]+@[\w.-]+\.\w+/);
      if (!emailMatch) continue;
      const email = emailMatch[0].toLowerCase();
      const name = left.replace(emailMatch[0], "").replace(/[<>]/g, "").trim() || null;
      await supabase.from("class_attendance").insert({
        class_id,
        course_id: cls.course_id,
        student_email: email,
        student_name: name,
        status,
        method: "roster",
        marked_by: session.email,
        class_title: cls.title,
        class_start: cls.start_at,
        verified_at: new Date().toISOString(),
      });
      n++;
    }
    rev("/admin/attendance");
    return { message: `Marked ${n} learners.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Roster mark failed." };
  }
}
