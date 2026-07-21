const FLAGGED_STUDENTS = [
  { ini: "EM", name: "E. Mukamana", id: "CLA-2291 · Kigali evening", programme: "CIPS Level 4", progress: 22, flag: "No login 21 days", flagClass: "rose", action: "Contact" },
  { ini: "JN", name: "J. Niyonzima", id: "CLA-2188 · Weekend", programme: "ACCA Applied Skills", progress: 54, flag: "Mock below 40%", flagClass: "amber", action: "Assign tutor" },
  { ini: "AK", name: "A. Keza", id: "CLA-2410 · Online", programme: "CIPS Level 5", progress: 61, flag: "RWF 120,000 overdue", flagClass: "rose", action: "Send reminder" },
  { ini: "DO", name: "D. Okello", id: "CLA-2302 · Juba online", programme: "PMP Prep", progress: 15, flag: "Missed 4 sessions", flagClass: "rose", action: "Contact" },
  { ini: "MU", name: "M. Uwase", id: "CLA-2377 · Kigali evening", programme: "ACCA Applied Knowledge", progress: 48, flag: "Assignment 6 days late", flagClass: "amber", action: "Nudge" },
];

export default function AdminTodayPage() {
  return (
    <>
      <div className="topbar">
        <div className="crumbs">Admin / <b>Today</b></div>
        <div className="right">
          <button type="button" className="cla-btn">Export</button>
          <button type="button" className="cla-btn primary">+ Enrol student</button>
          <div className="avatar">FK</div>
        </div>
      </div>
      <div className="content">
        <div className="pagehead">
          <div>
            <h1>Tuesday, 21 July</h1>
            <p>August intake closes in 14 days. Three things need a decision today.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="chip" aria-pressed="true">All programmes</button>
            <button type="button" className="chip" aria-pressed="false">CIPS</button>
            <button type="button" className="chip" aria-pressed="false">ACCA</button>
            <button type="button" className="chip" aria-pressed="false">Short courses</button>
          </div>
        </div>

        <div className="attention">
          <span className="cla-pill amber"><i className="dotm" /> Needs you</span>
          <b>18 payments overdue by more than 14 days</b>
          <span>· RWF 1.42M outstanding across 3 cohorts</span>
          <button type="button" className="cla-btn sm">Review and send reminders</button>
        </div>

        <div className="kpis">
          {[
            { label: "Active students", value: "2,041", trend: "↑ 148 this intake", up: true },
            { label: "Collected this month", value: "RWF 8.6M", trend: "↑ 12% vs June", up: true },
            { label: "Attendance, last 7 days", value: "81%", trend: "↓ 6 pts vs last week", up: false },
            { label: "Exam-ready, Sept sitting", value: "64%", trend: "↑ 9 pts since mocks", up: true },
          ].map((kpi) => (
            <div key={kpi.label} className="cla-card kpi">
              <small>{kpi.label}</small>
              <b className="num">{kpi.value}</b>
              <span className={`trend ${kpi.up ? "up" : "down"}`}>{kpi.trend}</span>
            </div>
          ))}
        </div>

        <div className="cols">
          <div>
            <section className="cla-card panel" style={{ marginBottom: 18 }}>
              <div className="ph">
                <div><h3>Students who need attention</h3><small>No login in 14+ days, failing mocks, or behind on payment</small></div>
                <button type="button" className="cla-btn sm">Open full list</button>
              </div>
              <div className="tools">
                <input placeholder="Search by name, email or student ID" />
                <button type="button" className="chip" aria-pressed="true">All flags</button>
                <button type="button" className="chip" aria-pressed="false">Inactive</button>
                <button type="button" className="chip" aria-pressed="false">Failing mocks</button>
                <button type="button" className="chip" aria-pressed="false">Payment overdue</button>
              </div>
              <table>
                <thead><tr><th>Student</th><th>Programme</th><th>Progress</th><th>Flag</th><th></th></tr></thead>
                <tbody>
                  {FLAGGED_STUDENTS.map((s) => (
                    <tr key={s.ini}>
                      <td><div className="who"><div className="ini">{s.ini}</div><div><p>{s.name}</p><span>{s.id}</span></div></div></td>
                      <td>{s.programme}</td>
                      <td>
                        <div className={`prog-bar ${s.progress < 30 ? "risk" : s.progress < 60 ? "low" : ""}`}><i style={{ width: `${s.progress}%` }} /></div>
                        <span style={{ color: "var(--muted)", fontSize: 12 }}>{s.progress}%</span>
                      </td>
                      <td><span className={`cla-pill ${s.flagClass}`}><i className="dotm" /> {s.flag}</span></td>
                      <td style={{ textAlign: "right" }}><button type="button" className="cla-btn sm">{s.action}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="tfoot"><span>Showing 5 of 37 flagged students</span><span>Sorted by risk score</span></div>
            </section>
          </div>
          <div>
            <section className="cla-card panel" style={{ marginBottom: 18 }}>
              <div className="ph"><div><h3>Decisions waiting</h3></div><span className="cla-pill brand">3</span></div>
              <div className="todo">
                <div className="ic" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}>!</div>
                <div><p>CIPS Level 4 weekend cohort is over capacity</p><span>34 enrolled, 30 seats. Open a second group or raise the cap.</span></div>
                <button type="button" className="cla-btn sm">Decide</button>
              </div>
              <div className="todo">
                <div className="ic" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>✓</div>
                <div><p>7 refund requests from the July intake</p><span>Oldest has been waiting 5 days.</span></div>
                <button type="button" className="cla-btn sm">Review</button>
              </div>
              <div className="todo">
                <div className="ic" style={{ background: "var(--rose-soft)", color: "var(--rose)" }}>!</div>
                <div><p>ACCA Applied Skills has no tutor for 26 July</p><span>Session is published to 41 students.</span></div>
                <button type="button" className="cla-btn sm">Assign</button>
              </div>
            </section>
            <section className="cla-card panel">
              <div className="ph"><div><h3>Today&apos;s live sessions</h3><small>All times EAT</small></div></div>
              <div className="todo">
                <div className="ic" style={{ background: "var(--wash)", fontSize: 11, fontWeight: 600 }}>17:30</div>
                <div><p>CIPS L4 — Contract law basics</p><span>A. Nsengiyumva · 28 registered · room ready</span></div>
                <button type="button" className="cla-btn sm">Open</button>
              </div>
              <div className="todo">
                <div className="ic" style={{ background: "var(--rose-soft)", color: "var(--rose)", fontSize: 11, fontWeight: 600 }}>20:30</div>
                <div><p>PMP — Risk register workshop</p><span>No tutor assigned · 19 registered</span></div>
                <button type="button" className="cla-btn sm">Assign</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
