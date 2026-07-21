"use client";

import Link from "next/link";
import { useState } from "react";

type Path = null | "student" | "applicant" | "instructor";

const OPTIONS: { id: Path; title: string; desc: string; accent?: string }[] = [
  { id: "student", title: "Current student", desc: "Already studying with us? Update your details and keep your profile current." },
  { id: "applicant", title: "New applicant", desc: "Interested in joining? Start your application and take the first step.", accent: "moss" },
  { id: "instructor", title: "Instructor", desc: "Want to teach with us? Submit your instructor application and join our faculty.", accent: "gold" },
];

export default function RegisterPageContent() {
  const [path, setPath] = useState<Path>(null);

  if (path) {
    return (
      <section className="page-section" style={{ paddingTop: 48 }}>
        <div className="cla-wrap" style={{ maxWidth: 560 }}>
          <button type="button" className="cla-btn ghost" style={{ paddingLeft: 0, marginBottom: 20 }} onClick={() => setPath(null)}>
            ← Back
          </button>
          <div className="cla-card" style={{ padding: 32 }}>
            <h2 style={{ marginBottom: 10 }}>
              {path === "student" && "Current student registration"}
              {path === "applicant" && "New applicant registration"}
              {path === "instructor" && "Instructor application"}
            </h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 22 }}>
              Online registration forms are being migrated to the new platform. For now, please contact admissions with your details and we will complete your registration.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Link href="/contact" className="cla-btn primary">Contact admissions</Link>
              <Link href="/login" className="cla-btn">Sign in to existing account</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section" style={{ paddingTop: 48 }}>
      <div className="cla-wrap">
        <div className="head" style={{ margin: "0 auto 40px", textAlign: "center", maxWidth: 560 }}>
          <h2 style={{ fontSize: 36 }}>Welcome to CLA Learning</h2>
          <p>Choose the option that best describes you</p>
        </div>
        <div className="register-grid">
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`register-card${opt.accent ? ` register-card--${opt.accent}` : ""}`}
              onClick={() => setPath(opt.id)}
            >
              <h3>{opt.title}</h3>
              <p>{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
