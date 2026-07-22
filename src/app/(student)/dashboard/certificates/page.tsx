import { requireSession } from "@/lib/auth";
import { listLearnerCertificates } from "@/lib/student/portal";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { ClaimCertificateForm } from "@/components/student/LearnerPortalForms";

export default async function CertificatesPage() {
  const session = await requireSession();
  const certs = isAdminClientConfigured()
    ? await listLearnerCertificates(session.userId)
    : [];

  return (
    <div className="wrap">
      <div className="hello" style={{ marginBottom: 22 }}>
        <div>
          <div className="mono eyebrow">Credentials</div>
          <h1>
            My <span className="serif">certificates</span>
          </h1>
        </div>
      </div>

      {certs.length === 0 ? (
        <div className="cla-card" style={{ padding: 24 }}>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Complete a programme to unlock a certificate claim.
          </p>
        </div>
      ) : (
        <div className="grid3">
          {certs.map((c) => (
            <article key={c.enrollment_id} className="cla-card" style={{ padding: 20 }}>
              <span className={`cla-pill ${c.certificate_issued ? "moss" : "amber"}`}>
                {c.certificate_issued ? "Issued" : "Eligible"}
              </span>
              <h3 style={{ margin: "12px 0 8px", fontSize: 18 }}>{c.course_title}</h3>
              <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--muted)" }}>
                Progress {c.progress_percent}%
                {c.completed_date ? ` · completed ${c.completed_date}` : ""}
              </p>
              {c.certificate_issued ? (
                <p style={{ margin: 0, fontSize: 14 }}>
                  Certificate on file for Cornerstone Luthien Advisory.
                </p>
              ) : (
                <ClaimCertificateForm enrollmentId={c.enrollment_id} />
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
