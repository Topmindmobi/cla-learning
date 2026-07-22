"use client";

import { useActionState } from "react";
import {
  addBankQuestion,
  addLmsActivity,
  addLmsChapter,
  addLmsLesson,
  addLmsModule,
  createAssignmentStub,
  createLmsCourse,
  createQuestionBank,
  createQuiz,
  gradeAssignment,
  importLmsStructure,
  setLmsCourseStatus,
  toggleLmsActivityPublished,
  toggleLmsLessonPublished,
  toggleQuizPublished,
} from "@/app/(admin)/admin/teaching-actions";
import {
  bulkEnrol,
  createApplicant,
  createPaymentPlan,
  enrolStudent,
  markAttendanceRoster,
  saveRoleConfig,
  updateApplicantStatus,
} from "@/app/(admin)/admin/student-actions";
import type { AdminActionState } from "@/app/(admin)/admin/actions";

const initial: AdminActionState = {};
const inputStyle: React.CSSProperties = {
  height: 34,
  borderRadius: 8,
  border: "1px solid var(--line)",
  padding: "0 8px",
  font: "inherit",
};
const areaStyle: React.CSSProperties = {
  ...inputStyle,
  height: "auto",
  minHeight: 80,
  padding: 8,
  width: "100%",
};

function Feedback({ state }: { state: AdminActionState }) {
  if (state.error) return <span style={{ color: "var(--rose)", fontSize: 12 }}>{state.error}</span>;
  if (state.message) return <span style={{ color: "var(--moss)", fontSize: 12 }}>{state.message}</span>;
  return null;
}

type CourseOpt = { id: string; title: string };

