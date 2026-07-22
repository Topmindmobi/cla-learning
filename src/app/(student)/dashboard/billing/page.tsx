import { requireSession } from "@/lib/auth";
import {
  listLearnerInvoices,
  listLearnerPayments,
} from "@/lib/student/portal";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { PurchaseRequestForm } from "@/components/student/LearnerPortalForms";

export default async function BillingPage() {
  const session = await requireSession();
  const configured = isAdminClientConfigured();
  const [payments, invoices] = configured
    ? await Promise.all([
        listLearnerPayments(session.userId, session.email),
        listLearnerInvoices(session.userId, session.email),
      ])
    : [[], []];

  let courses: { id: string; title: string; price?: number | null; currency?: string | null }[] = [];
  if (configured) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("courses")
      .select("id, title, price, currency")
      .eq("is_published", true)
      .order("title")
      .limit(50);
    courses = (data ?? []) as typeof courses;
  }

  return (
    <div className="wrap">
      <div className="hello" style={{ marginBottom: 22 }}>
        <div>
          <div className="mono eyebrow">Finance · RWF</div>
          <h1>
            My <span className="serif">billing</span>
          </h1>
        </div>
      </div>

      <section className="cla-card" style={{ padding: 20, marginBottom: 18 }}>
        <h3 style={{ marginTop: 0 }}>Request course access</h3>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 0 }}>
          Creates a pending payment for finance approval (no Stripe charge in this flow).
        </p>
        <PurchaseRequestForm courses={courses} />
      </section>

      <div className="grid3" style={{ marginBottom: 18 }}>
        <div className="cla-card stat">
          <small>Payments</small>
          <b>{payments.length}</b>
        </div>
        <div className="cla-card stat">
          <small>Invoices</small>
          <b>{invoices.length}</b>
        </div>
        <div className="cla-card stat">
          <small>Pending approval</small>
          <b>{payments.filter((p) => !p.approved_by_admin).length}</b>
        </div>
      </div>

      <section className="cla-card" style={{ marginBottom: 18, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
          <h3 style={{ margin: 0 }}>Payments</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
              <th style={{ padding: 14 }}>Course</th>
              <th style={{ padding: 14 }}>Due</th>
              <th style={{ padding: 14 }}>Paid</th>
              <th style={{ padding: 14 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 20, color: "var(--muted)" }}>
                  No payments yet.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: 14 }}>{p.course_title ?? "—"}</td>
                  <td style={{ padding: 14 }}>
                    {p.currency} {p.amount_due.toLocaleString()}
                  </td>
                  <td style={{ padding: 14 }}>
                    {p.currency} {p.amount_paid.toLocaleString()}
                  </td>
                  <td style={{ padding: 14 }}>
                    <span className={`cla-pill ${p.approved_by_admin ? "moss" : "amber"}`}>
                      {p.status}
                      {!p.approved_by_admin ? " · awaiting approval" : ""}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="cla-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
          <h3 style={{ margin: 0 }}>Invoices</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
              <th style={{ padding: 14 }}>Course</th>
              <th style={{ padding: 14 }}>Amount</th>
              <th style={{ padding: 14 }}>Due</th>
              <th style={{ padding: 14 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 20, color: "var(--muted)" }}>
                  No invoices yet.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: 14 }}>{inv.course_title ?? "—"}</td>
                  <td style={{ padding: 14 }}>
                    {inv.currency} {inv.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: 14 }}>{inv.due_date ?? "—"}</td>
                  <td style={{ padding: 14 }}>
                    <span className="cla-pill">{inv.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
