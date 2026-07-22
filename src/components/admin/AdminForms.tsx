"use client";

import { useActionState } from "react";
import {
  setCourseFeatured,
  setCoursePublished,
  updateEnrollmentStatus,
  updateUserRole,
  type AdminActionState,
} from "@/app/(admin)/admin/actions";
import type { UserRole } from "@/types/database";

const initial: AdminActionState = {};

export function RoleSelectForm({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: UserRole;
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState(updateUserRole, initial);
  return (
    <form action={action} style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
      <input type="hidden" name="user_id" value={userId} />
      <select
        name="role"
        defaultValue={role}
        disabled={disabled || pending}
        style={{ height: 34, borderRadius: 8, border: "1px solid var(--line)", padding: "0 8px", font: "inherit" }}
      >
        <option value="user">Student</option>
        <option value="instructor">Instructor</option>
        <option value="finance">Finance</option>
        <option value="admin">Admin</option>
        <option value="super_admin">Super admin</option>
      </select>
      <button type="submit" className="cla-btn sm" disabled={disabled || pending}>
        {pending ? "Saving…" : "Save"}
      </button>
      {state.error ? <span style={{ color: "var(--rose)", fontSize: 12 }}>{state.error}</span> : null}
    </form>
  );
}

export function PublishCourseForm({
  courseId,
  published,
}: {
  courseId: string;
  published: boolean;
}) {
  const [state, action, pending] = useActionState(setCoursePublished, initial);
  return (
    <form action={action}>
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="published" value={published ? "false" : "true"} />
      <button type="submit" className="cla-btn sm" disabled={pending}>
        {pending ? "…" : published ? "Unpublish" : "Publish"}
      </button>
      {state.error ? <span style={{ color: "var(--rose)", fontSize: 12 }}> {state.error}</span> : null}
    </form>
  );
}

export function FeatureCourseForm({
  courseId,
  featured,
}: {
  courseId: string;
  featured: boolean;
}) {
  const [state, action, pending] = useActionState(setCourseFeatured, initial);
  return (
    <form action={action}>
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="featured" value={featured ? "false" : "true"} />
      <button type="submit" className="cla-btn sm" disabled={pending}>
        {pending ? "…" : featured ? "Unfeature" : "Feature"}
      </button>
      {state.error ? <span style={{ color: "var(--rose)", fontSize: 12 }}> {state.error}</span> : null}
    </form>
  );
}

export function EnrollmentStatusForm({
  enrollmentId,
  status,
}: {
  enrollmentId: string;
  status: string;
}) {
  const [state, action, pending] = useActionState(updateEnrollmentStatus, initial);
  return (
    <form action={action} style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <input type="hidden" name="enrollment_id" value={enrollmentId} />
      <select
        name="status"
        defaultValue={status}
        disabled={pending}
        style={{ height: 34, borderRadius: 8, border: "1px solid var(--line)", padding: "0 8px", font: "inherit" }}
      >
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="completed">Completed</option>
        <option value="dropped">Dropped</option>
      </select>
      <button type="submit" className="cla-btn sm" disabled={pending}>
        {pending ? "…" : "Update"}
      </button>
      {state.error ? <span style={{ color: "var(--rose)", fontSize: 12 }}>{state.error}</span> : null}
    </form>
  );
}
