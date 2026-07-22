import { AdminTopBar, AdminPageHead, ConfigBanner, EmptyRow } from "@/components/admin/AdminUi";
import { getRevenueSummary } from "@/lib/admin/ops";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

function money(amount: number, currency: string) {
  return `${currency} ${Number(amount || 0).toLocaleString()}`;
}

export default async function AdminRevenuePage() {
  const configured = isAdminClientConfigured();
  const summary = configured
    ? await getRevenueSummary()
    : { collected: 0, outstanding: 0, overdue: 0, pendingApproval: 0, currency: "RWF", payments: [] };

  const recent = summary.payments.slice(0, 20);

  return (
    <>
      <AdminTopBar section="Revenue" title="Revenue" />
      <div className="content">
        <AdminPageHead
          title="Revenue"
          lede="Financial overview from payment records."
        />
        <ConfigBanner ok={configured} />

        <div className="kpis" style={{ marginBottom: 18 }}>
          <div className="cla-card kpi">
            <small>Collected</small>
            <b className="num">{money(summary.collected, summary.currency)}</b>
            <span className="trend up">Total paid</span>
          </div>
          <div className="cla-card kpi">
            <small>Outstanding</small>
            <b className="num">{money(summary.outstanding, summary.currency)}</b>
            <span className="trend up">Due minus paid</span>
          </div>
          <div className="cla-card kpi">
            <small>Overdue</small>
            <b className="num">{summary.overdue}</b>
            <span className="trend up">Overdue payments</span>
          </div>
          <div className="cla-card kpi">
            <small>Pending approval</small>
            <b className="num">{summary.pendingApproval}</b>
            <span className="trend up">Needs review</span>
          </div>
        </div>

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>Recent payments</h3>
              <small>Latest {recent.length} records</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Due</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Approved</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <EmptyRow cols={6} message="No payment data yet." />
              ) : (
                recent.map((row) => (
                  <tr key={row.id}>
                    <td>{row.student_email}</td>
                    <td>{row.course_title || "—"}</td>
                    <td>{money(row.amount_due, row.currency)}</td>
                    <td>{money(row.amount_paid, row.currency)}</td>
                    <td><span className="cla-pill">{row.status}</span></td>
                    <td>{row.approved_by_admin ? "Yes" : "No"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
