import { AdminTopBar, AdminPageHead, ConfigBanner, EmptyRow } from "@/components/admin/AdminUi";
import { ApprovePaymentForm, CreatePaymentForm } from "@/components/admin/OpsForms";
import { listCourseOptions, listPayments } from "@/lib/admin/ops";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

function money(amount: number, currency: string) {
  return `${currency} ${Number(amount || 0).toLocaleString()}`;
}

export default async function AdminPaymentsPage() {
  const configured = isAdminClientConfigured();
  const [payments, courses] = configured
    ? await Promise.all([listPayments(), listCourseOptions()])
    : [[], []];

  const pendingApproval = payments.filter((p) => !p.approved_by_admin).length;

  return (
    <>
      <AdminTopBar section="Payments" title="Payments" />
      <div className="content">
        <AdminPageHead
          title="Payments"
          lede="Record student payments and approve them to trigger enrollment."
        />
        <ConfigBanner ok={configured} />

        <div className="kpis" style={{ marginBottom: 18 }}>
          <div className="cla-card kpi">
            <small>Total payments</small>
            <b className="num">{payments.length}</b>
            <span className="trend up">All records</span>
          </div>
          <div className="cla-card kpi">
            <small>Pending approval</small>
            <b className="num">{pendingApproval}</b>
            <span className="trend up">Needs review</span>
          </div>
        </div>

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Add payment</h3>
              <small>Record a new payment entry</small>
            </div>
          </div>
          <CreatePaymentForm courses={courses} />
        </section>

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>Payment records</h3>
              <small>{payments.length} entries</small>
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
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <EmptyRow cols={7} message="No payments recorded yet." />
              ) : (
                payments.map((row) => (
                  <tr key={row.id}>
                    <td>{row.student_email}</td>
                    <td>{row.course_title || "—"}</td>
                    <td>{money(row.amount_due, row.currency)}</td>
                    <td>{money(row.amount_paid, row.currency)}</td>
                    <td><span className="cla-pill">{row.status}</span></td>
                    <td>{row.approved_by_admin ? "Yes" : "No"}</td>
                    <td>
                      {!row.approved_by_admin ? (
                        <ApprovePaymentForm paymentId={row.id} />
                      ) : null}
                    </td>
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
