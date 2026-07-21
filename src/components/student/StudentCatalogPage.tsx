import Link from "next/link";
import { ClaLogo } from "@/components/brand/ClaLogo";

const COURSES = [
  { t: "Applied AI for Development Programmes", d: "Turn everyday programme documents into decisions you can defend.", tag: "AI & digital", h: "6h 10m", lv: "Intermediate", r: "4.8", n: "1,204", c: "#1F4FD8" },
  { t: "Monitoring, Evaluation and Data Analysis", d: "Indicator design through to a dashboard your board will read.", tag: "MEL", h: "8h 45m", lv: "Intermediate", r: "4.7", n: "932", c: "#0E7A5F" },
  { t: "Governance and Board Effectiveness", d: "What a board owes the organisation, and how to run the meeting.", tag: "Governance", h: "3h 20m", lv: "Beginner", r: "4.6", n: "411", c: "#7A4B12" },
  { t: "Proposal Writing for Institutional Donors", d: "Logframes, budgets and the narrative that holds them together.", tag: "Finance", h: "5h 30m", lv: "Intermediate", r: "4.9", n: "1,780", c: "#2C3852" },
  { t: "Data Storytelling for Non-Analysts", d: "Choose the chart, cut the clutter, land the point in one slide.", tag: "MEL", h: "2h 50m", lv: "Beginner", r: "4.8", n: "654", c: "#155E75" },
  { t: "Facilitating Workshops that Decide Things", d: "Agenda design, difficult rooms, and getting to a written outcome.", tag: "Facilitation", h: "4h 05m", lv: "Beginner", r: "4.7", n: "388", c: "#6B21A8" },
];

export default function StudentCatalogPage() {
  return (
    <div className="wrap">
      <div className="cat-head">
        <div>
          <div className="mono eyebrow">Catalog</div>
          <h1>
            Build the practice, <span className="serif" style={{ fontStyle: "italic" }}>course by course</span>
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: "52ch", margin: "8px 0 0" }}>
            Short, applied programmes for advisory, development and public-sector teams. Every course ends in something you can use at work on Monday.
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className="cla-pill">42 courses</span>{" "}
          <span className="cla-pill">7 certificate tracks</span>
        </div>
      </div>

      <div className="filters">
        <button type="button" className="chip" aria-pressed="true">All</button>
        <button type="button" className="chip" aria-pressed="false">AI &amp; digital</button>
        <button type="button" className="chip" aria-pressed="false">Monitoring &amp; evaluation</button>
        <button type="button" className="chip" aria-pressed="false">Governance</button>
        <button type="button" className="chip" aria-pressed="false">Finance</button>
        <button type="button" className="chip" aria-pressed="false">Facilitation</button>
      </div>

      <div className="student-grid">
        {COURSES.map((c) => (
          <Link key={c.t} href="/dashboard/course" className="cla-card ccard">
            <div className="cover" style={{ background: c.c }}>
              <span className="mono">{c.tag}</span>
              <ClaLogo size={34} />
            </div>
            <div className="body">
              <h4>{c.t}</h4>
              <p>{c.d}</p>
              <div className="foot">
                <span className="star">★ {c.r}</span>
                <span>{c.n} learners</span>
                <span style={{ marginLeft: "auto" }}>{c.h} · {c.lv}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
