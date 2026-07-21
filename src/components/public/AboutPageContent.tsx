import Link from "next/link";
import { ABOUT_PILLARS, ACCREDITATIONS } from "@/lib/public-content";
import { PageCta } from "./ProgrammePage";

const VALUES = [
  { title: "Professionalism", icon: "🏆" },
  { title: "Integrity", icon: "🤝" },
  { title: "Honesty", icon: "💡" },
  { title: "Quality Service", icon: "⭐" },
  { title: "Value for Time & Money", icon: "⏱️" },
  { title: "Innovation", icon: "🚀" },
];

export default function AboutPageContent() {
  return (
    <>
      <section className="page-hero page-hero--brand page-hero--compact">
        <div className="cla-wrap page-hero-inner">
          <span className="mono eyebrow" style={{ color: "rgba(255,255,255,.6)" }}>About us</span>
          <h1>Center for Professional Training &amp; Consultancy Services</h1>
          <p>
            Cornerstone &amp; Luthien Advisory (CLA) is a leading consultancy and education provider, committed to helping organizations and individuals achieve excellence through tailored solutions.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="cla-wrap about-split">
          <div>
            <span className="mono eyebrow">Who we are</span>
            <h2 style={{ marginTop: 10, marginBottom: 16 }}>Empowering success through expert consultancy, training &amp; research</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 14 }}>
              CLA was registered in Rwanda through RDB in August 2016 and has since been offering tuition for globally recognized professional courses. We specialize in delivering industry-focused training, consultancy, research, and development services, with a strong presence across East Africa.
            </p>
            <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 22 }}>
              Our institute has a dynamic team committed to multicultural learning, coupled with excellent links to progressive institutions of higher learning at both local and international levels.
            </p>
            <Link href="/catalog" className="cla-btn primary">Explore our courses</Link>
          </div>
          <div className="vision-mission">
            <div className="vm-card vm-card--brand">
              <h3>Our vision</h3>
              <p>A world class center for professional training and consultancy services.</p>
            </div>
            <div className="vm-card vm-card--dark">
              <h3>Our mission</h3>
              <p>To generate, explore and provide quality professional training and consulting services, carry out specialized research and development, and conduct need-based quality training across East Africa.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section page-section--wash">
        <div className="cla-wrap">
          <div className="head" style={{ margin: "0 auto 34px", textAlign: "center", maxWidth: 560 }}>
            <span className="mono eyebrow">Strategy to 2028</span>
            <h2 style={{ marginTop: 10 }}>Our three strategic pillars</h2>
          </div>
          <div className="why-grid-mini">
            {ABOUT_PILLARS.map((p, i) => (
              <div key={p.title} className="why-mini">
                <span className="pillar-num">{i + 1}</span>
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="cla-wrap">
          <div className="head" style={{ margin: "0 auto 34px", textAlign: "center", maxWidth: 560 }}>
            <span className="mono eyebrow">What we stand for</span>
            <h2 style={{ marginTop: 10 }}>Our core values</h2>
          </div>
          <div className="values-grid">
            {VALUES.map((v) => (
              <div key={v.title} className="value-chip">
                <span>{v.icon}</span>
                <b>{v.title}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section page-section--wash">
        <div className="cla-wrap" style={{ maxWidth: 720 }}>
          <div className="head" style={{ margin: "0 auto 34px", textAlign: "center" }}>
            <span className="mono eyebrow">Recognised globally</span>
            <h2 style={{ marginTop: 10 }}>Our accreditations &amp; affiliations</h2>
            <p>CLA holds accreditation from leading professional bodies across the UK, Rwanda, and Kenya.</p>
          </div>
          <ul className="accred-list">
            {ACCREDITATIONS.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </section>

      <PageCta title="Ready to advance your career?" desc="Join thousands of professionals learning with CLA across East Africa and beyond." />
    </>
  );
}
