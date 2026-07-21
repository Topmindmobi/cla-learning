"use client";

import Link from "next/link";
import { useState } from "react";

const MODULES = [
  {
    title: "1. Foundations",
    count: "4/4",
    lessons: [
      { label: "What these tools actually do", done: true },
      { label: "Where they fail", done: true },
    ],
  },
  {
    title: "2. Working with text",
    count: "6/6",
    lessons: [
      { label: "Summarising field reports", done: true },
      { label: "Checking a summary you didn't write", done: true },
    ],
  },
  {
    title: "3. Data collection",
    count: "3/7",
    lessons: [
      { label: "Framing the task", done: true },
      { label: "Designing prompts for field data · 12 min", active: true },
      { label: "Handling missing responses", done: false },
      { label: "Practice: rebuild a survey codebook", done: false },
    ],
  },
  {
    title: "4. Capstone",
    count: "0/5",
    lessons: [
      { label: "Brief and rubric", done: false },
      { label: "Peer review", done: false },
    ],
  },
];

export default function StudentCoursePage() {
  const [tab, setTab] = useState("Overview");

  return (
    <div className="wrap">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Link href="/dashboard" className="cla-btn ghost" style={{ paddingLeft: 0 }}>← Dashboard</Link>
        <span className="cla-pill brand">62% complete</span>
      </div>
      <h1 style={{ fontSize: 26, marginBottom: 22 }}>Applied AI for Development Programmes</h1>

      <div className="player">
        <div className="cla-card outline">
          {MODULES.map((mod) => (
            <div key={mod.title} className="mod">
              <div className="t">{mod.title} <small>{mod.count}</small></div>
              {mod.lessons.map((les) => (
                <div key={les.label} className={`les${les.active ? " active" : ""}`}>
                  <span className={`tick${les.done ? " done" : ""}`}>
                    {les.done && (
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1.5 5.2l2.3 2.3L8.5 2.8" />
                      </svg>
                    )}
                  </span>
                  {les.label}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div>
          <div className="stage">
            <div className="play">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M6 3.5l11 6.5-11 6.5z" /></svg>
            </div>
            <div className="scrub"><i /></div>
          </div>
          <div className="tabs" role="tablist">
            {["Overview", "Transcript", "Notes", "Discussion (14)", "Downloads"].map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "Overview" && (
            <div className="prose">
              <h3>Designing prompts for field data collection</h3>
              <p>
                Enumerators send back messy text: partial answers, mixed languages, notes in the margins.
                This lesson covers how to write an instruction that turns that into a clean row of data —
                and how to spot when it has quietly guessed.
              </p>
              <ul>
                <li>Write the output format before you write the instruction</li>
                <li>Give two worked examples, including one that should fail</li>
                <li>Ask for a confidence flag on every extracted field</li>
                <li>Spot-check 10% by hand before you trust the batch</li>
              </ul>
              <p style={{ marginTop: 18 }}>
                <span className="cla-pill moss">Practice file</span>{" "}
                <span className="cla-pill">Kakuma enumerator notes (CSV, 240 rows)</span>
              </p>
            </div>
          )}
          <div className="navrow">
            <button type="button" className="cla-btn">← Framing the task</button>
            <button type="button" className="cla-btn primary">Mark complete and continue →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
