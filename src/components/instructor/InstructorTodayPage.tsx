const MARKING_QUEUE = [
  { ini: "EM", title: "Case study 3 — Supplier appraisal", sub: "E. Mukamana · CIPS L4 weekend", age: "6 days", late: true },
  { ini: "JK", title: "Case study 3 — Supplier appraisal", sub: "J. Kayitesi · CIPS L4 weekend", age: "6 days", late: true },
  { ini: "PB", title: "Quiz — Contract terms (resit)", sub: "P. Byiringiro · CIPS L4 weekend", age: "3 days", late: false },
  { ini: "CN", title: "Written task 2 — Category plan", sub: "C. Niyibizi · CIPS L5 evening", age: "2 days", late: false },
];

const SCHEDULE = [
  { when: "Today · 17:30", title: "CIPS L4 — Contract law", sub: "Weekend cohort · 28 registered", now: true },
  { when: "Today · 20:30", title: "CIPS L4 — Tutorial", sub: "Optional clinic · 12 signed up", now: false },
  { when: "Wed · 18:00", title: "CIPS L5 — Category strategy", sub: "Evening cohort · 22 registered", now: false },
  { when: "Thu · 18:00", title: "CIPS L4 — Mock debrief", sub: "Bring marked scripts", now: false },
];

export default function InstructorTodayPage() {
  return (
    <>
      <div className="topbar">
        <div className="crumbs">Teach / <b>Today</b></div>
        <div className="right">
          <button type="button" className="cla-btn">Take attendance</button>
          <button type="button" className="cla-btn primary">Start session</button>
        </div>
      </div>
      <div className="content">
        <div className="pagehead">
          <div>
            <h1>Good afternoon, Alain — <em>two classes tonight</em></h1>
            <p>Tuesday, 21 July · 23 submissions waiting, oldest is 6 days old.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="cla-btn">Post an announcement</button>
            <button type="button" className="cla-btn dark">Mark submissions</button>
          </div>
        </div>

        <section className="cla-card next">
          <div className="next-l">
            <span className="cla-pill brand"><i className="dotm" /> Next class</span>
            <div className="countdown"><b className="num">2h 14m</b><span style={{ color: "var(--muted)" }}>until 17:30 EAT</span></div>
            <h3>CIPS Level 4 — Contract law basics</h3>
            <p className="sub">Weekend cohort · Module 3, Lesson 2 · 90 minutes · online</p>
            <div className="prep">
              <span className="ok">✓ Slides uploaded</span>
              <span className="ok">✓ Room link live</span>
              <span className="todo">Poll not set up</span>
              <span className="todo">Last week&apos;s quiz unmarked (11)</span>
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <button type="button" className="cla-btn primary">Open classroom</button>
              <button type="button" className="cla-btn">Review lesson plan</button>
              <button type="button" className="cla-btn">Message the cohort</button>
            </div>
          </div>
          <div className="next-r">
            <div className="mono" style={{ marginBottom: 12 }}>Who&apos;s coming</div>
            <div className="rline"><span>Registered</span><b>28 of 30</b></div>
            <div className="rline"><span>Attended last week</span><b>24</b></div>
            <div className="rline"><span>Missed 2+ in a row</span><b style={{ color: "#FFB4A8" }}>5</b></div>
            <div className="rline"><span>Behind on module 2</span><b style={{ color: "#FFD98A" }}>7</b></div>
            <button type="button" className="cla-btn" style={{ width: "100%", marginTop: 16, background: "#fff", borderColor: "#fff" }}>See the class list</button>
          </div>
        </section>

        <div className="kpis">
          {[
            { label: "Students you teach", value: "96", trend: "across 4 cohorts", flat: true },
            { label: "Average attendance", value: "84%", trend: "↓ 5 pts this month", up: false },
            { label: "Last mock average", value: "58%", trend: "↑ 6 pts vs previous", up: true },
            { label: "Marking turnaround", value: "4.2 days", trend: "target is 3", up: false },
          ].map((k) => (
            <div key={k.label} className="cla-card kpi">
              <small>{k.label}</small>
              <b className="num">{k.value}</b>
              <span className={`trend ${k.flat ? "flat" : k.up ? "up" : "down"}`}>{k.trend}</span>
            </div>
          ))}
        </div>

        <section className="cla-card panel" style={{ marginBottom: 18 }}>
          <div className="ph"><div><h3>This week</h3><small>Your sessions, EAT</small></div><button type="button" className="cla-btn sm">Full timetable</button></div>
          <div className="sched">
            {SCHEDULE.map((s) => (
              <div key={s.when} className={`slot${s.now ? " now" : ""}`}>
                <span className="mono">{s.when}</span>
                <h4>{s.title}</h4>
                <small>{s.sub}</small>
              </div>
            ))}
          </div>
        </section>

        <div className="cols">
          <div>
            <section className="cla-card panel">
              <div className="ph"><div><h3>Marking queue</h3><small>Oldest first · 23 waiting</small></div><button type="button" className="cla-btn sm">Mark in sequence</button></div>
              {MARKING_QUEUE.map((m) => (
                <div key={m.ini + m.title} className="gq">
                  <div className="ini">{m.ini}</div>
                  <div className="meta"><p>{m.title}</p><span>{m.sub}</span></div>
                  <span className={`age${m.late ? " late" : ""}`}>{m.age}</span>
                  <button type="button" className="cla-btn sm">Mark</button>
                </div>
              ))}
            </section>
          </div>
          <div>
            <section className="cla-card panel">
              <div className="ph"><div><h3>Student messages</h3></div><span className="cla-pill brand">5 new</span></div>
              <div className="gq">
                <div className="ini">EM</div>
                <div className="meta"><p>E. Mukamana</p><span>&ldquo;I&apos;ve missed three Saturdays because of work travel. Can I catch up?&rdquo;</span></div>
              </div>
              <div style={{ padding: "12px 18px" }}><button type="button" className="cla-btn sm" style={{ width: "100%" }}>Open inbox</button></div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
