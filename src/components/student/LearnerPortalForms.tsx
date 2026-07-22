"use client";

import { useActionState } from "react";
import {
  issueCertificateIfEligible,
  markNotificationRead,
  requestCoursePurchase,
  submitAssignment,
  type LearnerActionState,
} from "@/app/(student)/dashboard/learner-actions";

const initial: LearnerActionState = {};

export function SubmitAssignmentForm({
  id,
  title,
  courseId,
  existingText,
}: {
  id?: string;
  title?: string;
  courseId?: string | null;
  existingText?: string | null;
}) {
  const [state, action, pending] = useActionState(submitAssignment, initial);
  return (
    <form action={action} style={{ display: "grid", gap: 8, marginTop: 12 }}>
      {id ? <input type="hidden" name="id" value={id} /> : null}
      {courseId ? <input type="hidden" name="course_id" value={courseId} /> : null}
      <input
        name="assignment_title"
        required
        defaultValue={title ?? ""}
        placeholder="Assignment title"
        style={{
          padding: "10px 12px",
          border: "1px solid var(--line)",
          borderRadius: 8,
          font: "inherit",
        }}
      />
      <textarea
        name="submission_text"
        required
        defaultValue={existingText ?? ""}
        placeholder="Your submission"
        rows={5}
        style={{
          padding: "10px 12px",
          border: "1px solid var(--line)",
          borderRadius: 8,
          font: "inherit",
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button type="submit" className="cla-btn primary sm" disabled={pending}>
          {pending ? "Sending…" : id ? "Update submission" : "Submit assignment"}
        </button>
        {state.error ? (
          <span style={{ fontSize: 13, color: "var(--danger, #b42318)" }}>{state.error}</span>
        ) : null}
        {state.message ? (
          <span style={{ fontSize: 13, color: "var(--moss)" }}>{state.message}</span>
        ) : null}
      </div>
    </form>
  );
}

export function ClaimCertificateForm({ enrollmentId }: { enrollmentId: string }) {
  const [state, action, pending] = useActionState(issueCertificateIfEligible, initial);
  return (
    <form action={action}>
      <input type="hidden" name="enrollment_id" value={enrollmentId} />
      <button type="submit" className="cla-btn primary sm" disabled={pending}>
        {pending ? "…" : "Claim certificate"}
      </button>
      {state.error ? (
        <span style={{ marginLeft: 8, fontSize: 12, color: "var(--danger, #b42318)" }}>
          {state.error}
        </span>
      ) : null}
      {state.message ? (
        <span style={{ marginLeft: 8, fontSize: 12, color: "var(--moss)" }}>{state.message}</span>
      ) : null}
    </form>
  );
}

export function PurchaseRequestForm({
  courses,
}: {
  courses: { id: string; title: string; price?: number | null; currency?: string | null }[];
}) {
  const [state, action, pending] = useActionState(requestCoursePurchase, initial);
  return (
    <form action={action} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "end" }}>
      <select
        name="course_id"
        required
        style={{ padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 8, font: "inherit" }}
      >
        <option value="">Select course</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
            {c.price != null ? ` · ${c.currency ?? "RWF"} ${c.price}` : ""}
          </option>
        ))}
      </select>
      <input type="hidden" name="currency" value="RWF" />
      <input
        name="amount"
        type="number"
        placeholder="Amount (RWF)"
        style={{
          padding: "10px 12px",
          border: "1px solid var(--line)",
          borderRadius: 8,
          width: 140,
          font: "inherit",
        }}
      />
      <button type="submit" className="cla-btn primary sm" disabled={pending}>
        {pending ? "…" : "Request access"}
      </button>
      {state.error ? (
        <span style={{ fontSize: 13, color: "var(--danger, #b42318)" }}>{state.error}</span>
      ) : null}
      {state.message ? (
        <span style={{ fontSize: 13, color: "var(--moss)" }}>{state.message}</span>
      ) : null}
    </form>
  );
}

export function MarkNotificationReadForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(markNotificationRead, initial);
  return (
    <form action={action} style={{ display: "inline" }}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="cla-btn sm" disabled={pending}>
        {pending ? "…" : "Mark read"}
      </button>
      {state.error ? (
        <span style={{ marginLeft: 6, fontSize: 12, color: "var(--danger, #b42318)" }}>
          {state.error}
        </span>
      ) : null}
    </form>
  );
}
