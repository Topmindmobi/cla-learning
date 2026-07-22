"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";

export type InstructorActionState = { error?: string; message?: string };

async function requireInstructor() {
  return requireSession({ roles: ["instructor", "admin", "super_admin"] });
}

export async function instructorGradeAssignment(
  _prev: InstructorActionState,
  formData: FormData,
): Promise<InstructorActionState> {
  try {
    const session = await requireInstructor();
    if (!isAdminClientConfigured()) return { error: "Not configured." };
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
    revalidatePath("/instructor/marking");
    return { message: "Graded." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not grade." };
  }
}
