import Link from "next/link";
import { CornerstoneWall } from "@/components/student/CornerstoneWall";

type Brick = "done" | "now" | "empty";

const ENROLLED: Array<{
  title: string;
  sub: string;
  thumb: "a" | "b" | "c";
  wall: Brick[][];
  primary: boolean;
}> = [
  {
    title: "Applied AI for Development Programmes",
    sub: "Module 3 of 5 · next: Designing prompts for field data collection",
    thumb: "a",
    wall: [["done", "done", "done", "now", "empty"]],
    primary: true,
  },
  {
    title: "Monitoring, Evaluation and Data Analysis",
    sub: "Module 2 of 4 · quiz due Thursday",
    thumb: "b",
    wall: [["done", "done", "empty", "empty", "empty"]],
    primary: false,
  },
  {
    title: "Governance and Board Effectiveness",
    sub: "Not started · 9 lessons · 3h 20m",
    thumb: "c",
    wall: [["empty", "empty", "empty", "empty", "empty"]],
    primary: false,
  },
];

export default function StudentDashboardPage() {
  return (
    <div className="wrap">
      <div className="hello">
        <div>
          <div className="mono eyebrow">Tuesday, 21 July</div>
          <h1>
            Good afternoon, Fredo — <span className="serif">two lessons to go</span>
          </h1>
        </div>
        <div>
          <div className="mono eyebrow" style={{ marginBottom: 6 }}>6-day streak</div>
          <div className="streak">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className={`day${i < 6 ? " hit" : ""}`}>{d}</div>
            ))}
          </div>
        </div>
      </div>

      <section className="cla-card resume">
        <div className="resume-l">
          <span className="cla-pill brand">In progress</span>
          <h3>Applied AI for Development Programmes</h3>
          <p className="lesson">Module 3 · Lesson 4 — Designing prompts for field data collection · 12 min left</p>
          <div className="meter" style={{ marginTop: 18 }}>
            <b>62%</b>
            <span className="eyebrow">of 34 lessons complete</span>
          </div>
          <CornerstoneWall
            maxWidth={420}
            rows={[
              ["done", "done", "done", "done", "done", "done"],
              ["done", "done", "done", "now", "empty", "empty"],
              ["empty", "empty", "empty", "empty", "empty", "empty"],
            ]}
          />
          <div style={{ marginTop: 22, display: "flex", gap: 10 }}>
            <Link href="/dashboard/course" className="cla-btn primary">Resume lesson</Link>
            <Link href="/dashboard/course" className="cla-btn">View syllabus</Link>
          </div>
        </div>
        <div className="resume-r">
          <div>
            <div className="mono">Up next this week</div>
            <h4>Peer review: two submissions</h4>
            <p style={{ color: "#A9B6D0", fontSize: 13.5, margin: "4px 0 0" }}>
              Opens once you finish Module 3. Reviews close Friday 17:00 EAT.
            </p>
          </div>
          <div>
            <div className="mono" style={{ marginBottom: 8 }}>Certificate track</div>
            <CornerstoneWall
              rows={[
                ["done", "done", "done", "empty"],
                ["empty", "empty", "empty", "empty"],
              ]}
            />
            <p style={{ color: "#A9B6D0", fontSize: 13, margin: "10px 0 0" }}>3 of 7 requirements met</p>
          </div>
        </div>
      </section>

      <div className="grid3">
        <div className="cla-card stat"><small>Learning time this month</small><b>11h 40m</b></div>
        <div className="cla-card stat"><small>Assessments passed</small><b>8 / 10</b></div>
        <div className="cla-card stat"><small>Cohort rank</small><b>12th <span style={{ fontSize: 14, color: "var(--muted)" }}>of 148</span></b></div>
      </div>

      <div className="split" style={{ marginTop: 34 }}>
        <div>
          <div className="sec-head" style={{ marginTop: 0 }}>
            <h2>Your courses</h2>
            <Link className="cla-link" href="/dashboard/catalog">See all 6</Link>
          </div>
          <div className="clist">
            {ENROLLED.map((c) => (
              <article key={c.title} className="cla-card crow">
                <div className={`thumb${c.thumb === "b" ? " b" : c.thumb === "c" ? " c" : ""}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                  </svg>
                </div>
                <div className="meta">
                  <h4>{c.title}</h4>
                  <div className="sub">{c.sub}</div>
                  <CornerstoneWall rows={c.wall} maxWidth={280} />
                </div>
                <Link href="/dashboard/course" className={`cla-btn${c.primary ? " primary" : ""}`}>
                  {c.primary ? "Resume" : c.thumb === "c" ? "Start" : "Resume"}
                </Link>
              </article>
            ))}
          </div>
        </div>

        <aside className="side">
          <div className="cla-card">
            <div className="mono eyebrow" style={{ marginBottom: 10 }}>Due soon</div>
            <div className="due"><div className="when"><b>23</b><small>Jul</small></div><div><p>Quiz — Indicator design</p><span>MEL &amp; Data Analysis</span></div></div>
            <div className="due"><div className="when"><b>25</b><small>Jul</small></div><div><p>Peer reviews (2)</p><span>Applied AI for Programmes</span></div></div>
            <div className="due"><div className="when"><b>29</b><small>Jul</small></div><div><p>Live clinic, 15:00 EAT</p><span>With Dr. A. Wanjiru</span></div></div>
          </div>
          <div className="cla-card cert">
            <span className="cla-pill amber">Certificate</span>
            <h4>Applied AI Practitioner</h4>
            <p>Finish Module 4, pass the capstone review, and log 20 practice hours to qualify.</p>
            <button type="button" className="cla-btn">See requirements</button>
          </div>
          <div className="cla-card">
            <div className="mono eyebrow" style={{ marginBottom: 8 }}>Recommended next</div>
            <h4 style={{ fontSize: 15, marginBottom: 4 }}>Data Storytelling for Non-Analysts</h4>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 12px" }}>Pairs with the analysis work in your MEL course.</p>
            <Link href="/dashboard/catalog" className="cla-btn" style={{ width: "100%", textAlign: "center", display: "block" }}>Preview course</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
