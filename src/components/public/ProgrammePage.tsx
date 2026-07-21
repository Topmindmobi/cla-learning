import Link from "next/link";

type Level = {
  level: string;
  title: string;
  duration: string;
  badge: string;
  desc: string;
  topics: string[];
};

export function PageHero({
  badge,
  title,
  subtitle,
  accent = "brand",
  catalogQuery,
}: {
  badge: string;
  title: string;
  subtitle: string;
  accent?: "brand" | "moss";
  catalogQuery?: string;
}) {
  const catalogHref = catalogQuery ? `/catalog?q=${encodeURIComponent(catalogQuery)}` : "/catalog";
  return (
    <section className={`page-hero page-hero--${accent}`}>
      <div className="cla-wrap page-hero-inner">
        <span className="cla-pill">{badge}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <div className="page-hero-actions">
          <Link href={catalogHref} className="cla-btn primary">Explore courses</Link>
          <a href="#levels" className="cla-btn page-hero-ghost">View qualification levels</a>
        </div>
      </div>
    </section>
  );
}

export function WhyGrid({ title, intro, items }: { title: string; intro: string; items: { title: string; desc: string }[] }) {
  return (
    <section className="page-section page-section--wash">
      <div className="cla-wrap">
        <div className="head" style={{ margin: "0 auto 34px", textAlign: "center", maxWidth: 560 }}>
          <h2>{title}</h2>
          <p>{intro}</p>
        </div>
        <div className="why-grid-mini">
          {items.map((item) => (
            <div key={item.title} className="why-mini">
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LevelsSection({ title, intro, levels, catalogQuery }: { title: string; intro: string; levels: Level[]; catalogQuery?: string }) {
  const catalogHref = catalogQuery ? `/catalog?q=${encodeURIComponent(catalogQuery)}` : "/catalog";
  return (
    <section className="page-section" id="levels">
      <div className="cla-wrap">
        <div className="head" style={{ margin: "0 auto 34px", textAlign: "center", maxWidth: 560 }}>
          <h2>{title}</h2>
          <p>{intro}</p>
        </div>
        <div className="level-list">
          {levels.map((lvl) => (
            <article key={lvl.level} className="level-card">
              <div className="level-card-top">
                <span className="cla-pill brand">{lvl.level}</span>
                <span className="level-badge">{lvl.badge}</span>
              </div>
              <h3>{lvl.title}</h3>
              <p>{lvl.desc}</p>
              <div className="levels">
                {lvl.topics.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="level-card-foot">
                <span>{lvl.duration}</span>
                <Link href={catalogHref} className="cla-link">View courses →</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PageCta({ title, desc, catalogQuery }: { title: string; desc: string; catalogQuery?: string }) {
  const catalogHref = catalogQuery ? `/catalog?q=${encodeURIComponent(catalogQuery)}` : "/catalog";
  return (
    <section className="page-section" style={{ paddingTop: 0 }}>
      <div className="cla-wrap">
        <div className="cta">
          <h2>{title}</h2>
          <p>{desc}</p>
          <Link className="cla-btn primary" href={catalogHref}>Explore courses</Link>
          <Link className="cla-btn" style={{ background: "transparent", borderColor: "rgba(255,255,255,.3)", color: "#fff", marginLeft: 5 }} href="/contact">Talk to admissions</Link>
        </div>
      </div>
    </section>
  );
}
