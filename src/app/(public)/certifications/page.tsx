import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Certifications | CLA Learning",
  description: "CIPS and ACCA pathways through Cornerstone Luthien Advisory.",
};

export default function CertificationsPage() {
  return (
    <main>
      <section style={{ padding: "64px 0 40px" }}>
        <div className="wrap" style={{ maxWidth: 900 }}>
          <p className="mono eyebrow">Credentials</p>
          <h1 style={{ fontSize: 42, margin: "8px 0 14px" }}>
            CLA <span className="serif">certifications</span>
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: "52ch", fontSize: 17 }}>
            Cornerstone Luthien Advisory is a centre of excellence for professional learning in
            Rwanda — delivering CIPS and ACCA pathways with live online teaching.
          </p>
        </div>
      </section>
      <section style={{ paddingBottom: 72 }}>
        <div className="wrap" style={{ display: "grid", gap: 16, maxWidth: 900 }}>
          <article className="cla-card" style={{ padding: 24 }}>
            <span className="cla-pill brand">CIPS Approved Centre</span>
            <h2 style={{ margin: "12px 0 8px" }}>Chartered Institute of Procurement & Supply</h2>
            <p style={{ color: "var(--muted)", marginBottom: 16 }}>
              Structured L2–L6 pathways with LMS modules aligned to learning outcomes and assessment
              criteria.
            </p>
            <Link href="/cips" className="cla-btn primary">
              Explore CIPS
            </Link>
          </article>
          <article className="cla-card" style={{ padding: 24 }}>
            <span className="cla-pill brand">ACCA Partner</span>
            <h2 style={{ margin: "12px 0 8px" }}>Association of Chartered Certified Accountants</h2>
            <p style={{ color: "var(--muted)", marginBottom: 16 }}>
              Professional accounting qualifications with CLA cohort support and timetable sessions.
            </p>
            <Link href="/acca" className="cla-btn primary">
              Explore ACCA
            </Link>
          </article>
          <article className="cla-card" style={{ padding: 24 }}>
            <h2 style={{ margin: "0 0 8px" }}>Digital certificates</h2>
            <p style={{ color: "var(--muted)", marginBottom: 16 }}>
              Learners who complete a programme can claim a CLA certificate from their student
              dashboard.
            </p>
            <Link href="/register" className="cla-btn">
              Register as a learner
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
