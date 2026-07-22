import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help | CLA Learning",
  description: "Help centre for Cornerstone Luthien Advisory learners.",
};

const FAQS = [
  {
    q: "How do I access my LMS lessons?",
    a: "Open My learning, choose a published programme, then use the lesson player sidebar to move through modules → chapters → activities.",
  },
  {
    q: "What is the quiz pass mark?",
    a: "Most module quizzes use a 70% pass threshold. You can retake when the quiz allows it.",
  },
  {
    q: "How do payments work?",
    a: "Request access from Billing. Finance reviews the pending payment and approves course access. Currency is RWF (USD fallback on invoices).",
  },
  {
    q: "Where are live classes?",
    a: "See Schedule for upcoming sessions. Join via the meeting link when the class is live (Africa/Kigali time).",
  },
];

export default function HelpPage() {
  return (
    <main className="wrap" style={{ padding: "48px 0 80px", maxWidth: 720, margin: "0 auto" }}>
      <p className="mono eyebrow">Support</p>
      <h1 style={{ fontSize: 36, margin: "8px 0 12px" }}>
        Help <span className="serif">centre</span>
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: 28 }}>
        Cornerstone Luthien Advisory · Rwanda ·{" "}
        <a href="mailto:learning@cla.rw">learning@cla.rw</a>
      </p>
      <div style={{ display: "grid", gap: 14 }}>
        {FAQS.map((f) => (
          <article key={f.q} className="cla-card" style={{ padding: 18 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>{f.q}</h3>
            <p style={{ margin: 0, color: "var(--ink2)", fontSize: 15 }}>{f.a}</p>
          </article>
        ))}
      </div>
      <p style={{ marginTop: 28 }}>
        <Link href="/contact" className="cla-btn primary">
          Contact CLA
        </Link>{" "}
        <Link href="/dashboard" className="cla-btn">
          Back to dashboard
        </Link>
      </p>
    </main>
  );
}