export function CreateLmsCourseForm({ courses }: { courses: CourseOpt[] }) {
  const [state, action, pending] = useActionState(createLmsCourse, initial);
  return (
    <form action={action} className="tools" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
      <label style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        Code
        <input name="code" required placeholder="CIPS-L4" style={inputStyle} />
      </label>
      <label style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        Title
        <input name="title" required style={{ ...inputStyle, width: 220 }} />
      </label>
      <label style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        Level
        <input name="level" type="number" style={{ ...inputStyle, width: 70 }} />
      </label>
      <label style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        Link catalog course
        <select name="synced_course_id" style={inputStyle}>
          <option value="">— Optional —</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="cla-btn sm primary" disabled={pending}>
        {pending ? "…" : "Create LMS course"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function ImportLmsJsonForm() {
  const [state, action, pending] = useActionState(importLmsStructure, initial);
  return (
    <form action={action} style={{ display: "grid", gap: 8 }}>
      <textarea
        name="json"
        required
        placeholder='Paste Base44 LMS JSON: { "course": { "code", "title", ... }, "modules": [...] }'
        style={{ ...areaStyle, minHeight: 140, fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: 12 }}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button type="submit" className="cla-btn sm" disabled={pending}>
          {pending ? "Importing…" : "Import JSON"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function AddLmsModuleForm({ courseId }: { courseId: string }) {
  const [state, action, pending] = useActionState(addLmsModule, initial);
  return (
    <form action={action} style={{ display: "grid", gap: 8 }}>
      <input type="hidden" name="course_id" value={courseId} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
        <input name="code" required placeholder="Code e.g. L5M1" style={inputStyle} />
        <input name="title" required placeholder="Module title" style={{ ...inputStyle, width: 200 }} />
        <select name="module_type" defaultValue="core" style={inputStyle}>
          <option value="core">Core</option>
          <option value="elective">Elective</option>
        </select>
        <input name="credits" type="number" step="0.5" placeholder="Credits" style={{ ...inputStyle, width: 90 }} />
        <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" name="is_published" /> Publish
        </label>
        <button type="submit" className="cla-btn sm" disabled={pending}>{pending ? "…" : "Add module"}</button>
      </div>
      <textarea name="overview" placeholder="Module overview (optional)" style={areaStyle} />
      <Feedback state={state} />
    </form>
  );
}

export function AddLmsChapterForm({
  courseId,
  modules,
}: {
  courseId: string;
  modules: { id: string; code: string; title: string }[];
}) {
  const [state, action, pending] = useActionState(addLmsChapter, initial);
  return (
    <form action={action} style={{ display: "grid", gap: 8 }}>
      <input type="hidden" name="course_id" value={courseId} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
        <select name="module_id" required style={inputStyle}>
          <option value="">Module</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>{m.code} — {m.title}</option>
          ))}
        </select>
        <input name="code" required placeholder="Code e.g. 5M1.1" style={inputStyle} />
        <input name="title" required placeholder="Chapter title" style={{ ...inputStyle, width: 180 }} />
        <button type="submit" className="cla-btn sm" disabled={pending}>{pending ? "…" : "Add chapter"}</button>
      </div>
      <textarea name="learning_outcome" placeholder="Learning outcome (optional)" style={areaStyle} />
      <Feedback state={state} />
    </form>
  );
}

export function AddLmsLessonForm({
  courseId,
  chapters,
}: {
  courseId: string;
  chapters: { id: string; module_id: string; code: string; title: string }[];
}) {
  const [state, action, pending] = useActionState(addLmsLesson, initial);
  return (
    <form action={action} style={{ display: "grid", gap: 8 }}>
      <input type="hidden" name="course_id" value={courseId} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
        <select name="chapter_pick" required style={inputStyle}>
          <option value="">Chapter</option>
          {chapters.map((c) => (
            <option key={c.id} value={`${c.module_id}|${c.id}`}>
              {c.code} — {c.title}
            </option>
          ))}
        </select>
        <input name="code" required placeholder="Code" style={inputStyle} />
        <input name="title" required placeholder="Lesson title" style={{ ...inputStyle, width: 180 }} />
        <select name="lesson_type" defaultValue="concept" style={inputStyle}>
          <option value="concept">Concept</option>
          <option value="applied_exercise">Exercise</option>
          <option value="case_study">Case study</option>
          <option value="reading">Reading</option>
          <option value="video">Video</option>
        </select>
        <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" name="is_published" /> Publish
        </label>
        <button type="submit" className="cla-btn sm" disabled={pending}>
          {pending ? "…" : "Add lesson"}
        </button>
      </div>
      <textarea name="learning_objectives" placeholder="Learning objectives (one per line)" style={areaStyle} />
      <textarea name="introduction" placeholder="Introduction" style={areaStyle} />
      <textarea name="key_notes" placeholder="Key notes" style={areaStyle} />
      <Feedback state={state} />
    </form>
  );
}

export function AddLmsActivityForm({
  courseId,
  lessons,
}: {
  courseId: string;
  lessons: { id: string; code: string; title: string }[];
}) {
  const [state, action, pending] = useActionState(addLmsActivity, initial);
  return (
    <form action={action} style={{ display: "grid", gap: 8 }}>
      <input type="hidden" name="course_id" value={courseId} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
        <select name="lesson_id" required style={{ ...inputStyle, minWidth: 200 }}>
          <option value="">Lesson</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>{l.code} — {l.title}</option>
          ))}
        </select>
        <input name="title" required placeholder="Activity title" style={{ ...inputStyle, width: 200 }} />
        <select name="activity_type" defaultValue="content" style={inputStyle}>
          <option value="content">Reading / content</option>
          <option value="video">Video</option>
          <option value="quiz">Quiz</option>
          <option value="assignment">Assignment</option>
          <option value="discussion">Discussion</option>
        </select>
        <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" name="is_published" /> Publish
        </label>
        <button type="submit" className="cla-btn sm primary" disabled={pending}>
          {pending ? "…" : "Add activity"}
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <input name="module_code" placeholder="CIPS module e.g. L5M1" style={inputStyle} />
        <input name="lo_code" placeholder="LO code" style={inputStyle} />
        <input name="ac_code" placeholder="AC code" style={inputStyle} />
        <input name="estimated_duration_minutes" type="number" placeholder="Minutes" style={{ ...inputStyle, width: 90 }} />
      </div>
      <input name="video_url" placeholder="Video URL (YouTube / Vimeo / mp4)" style={{ ...inputStyle, width: "100%" }} />
      <input name="file_url" placeholder="File / PDF URL" style={{ ...inputStyle, width: "100%" }} />
      <input name="external_link" placeholder="External link" style={{ ...inputStyle, width: "100%" }} />
      <textarea name="description" placeholder="Short description" style={areaStyle} />
      <textarea name="content_html" placeholder="Content HTML / reading text" style={{ ...areaStyle, minHeight: 120 }} />
      <Feedback state={state} />
    </form>
  );
}

