"use client";

import { useActionState } from "react";
import {
  postDiscussion,
  type LearnerActionState,
} from "@/app/(student)/dashboard/learner-actions";

export type DiscussionPost = {
  id: string;
  author_name: string | null;
  author_email: string | null;
  body: string;
  created_at: string;
};

export default function DiscussionPanel({
  activityId,
  courseId,
  posts,
  prompt,
}: {
  activityId: string;
  courseId: string;
  posts: DiscussionPost[];
  prompt?: string | null;
}) {
  const [state, action, pending] = useActionState(postDiscussion, {} as LearnerActionState);

  return (
    <div style={{ marginTop: 22 }}>
      <h3 style={{ fontSize: 16, margin: "0 0 8px" }}>Discussion</h3>
      {prompt ? (
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 0 }}>{prompt}</p>
      ) : null}

      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {posts.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>Be the first to comment.</p>
        ) : (
          posts.map((p) => (
            <div
              key={p.id}
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "var(--wash)",
              }}
            >
              <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>
                {p.author_name || p.author_email || "Learner"} ·{" "}
                {new Date(p.created_at).toLocaleString("en-GB", { timeZone: "Africa/Kigali" })}
              </div>
              <p style={{ margin: 0, fontSize: 14, whiteSpace: "pre-wrap" }}>{p.body}</p>
            </div>
          ))
        )}
      </div>

      <form action={action} style={{ display: "grid", gap: 8 }}>
        <input type="hidden" name="activity_id" value={activityId} />
        <input type="hidden" name="course_id" value={courseId} />
        <textarea
          name="body"
          required
          rows={3}
          placeholder="Share a question or insight…"
          style={{
            padding: 12,
            borderRadius: 8,
            border: "1px solid var(--line)",
            font: "inherit",
            resize: "vertical",
          }}
        />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button type="submit" className="cla-btn primary sm" disabled={pending}>
            {pending ? "Posting…" : "Post"}
          </button>
          {state.error ? (
            <span style={{ fontSize: 13, color: "var(--danger, #b42318)" }}>{state.error}</span>
          ) : null}
          {state.message ? (
            <span style={{ fontSize: 13, color: "var(--moss)" }}>{state.message}</span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
