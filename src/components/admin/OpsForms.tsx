"use client";

import { useActionState } from "react";
import {
  approvePayment,
  createCohort,
  createCoupon,
  createInstructor,
  createInvoice,
  createPayment,
  createSession,
  markAttendance,
  type AdminActionState,
} from "@/app/(admin)/admin/actions";

const initial: AdminActionState = {};

const inputStyle: React.CSSProperties = {
  height: 34,
  borderRadius: 8,
  border: "1px solid var(--line)",
  padding: "0 8px",
  font: "inherit",
};

function FormFeedback({ state }: { state: AdminActionState }) {
  if (state.error) {
    return <span style={{ color: "var(--rose)", fontSize: 12 }}>{state.error}</span>;
  }
  if (state.message) {
    return <span style={{ color: "var(--moss)", fontSize: 12 }}>{state.message}</span>;
  }
  return null;
}

export function CreatePaymentForm({
  courses,
}: {
  courses: { id: string; title: string }[];
}) {
  const [state, action, pending] = useActionState(createPayment, initial);
  return (
    <form action={action} className="tools" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Student email
        <input name="student_email" type="email" required style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Course
        <select name="course_id" style={inputStyle}>
          <option value="">— Optional —</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Amount due
        <input name="amount_due" type="number" min={0} required style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Amount paid
        <input name="amount_paid" type="number" min={0} defaultValue={0} style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Type
        <select name="payment_type" defaultValue="full" style={inputStyle}>
          <option value="full">Full</option>
          <option value="partial">Partial</option>
          <option value="installment">Installment</option>
        </select>
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Notes
        <input name="notes" type="text" style={inputStyle} />
      </label>
      <input type="hidden" name="currency" value="RWF" />
      <button type="submit" className="cla-btn sm" disabled={pending}>
        {pending ? "Saving…" : "Add payment"}
      </button>
      <FormFeedback state={state} />
    </form>
  );
}

export function ApprovePaymentForm({ paymentId }: { paymentId: string }) {
  const [state, action, pending] = useActionState(approvePayment, initial);
  return (
    <form action={action} style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
      <input type="hidden" name="payment_id" value={paymentId} />
      <button type="submit" className="cla-btn sm" disabled={pending}>
        {pending ? "…" : "Approve"}
      </button>
      {state.error ? <span style={{ color: "var(--rose)", fontSize: 12 }}>{state.error}</span> : null}
    </form>
  );
}

export function CreateCohortForm({
  courses,
}: {
  courses: { id: string; title: string }[];
}) {
  const [state, action, pending] = useActionState(createCohort, initial);
  return (
    <form action={action} className="tools" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Name
        <input name="name" type="text" required style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Course
        <select name="course_id" required style={inputStyle}>
          <option value="">Select course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Start date
        <input name="start_date" type="date" style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        End date
        <input name="end_date" type="date" style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Status
        <select name="status" defaultValue="planned" style={inputStyle}>
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>
      <button type="submit" className="cla-btn sm" disabled={pending}>
        {pending ? "Saving…" : "Create cohort"}
      </button>
      <FormFeedback state={state} />
    </form>
  );
}

export function MarkAttendanceForm({
  sessions,
}: {
  sessions: { id: string; title: string; start_at: string | null }[];
}) {
  const [state, action, pending] = useActionState(markAttendance, initial);
  return (
    <form action={action} className="tools" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Student email
        <input name="student_email" type="email" required style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Name (optional)
        <input name="student_name" type="text" style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Class session
        <select name="class_id" style={inputStyle}>
          <option value="">— Optional —</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
              {s.start_at ? ` · ${new Date(s.start_at).toLocaleDateString()}` : ""}
            </option>
          ))}
        </select>
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Status
        <select name="status" defaultValue="present" style={inputStyle}>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="excused">Excused</option>
        </select>
      </label>
      <button type="submit" className="cla-btn sm" disabled={pending}>
        {pending ? "Saving…" : "Mark attendance"}
      </button>
      <FormFeedback state={state} />
    </form>
  );
}

export function CreateInstructorForm() {
  const [state, action, pending] = useActionState(createInstructor, initial);
  return (
    <form action={action} className="tools" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Full name
        <input name="full_name" type="text" required style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Email
        <input name="email" type="email" required style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Phone
        <input name="phone" type="tel" style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Title
        <input name="title" type="text" style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Availability
        <select name="availability" defaultValue="Part-time" style={inputStyle}>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
        </select>
      </label>
      <button type="submit" className="cla-btn sm" disabled={pending}>
        {pending ? "Saving…" : "Add instructor"}
      </button>
      <FormFeedback state={state} />
    </form>
  );
}

export function CreateSessionForm({
  courses,
}: {
  courses: { id: string; title: string }[];
}) {
  const [state, action, pending] = useActionState(createSession, initial);
  return (
    <form action={action} className="tools" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Title
        <input name="title" type="text" required style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Course
        <select name="course_id" style={inputStyle}>
          <option value="">— Optional —</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Start
        <input name="start_at" type="datetime-local" style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        End
        <input name="end_at" type="datetime-local" style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Location
        <input name="location" type="text" style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Meeting URL
        <input name="meeting_url" type="url" style={inputStyle} />
      </label>
      <button type="submit" className="cla-btn sm" disabled={pending}>
        {pending ? "Saving…" : "Schedule session"}
      </button>
      <FormFeedback state={state} />
    </form>
  );
}

export function CreateInvoiceForm({
  courses,
}: {
  courses: { id: string; title: string }[];
}) {
  const [state, action, pending] = useActionState(createInvoice, initial);
  return (
    <form action={action} className="tools" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Student email
        <input name="student_email" type="email" required style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Course
        <select name="course_id" style={inputStyle}>
          <option value="">— Optional —</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Amount
        <input name="amount" type="number" min={0} required style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Due date
        <input name="due_date" type="date" style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Status
        <select name="status" defaultValue="sent" style={inputStyle}>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </label>
      <input type="hidden" name="currency" value="RWF" />
      <button type="submit" className="cla-btn sm" disabled={pending}>
        {pending ? "Saving…" : "Create invoice"}
      </button>
      <FormFeedback state={state} />
    </form>
  );
}

export function CreateCouponForm() {
  const [state, action, pending] = useActionState(createCoupon, initial);
  return (
    <form action={action} className="tools" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Code
        <input name="code" type="text" required style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Description
        <input name="description" type="text" style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Discount %
        <input name="discount_percent" type="number" min={0} max={100} style={inputStyle} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        Discount amount
        <input name="discount_amount" type="number" min={0} style={inputStyle} />
      </label>
      <button type="submit" className="cla-btn sm" disabled={pending}>
        {pending ? "Saving…" : "Create coupon"}
      </button>
      <FormFeedback state={state} />
    </form>
  );
}