export function ToggleLmsLessonForm({
  courseId,
  id,
  published,
}: {
  courseId: string;
  id: string;
  published: boolean;
}) {
  const [state, action, pending] = useActionState(toggleLmsLessonPublished, initial);
  return (
    <form action={action} style={{ display: "inline" }}>
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="is_published" value={published ? "false" : "true"} />
      <button type="submit" className="cla-btn sm" disabled={pending} style={{ fontSize: 11 }}>
        {pending ? "…" : published ? "Unpublish" : "Publish"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function ToggleLmsActivityForm({
  courseId,
  id,
  published,
}: {
  courseId: string;
  id: string;
  published: boolean;
}) {
  const [state, action, pending] = useActionState(toggleLmsActivityPublished, initial);
  return (
    <form action={action} style={{ display: "inline" }}>
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="is_published" value={published ? "false" : "true"} />
      <button type="submit" className="cla-btn sm" disabled={pending} style={{ fontSize: 11 }}>
        {pending ? "…" : published ? "Unpublish" : "Publish"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function LmsStatusForm({ id, status }: { id: string; status: string }) {
  const [state, action, pending] = useActionState(setLmsCourseStatus, initial);
  return (
    <form action={action} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      <input type="hidden" name="id" value={id} />
      <select name="status" defaultValue={status} style={inputStyle}>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
      <button type="submit" className="cla-btn sm" disabled={pending}>{pending ? "…" : "Set"}</button>
      <Feedback state={state} />
    </form>
  );
}

export function CreateQuizForm({ courses }: { courses: CourseOpt[] }) {
  const [state, action, pending] = useActionState(createQuiz, initial);
  return (
    <form action={action} style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <input name="title" required placeholder="Quiz title" style={{ ...inputStyle, width: 220 }} />
        <select name="course_id" style={inputStyle}>
          <option value="">Course (optional)</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <input name="passing_score" type="number" defaultValue={70} placeholder="Pass %" style={{ ...inputStyle, width: 80 }} />
        <input name="time_limit_minutes" type="number" placeholder="Minutes" style={{ ...inputStyle, width: 90 }} />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input name="is_published" type="checkbox" /> Publish
        </label>
      </div>
      <textarea
        name="csv"
        placeholder="Optional CSV: question_text,option_a,option_b,option_c,option_d,correct_option,explanation"
        style={{ ...areaStyle, fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: 12 }}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button type="submit" className="cla-btn sm primary" disabled={pending}>
          {pending ? "…" : "Create quiz"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function ToggleQuizForm({ id, published }: { id: string; published: boolean }) {
  const [state, action, pending] = useActionState(toggleQuizPublished, initial);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="published" value={published ? "false" : "true"} />
      <button type="submit" className="cla-btn sm" disabled={pending}>
        {pending ? "…" : published ? "Unpublish" : "Publish"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function CreateBankForm({ courses }: { courses: CourseOpt[] }) {
  const [state, action, pending] = useActionState(createQuestionBank, initial);
  return (
    <form action={action} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
      <input name="name" required placeholder="Bank name" style={{ ...inputStyle, width: 180 }} />
      <select name="course_id" style={inputStyle}>
        <option value="">Course</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>
      <input name="description" placeholder="Description" style={{ ...inputStyle, width: 200 }} />
      <button type="submit" className="cla-btn sm" disabled={pending}>{pending ? "…" : "Add bank"}</button>
      <Feedback state={state} />
    </form>
  );
}

export function AddQuestionForm({ banks }: { banks: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(addBankQuestion, initial);
  return (
    <form action={action} style={{ display: "grid", gap: 8 }}>
      <select name="bank_id" required style={inputStyle}>
        <option value="">Select bank</option>
        {banks.map((b) => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
      <input name="question_text" required placeholder="Question text" style={inputStyle} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <input name="option_a" required placeholder="Option A" style={inputStyle} />
        <input name="option_b" required placeholder="Option B" style={inputStyle} />
        <input name="option_c" placeholder="Option C" style={inputStyle} />
        <input name="option_d" placeholder="Option D" style={inputStyle} />
        <select name="correct" defaultValue="A" style={inputStyle}>
          <option value="A">Correct A</option>
          <option value="B">Correct B</option>
          <option value="C">Correct C</option>
          <option value="D">Correct D</option>
        </select>
      </div>
      <button type="submit" className="cla-btn sm" disabled={pending}>{pending ? "…" : "Add question"}</button>
      <Feedback state={state} />
    </form>
  );
}

export function GradeAssignmentForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(gradeAssignment, initial);
  return (
    <form action={action} style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <input type="hidden" name="id" value={id} />
      <input name="grade" type="number" min={0} max={100} required placeholder="Grade" style={{ ...inputStyle, width: 70 }} />
      <input name="feedback" placeholder="Feedback" style={{ ...inputStyle, width: 140 }} />
      <button type="submit" className="cla-btn sm" disabled={pending}>{pending ? "…" : "Grade"}</button>
      <Feedback state={state} />
    </form>
  );
}

export function CreateAssignmentForm({ courses }: { courses: CourseOpt[] }) {
  const [state, action, pending] = useActionState(createAssignmentStub, initial);
  return (
    <form action={action} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
      <input name="student_email" type="email" required placeholder="Student email" style={inputStyle} />
      <input name="assignment_title" required placeholder="Assignment title" style={{ ...inputStyle, width: 180 }} />
      <select name="course_id" style={inputStyle}>
        <option value="">Course</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>
      <input name="submission_text" placeholder="Submission notes" style={{ ...inputStyle, width: 160 }} />
      <button type="submit" className="cla-btn sm" disabled={pending}>{pending ? "…" : "Record"}</button>
      <Feedback state={state} />
    </form>
  );
}

export function EnrolStudentForm({
  courses,
  cohorts,
}: {
  courses: CourseOpt[];
  cohorts: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(enrolStudent, initial);
  return (
    <form action={action} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
      <input name="email" type="email" required placeholder="Student email" style={inputStyle} />
      <select name="course_id" required style={inputStyle}>
        <option value="">Course</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>
      <select name="cohort_id" style={inputStyle}>
        <option value="">Cohort (optional)</option>
        {cohorts.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <button type="submit" className="cla-btn sm primary" disabled={pending}>
        {pending ? "…" : "Enrol"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function BulkEnrolForm({
  courses,
  cohorts,
}: {
  courses: CourseOpt[];
  cohorts: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(bulkEnrol, initial);
  return (
    <form action={action} style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <select name="course_id" required style={inputStyle}>
          <option value="">Course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <select name="cohort_id" style={inputStyle}>
          <option value="">Cohort (optional)</option>
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <textarea name="emails" required placeholder={"one@email.com\ntwo@email.com"} style={areaStyle} />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button type="submit" className="cla-btn sm" disabled={pending}>
          {pending ? "…" : "Bulk enrol"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function CreateApplicantForm({ courses }: { courses: CourseOpt[] }) {
  const [state, action, pending] = useActionState(createApplicant, initial);
  return (
    <form action={action} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
      <input name="full_name" required placeholder="Full name" style={inputStyle} />
      <input name="email" type="email" required placeholder="Email" style={inputStyle} />
      <input name="phone" placeholder="Phone" style={inputStyle} />
      <select name="course_id" style={inputStyle}>
        <option value="">Interested course</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>
      <select name="status" defaultValue="lead" style={inputStyle}>
        <option value="lead">Lead</option>
        <option value="contacted">Contacted</option>
        <option value="admitted">Admitted</option>
        <option value="declined">Declined</option>
      </select>
      <button type="submit" className="cla-btn sm" disabled={pending}>{pending ? "…" : "Add"}</button>
      <Feedback state={state} />
    </form>
  );
}

export function ApplicantStatusForm({ id, status }: { id: string; status: string }) {
  const [state, action, pending] = useActionState(updateApplicantStatus, initial);
  return (
    <form action={action} style={{ display: "inline-flex", gap: 4 }}>
      <input type="hidden" name="id" value={id} />
      <select name="status" defaultValue={status} style={inputStyle}>
        <option value="lead">Lead</option>
        <option value="contacted">Contacted</option>
        <option value="admitted">Admitted</option>
        <option value="declined">Declined</option>
      </select>
      <button type="submit" className="cla-btn sm" disabled={pending}>{pending ? "…" : "Save"}</button>
      <Feedback state={state} />
    </form>
  );
}

export function CreatePaymentPlanForm({ courses }: { courses: CourseOpt[] }) {
  const [state, action, pending] = useActionState(createPaymentPlan, initial);
  return (
    <form action={action} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
      <input name="name" required placeholder="Plan name" style={{ ...inputStyle, width: 180 }} />
      <select name="course_id" style={inputStyle}>
        <option value="">Course</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>
      <input name="total_amount" type="number" required min={0} placeholder="Total" style={inputStyle} />
      <input name="installment_count" type="number" min={1} defaultValue={3} style={{ ...inputStyle, width: 70 }} />
      <button type="submit" className="cla-btn sm" disabled={pending}>{pending ? "…" : "Create plan"}</button>
      <Feedback state={state} />
    </form>
  );
}

export function RoleConfigForm() {
  const [state, action, pending] = useActionState(saveRoleConfig, initial);
  return (
    <form action={action} style={{ display: "grid", gap: 8, maxWidth: 480 }}>
      <select name="role" required style={inputStyle}>
        <option value="finance">finance</option>
        <option value="instructor">instructor</option>
        <option value="admin">admin</option>
      </select>
      <textarea
        name="allowed_paths"
        placeholder={"/admin/payments\n/admin/revenue\n/admin/invoices"}
        style={areaStyle}
      />
      <button type="submit" className="cla-btn sm" disabled={pending}>
        {pending ? "…" : "Save privileges"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function AttendanceRosterForm({
  sessions,
}: {
  sessions: { id: string; title: string }[];
}) {
  const [state, action, pending] = useActionState(markAttendanceRoster, initial);
  return (
    <form action={action} style={{ display: "grid", gap: 8 }}>
      <select name="class_id" required style={inputStyle}>
        <option value="">Session</option>
        {sessions.map((s) => (
          <option key={s.id} value={s.id}>{s.title}</option>
        ))}
      </select>
      <textarea
        name="roster"
        required
        placeholder={"alice@student.demo,present\nbob@student.demo,absent\nCara <cara@student.demo>,late"}
        style={areaStyle}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button type="submit" className="cla-btn sm" disabled={pending}>
          {pending ? "…" : "Mark roster"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}
