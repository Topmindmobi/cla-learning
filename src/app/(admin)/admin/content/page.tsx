import { AdminTopBar, AdminPageHead, ConfigBanner, EmptyRow } from "@/components/admin/AdminUi";
import { CreateCouponForm } from "@/components/admin/OpsForms";
import { listCoupons } from "@/lib/admin/ops";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

function money(amount: number, currency: string) {
  return `${currency} ${Number(amount || 0).toLocaleString()}`;
}

export default async function AdminContentPage() {
  const configured = isAdminClientConfigured();
  const coupons = configured ? await listCoupons() : [];

  return (
    <>
      <AdminTopBar section="Site content" title="Site content" />
      <div className="content">
        <AdminPageHead
          title="Site content"
          lede="Coupons and promotional content migrated from Base44."
        />
        <ConfigBanner ok={configured} />

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph">
            <div>
              <h3>Create coupon</h3>
              <small>Add a discount code for the catalog</small>
            </div>
          </div>
          <CreateCouponForm />
        </section>

        <section className="cla-card panel">
          <div className="ph">
            <div>
              <h3>Coupons</h3>
              <small>{coupons.length} codes</small>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Discount</th>
                <th>Active</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <EmptyRow cols={5} message="No coupons yet." />
              ) : (
                coupons.map((row) => (
                  <tr key={row.id}>
                    <td><b>{row.code}</b></td>
                    <td>{row.description || "—"}</td>
                    <td>
                      {row.discount_percent
                        ? `${row.discount_percent}%`
                        : row.discount_amount
                          ? money(row.discount_amount, "RWF")
                          : "—"}
                    </td>
                    <td>
                      <span className={`cla-pill ${row.active ? "moss" : "amber"}`}>
                        {row.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {row.expires_at
                        ? new Date(row.expires_at).toLocaleDateString()
                        : "—"}
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
