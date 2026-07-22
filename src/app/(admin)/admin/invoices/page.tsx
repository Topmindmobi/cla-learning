import { AdminTopBar, AdminPageHead, ConfigBanner, EmptyRow } from "@/components/admin/AdminUi";
import { CreateInvoiceForm } from "@/components/admin/OpsForms";
import { CreatePaymentPlanForm } from "@/components/admin/TeachingForms";
import { listCourseOptions, listInvoices, listPaymentPlans } from "@/lib/admin/ops";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

function money(amount: number, currency: string) {
  return `${currency} ${Number(amount || 0).toLocaleString()}`;
}

export default async function AdminInvoicesPage() {
  const configured = isAdminClientConfigured();
  const [invoices, paymentPlans, courses] = configured
    ? await Promise.all([listInvoices(), listPaymentPlans(), listCourseOptions()])
    : [[], [], []];

  return (
    <>
      <AdminTopBar section="Invoices & plans" title="Invoices & plans" />
      <div className="content">
        <AdminPageHead
          title="Invoices & plans"
          lede="Issue invoices and define installment plans for programmes."
        />
        <ConfigBanner ok={configured} />

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Create invoice</h3>
              <small>Issue a new invoice to a student</small>
            </div>
          </div>
          <CreateInvoiceForm courses={courses} />
        </section>

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Create payment plan</h3>
              <small>Template for installment billing</small>
            </div>
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            <CreatePaymentPlanForm courses={courses} />
          </div>
        </section>

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Invoices</h3>
              <small>{invoices.length} invoices</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <EmptyRow cols={5} message="No invoices yet." />
              ) : (
                invoices.map((row) => (
                  <tr key={row.id}>
                    <td>{row.student_email}</td>
                    <td>{row.course_title || "—"}</td>
                    <td>{money(row.amount, row.currency)}</td>
                    <td><span className="cla-pill">{row.status}</span></td>
                    <td>{row.due_date ? new Date(row.due_date).toLocaleDateString() : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>Payment plans</h3>
              <small>{paymentPlans.length} plans</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Course</th>
                <th>Total</th>
                <th>Installments</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentPlans.length === 0 ? (
                <EmptyRow cols={5} message="No payment plans yet." />
              ) : (
                paymentPlans.map((plan) => {
                  const row = plan as {
                    id: string;
                    name?: string;
                    course_title?: string;
                    total_amount?: number;
                    currency?: string;
                    installment_count?: number;
                    status?: string;
                  };
                  return (
                    <tr key={row.id}>
                      <td>{row.name || "—"}</td>
                      <td>{row.course_title || "—"}</td>
                      <td>{money(Number(row.total_amount ?? 0), row.currency || "RWF")}</td>
                      <td>{row.installment_count ?? "—"}</td>
                      <td><span className="cla-pill">{row.status || "—"}</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
