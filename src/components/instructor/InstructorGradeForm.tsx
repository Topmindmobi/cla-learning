"use client";

import { useActionState } from "react";
import {
  instructorGradeAssignment,
  type InstructorActionState,
} from "@/app/(instructor)/instructor/instructor-actions";

const initial: InstructorActionState = {};

export function InstructorGradeForm({
  id,
  maxScore,
}: {
  id: string;
  maxScore: number;
}) {
  const [state, action, pending] = useActionState(instructorGradeAssignment, initial);
  return (
    <form action={action} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "end" }}>
      <input type="hidden" name="id" value={id} />
      <input
        name="grade"
        type="number"
        required
        min={0}
        max={maxScore}
        placeholder={`Grade / ${maxScore}`}
        style={{ padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 8, width: 110 }}
      />
      <input
        name="feedback"
        placeholder="Feedback"
        style={{ padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 8, minWidth: 180 }}
      />
      <button type="submit" className="cla-btn sm primary" disabled={pending}>
        {pending ? "…" : "Grade"}
      </button>
      {state.error ? <span style={{ fontSize: 12, color: "#b42318" }}>{state.error}</span> : null}
      {state.message ? <span style={{ fontSize: 12, color: "var(--moss)" }}>{state.message}</span> : null}
    </form>
  );
}
