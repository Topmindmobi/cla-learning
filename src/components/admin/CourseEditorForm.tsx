"use client";

import { useActionState } from "react";
import { upsertCourse } from "@/app/(admin)/admin/teaching-actions";
import type { AdminActionState } from "@/app/(admin)/admin/actions";
import type { CourseEditorRow } from "@/lib/admin/data";

const initial: AdminActionState = {};

const field: React.CSSProperties = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid var(--line)",
  padding: "10px 12px",
  font: "inherit",
  marginTop: 6,
};

const label: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 500, marginTop: 14 };

const CATEGORIES = [
  "professional_courses",
  "consulting",
  "training_development",
  "short_term_courses",
  "research_surveys",
  "finance",
  "management",
  "technology",
];

export default function CourseEditorForm({ course }: { course?: CourseEditorRow | null }) {
  const [state, action, pending] = useActionState(upsertCourse, initial);

  return (
    <form action={action} style={{ maxWidth: 720 }}>
      {course?.id ? <input type="hidden" name="id" value={course.id} /> : null}

      <label style={label}>
        Title *
        <input name="title" required defaultValue={course?.title ?? ""} style={field} />
      </label>
      <label style={label}>
        Slug
        <input
          name="slug"
          defaultValue={course?.slug ?? ""}
          placeholder="auto from title if blank"
          style={field}
        />
      </label>
      <label style={label}>
        Subtitle
        <input name="subtitle" defaultValue={course?.subtitle ?? ""} style={field} />
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label style={label}>
          Category
          <select name="category" defaultValue={course?.category ?? "professional_courses"} style={field}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label style={label}>
          Difficulty
          <select name="difficulty" defaultValue={course?.difficulty ?? "beginner"} style={field}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label style={label}>
          Instructor name
          <input name="instructor_name" defaultValue={course?.instructor_name ?? ""} style={field} />
        </label>
        <label style={label}>
          Instructor title
          <input name="instructor_title" defaultValue={course?.instructor_title ?? ""} style={field} />
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <label style={label}>
          Duration (hours)
          <input
            name="duration_hours"
            type="number"
            min={0}
            defaultValue={course?.duration_hours ?? 0}
            style={field}
          />
        </label>
        <label style={label}>
          Price
          <input name="price" type="number" min={0} defaultValue={course?.price ?? 0} style={field} />
        </label>
        <label style={label}>
          Currency
          <input name="currency" defaultValue={course?.currency ?? "RWF"} style={field} />
        </label>
      </div>

      <label style={label}>
        Language
        <input name="language" defaultValue={course?.language ?? "English"} style={field} />
      </label>
      <label style={label}>
        Thumbnail URL
        <input name="thumbnail_url" defaultValue={course?.thumbnail_url ?? ""} style={field} />
      </label>
      <label style={label}>
        Short description
        <textarea
          name="short_description"
          rows={2}
          defaultValue={course?.short_description ?? ""}
          style={{ ...field, height: "auto" }}
        />
      </label>
      <label style={label}>
        Full description
        <textarea
          name="full_description"
          rows={5}
          defaultValue={course?.full_description ?? ""}
          style={{ ...field, height: "auto" }}
        />
      </label>
      <label style={label}>
        Learning outcomes
        <textarea
          name="learning_outcomes"
          rows={3}
          defaultValue={course?.learning_outcomes ?? ""}
          style={{ ...field, height: "auto" }}
        />
      </label>
      <label style={label}>
        Target audience
        <textarea
          name="target_audience"
          rows={2}
          defaultValue={course?.target_audience ?? ""}
          style={{ ...field, height: "auto" }}
        />
      </label>
      <label style={label}>
        Course requirements (narrative)
        <textarea
          name="course_requirements"
          rows={2}
          defaultValue={course?.course_requirements ?? ""}
          style={{ ...field, height: "auto" }}
        />
      </label>
      <label style={label}>
        Career benefits
        <textarea
          name="career_benefits"
          rows={2}
          defaultValue={course?.career_benefits ?? ""}
          style={{ ...field, height: "auto" }}
        />
      </label>
      <label style={label}>
        What you will learn (one per line)
        <textarea
          name="what_you_will_learn"
          rows={4}
          defaultValue={(course?.what_you_will_learn ?? []).join("\n")}
          style={{ ...field, height: "auto" }}
        />
      </label>
      <label style={label}>
        Requirements list (one per line)
        <textarea
          name="requirements"
          rows={3}
          defaultValue={(course?.requirements ?? []).join("\n")}
          style={{ ...field, height: "auto" }}
        />
      </label>

      <div style={{ display: "flex", gap: 20, marginTop: 18 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
          <input name="is_published" type="checkbox" defaultChecked={course?.is_published} />
          Published
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
          <input name="is_featured" type="checkbox" defaultChecked={course?.is_featured} />
          Featured
        </label>
      </div>

      {state.error ? (
        <p style={{ color: "var(--rose)", marginTop: 12 }}>{state.error}</p>
      ) : null}
      {state.message ? (
        <p style={{ color: "var(--moss)", marginTop: 12 }}>{state.message}</p>
      ) : null}

      <button
        type="submit"
        className="cla-btn primary"
        disabled={pending}
        style={{ marginTop: 20 }}
      >
        {pending ? "Saving…" : course ? "Save course" : "Create course"}
      </button>
    </form>
  );
}
