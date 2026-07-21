import Link from "next/link";
import { CheckIcon } from "@/components/brand/ClaLogo";
import { FeaturedCourseCard } from "@/components/catalog/CourseCatalogGrid";
import { HOME_FEATURED_COURSES } from "@/lib/featured-courses";

const CATEGORIES = [
  { count: "14", label: "Procurement & supply", sub: "CIPS Levels 2–6", pill: "brand" },
  { count: "11", label: "Accounting & finance", sub: "ACCA, IFRS, reporting", pill: "moss" },
  { count: "8", label: "Leadership & management", sub: "Strategy, teams, change", pill: "amber" },
  { count: "6", label: "Project management", sub: "PMP prep, delivery", pill: "" },
  { count: "5", label: "Digital & technology", sub: "Data, AI at work", pill: "" },
  { count: "4", label: "Consulting skills", sub: "Proposals, advisory", pill: "" },
  { count: "7", label: "Short courses", sub: "Two to six weeks", pill: "" },
  { count: "—", label: "In-house training", sub: "Built for your team", pill: "" },
];

export default function HomePage() {
  return (
    <>
      <div className="hero">
        <div className="cla-wrap hero-grid">
          <div>
            <span className="cla-pill brand">CIPS Approved Centre · ACCA Partner</span>
            <h1 style={{ marginTop: 18 }}>
              Qualify in procurement, finance and leadership — <em>while you keep working.</em>
            </h1>
            <p className="lede">
              Globally recognised qualifications delivered from Kigali, with evening and weekend cohorts,
              live tutors and a study platform that tracks every level you complete.
            </p>
            <form className="finder" action="/catalog" method="get">
              <input name="q" placeholder="Search CIPS, ACCA, PMP, short courses…" aria-label="Search courses" />
              <button type="submit" className="cla-btn primary">Find a course</button>
            </form>
            <div className="accred">
              <span><b>Next intake</b> 4 August</span>
              <i className="sep" />
              <span><b>Instalments</b> from RWF 5,000/month</span>
              <i className="sep" />
              <span><b>Format</b> Online &amp; in-centre</span>
            </div>
          </div>
          <div className="ladder">
            <div className="mono">Where you&apos;d start · CIPS pathway</div>
            {[
              ["2", "Certificate in Procurement & Supply", "New to the field · 8 months"],
              ["3", "Advanced Certificate", "Buyer / officer level · 10 months"],
              ["4", "Diploma", "Where most professionals join · 12 months"],
              ["5", "Advanced Diploma", "Managing a category or team", ""],
            ].map(([lv, title, sub]) => (
              <div key={lv} className="rung">
                <span className="lv">{lv}</span>
                <p>{title}<small>{sub}</small></p>
              </div>
            ))}
            <div className="rung cap">
              <span className="lv">6</span>
              <p>Professional Diploma<small>Leads to MCIPS chartered status</small></p>
            </div>
            <div className="ladder-foot">
              <span>Not sure which level fits you?</span>
              <Link className="cla-link" style={{ color: "#7FE3C2" }} href="/contact">Take the 3-minute check →</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="proof">
        <div className="cla-wrap">
          <div><b>2,000+</b><small>Professionals trained since 2018</small></div>
          <div><b>95%</b><small>First-sitting pass rate</small></div>
          <div><b>50+</b><small>Courses across four faculties</small></div>
          <div><b>10</b><small>Countries represented in cohorts</small></div>
        </div>
      </div>

      <section id="programmes">
        <div className="cla-wrap">
          <div className="head-row">
            <div className="head" style={{ marginBottom: 0 }}>
              <span className="mono eyebrow">Programmes</span>
              <h2 style={{ marginTop: 10 }}>Three routes, <em>one standard</em></h2>
              <p>Accredited qualifications and applied short courses, all taught by practitioners who still do the work.</p>
            </div>
            <Link className="cla-link" href="/catalog">Compare all programmes →</Link>
          </div>
          <div className="progs">
            <Link href="/cips" className="prog feature">
              <span className="cla-pill amber">CIPS Approved Centre</span>
              <h3>CIPS</h3>
              <div className="sub" style={{ color: "#8FA3C9" }}>Procurement &amp; supply chain</div>
              <p>Level 2 through Level 6, structured for working professionals and ending in chartered MCIPS status.</p>
              <div className="levels"><span>Level 2</span><span>Level 3</span><span>Level 4</span><span>Level 5</span><span>Level 6</span></div>
              <span className="cla-btn">Explore CIPS</span>
            </Link>
            <Link href="/acca" className="prog">
              <span className="cla-pill moss">ACCA Partner</span>
              <h3>ACCA</h3>
              <div className="sub">Accounting &amp; finance</div>
              <p>Applied Knowledge through Strategic Professional, preparing finance teams for audit, reporting and advisory roles.</p>
              <div className="levels"><span>Applied Knowledge</span><span>Applied Skills</span><span>Strategic Professional</span></div>
              <span className="cla-btn">Explore ACCA</span>
            </Link>
            <Link href="/catalog" className="prog">
              <span className="cla-pill">Expert-led</span>
              <h3>Professional courses</h3>
              <div className="sub">Business, leadership &amp; technology</div>
              <p>Short, practical courses in leadership, project management and digital skills — finish in weeks, not years.</p>
              <div className="levels"><span>Short courses</span><span>Workshops</span><span>In-house training</span></div>
              <span className="cla-btn">Browse courses</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="about" id="about">
        <div className="cla-wrap about-grid">
          <div>
            <span className="mono eyebrow">Who we are</span>
            <h2 style={{ fontSize: 36, marginTop: 10 }}>
              A professional learning institution, <span className="serif" style={{ fontStyle: "italic" }}>not a course marketplace</span>
            </h2>
            <p>Cornerstone &amp; Luthien Advisory (CLA) is an accredited study centre for CIPS and ACCA — two of the world&apos;s most recognised professional bodies — operating from Kigali and teaching across East Africa.</p>
            <p>We equip professionals with the qualifications, skills and confidence to advance careers in procurement, supply chain, finance and business leadership.</p>
            <div className="checks">
              {[
                "Accredited centre for CIPS Level 2–6 and ACCA qualifications",
                "Tutors who are MCIPS and ACCA-qualified practitioners",
                "Live online classes with recordings and a structured study platform",
                "Learners in 10+ countries, from Kigali to Juba to Nairobi",
              ].map((text) => (
                <div key={text} className="check"><CheckIcon /><span>{text}</span></div>
              ))}
            </div>
            <Link className="cla-btn dark" style={{ marginTop: 26 }} href="/about">Learn more about CLA</Link>
          </div>
          <div>
            <div className="mv dark"><h4>Our mission</h4><p>To widen access to high-quality professional education so that people and organisations across Africa can compete on equal terms in their fields.</p></div>
            <div className="mv"><h4>Our vision</h4><p>To be Africa&apos;s leading centre of excellence for professional qualifications — recognised for the quality, relevance and career impact of our programmes.</p></div>
            <div className="mv"><h4>How we teach</h4><p>Small cohorts, weekly live sessions, past-paper drills and a tutor who knows your name. Attendance and progress are tracked so nobody quietly falls behind.</p></div>
          </div>
        </div>
      </section>

      <section id="courses">
        <div className="cla-wrap">
          <div className="head-row">
            <div className="head" style={{ marginBottom: 0 }}>
              <span className="mono eyebrow">Featured</span>
              <h2 style={{ marginTop: 10 }}>Start where you are</h2>
              <p>The courses professionals enrol in most this intake.</p>
            </div>
            <Link className="cla-link" href="/catalog">View all 50 courses →</Link>
          </div>
          <div className="grid">
            {HOME_FEATURED_COURSES.map((c) => (
              <FeaturedCourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      </section>

      <section className="why" id="why">
        <div className="cla-wrap">
          <div className="head">
            <span className="mono" style={{ color: "#7FE3C2" }}>Why CLA</span>
            <h2 style={{ marginTop: 10 }}>What you get that a video library <em>can&apos;t give you</em></h2>
            <p>Accreditation, real tutors and a schedule built around a full-time job.</p>
          </div>
          <div className="why-grid">
            {[
              ["Dual accreditation", "Approved for both CIPS and ACCA — your certificate carries the same weight as one earned in London."],
              ["Practitioner tutors", "Every session is led by someone currently working in procurement, audit or finance leadership."],
              ["Live online classes", "Evening and weekend sessions, recorded and posted the same night if you have to miss one."],
              ["Tracked progress", "Lessons, attendance and mock results in one dashboard, so you always know if you're on pace for the exam."],
              ["Career progression", "Qualifications employers ask for by name, plus alumni introductions across the region."],
              ["Instalment plans", "Pay per module or monthly. Employer sponsorship and group rates handled by our admissions team."],
            ].map(([title, desc]) => (
              <div key={title} className="why-cell">
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="cla-wrap">
          <div className="quote">
            <div className="face">JU</div>
            <div>
              <blockquote>&ldquo;I sat Level 4 while running a busy tender office. The Saturday cohort and the past-paper drills are the only reason I passed first time.&rdquo;</blockquote>
              <div className="who">Procurement officer, Ministry of Infrastructure · CIPS Level 4, 2025 cohort</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="cla-wrap">
          <div className="head-row">
            <div className="head" style={{ marginBottom: 0 }}>
              <span className="mono eyebrow">Browse</span>
              <h2 style={{ marginTop: 10 }}>Find the right course for your goal</h2>
            </div>
            <Link className="cla-link" href="/catalog">View all categories →</Link>
          </div>
          <div className="cats">
            {CATEGORIES.map((cat) => (
              <Link key={cat.label} href="/catalog" className="cat">
                <span className={`cla-pill ${cat.pill}`}>{cat.count}</span>
                <span>{cat.label}<small>{cat.sub}</small></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }} id="contact">
        <div className="cla-wrap">
          <div className="cta">
            <span className="cla-pill amber">Next intake · 4 August</span>
            <h2 style={{ marginTop: 16 }}>Start the qualification <em>you keep postponing</em></h2>
            <p>Applications take about ten minutes. Admissions will call you within two working days to confirm your level and study plan.</p>
            <Link className="cla-btn primary" href="/register">Apply for the August intake</Link>
            <Link className="cla-btn" style={{ background: "transparent", borderColor: "rgba(255,255,255,.3)", color: "#fff", marginLeft: 5 }} href="/contact">Talk to admissions</Link>
          </div>
        </div>
      </section>
    </>
  );
}
