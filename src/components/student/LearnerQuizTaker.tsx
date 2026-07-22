"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import {
  submitQuizAttempt,
  type LearnerActionState,
} from "@/app/(student)/dashboard/learner-actions";
import type { LearnerQuizQuestion } from "@/lib/student/quizzes";

type Props = {
  quizId: string;
  title: string;
  description: string | null;
  passingScore: number;
  timeLimitMinutes: number | null;
  questions: LearnerQuizQuestion[];
  attemptCount: number;
  bestScore: number | null;
  canAttempt: boolean;
  allowRetake: boolean;
  maxAttempts: number | null;
  blockReason?: string;
};

export default function LearnerQuizTaker({
  quizId,
  title,
  description,
  passingScore,
  timeLimitMinutes,
  questions,
  attemptCount,
  bestScore,
  canAttempt,
  allowRetake,
  maxAttempts,
  blockReason,
}: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(
    timeLimitMinutes ? timeLimitMinutes * 60 : null,
  );
  const [state, action, pending] = useActionState(submitQuizAttempt, {} as LearnerActionState);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const current = questions[index];
  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id]).length,
    [questions, answers],
  );

  useEffect(() => {
    if (secondsLeft == null || state.result || !canAttempt) return;
    if (secondsLeft <= 0) {
      if (!autoSubmitted) {
        setAutoSubmitted(true);
        const form = document.getElementById("quiz-submit-form") as HTMLFormElement | null;
        form?.requestSubmit();
      }
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s == null ? s : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, state.result, canAttempt, autoSubmitted]);

  function formatTime(total: number) {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  if (state.result) {
    const r = state.result;
    const nextAttempts = r.attempt_number;
    const canRetake =
      allowRetake && (maxAttempts == null || nextAttempts < maxAttempts);
    return (
      <div className="wrap">
        <Link href="/dashboard/quizzes" className="cla-btn ghost" style={{ paddingLeft: 0 }}>
          ← My quizzes
        </Link>
        <div className="cla-card" style={{ marginTop: 16, padding: 24, maxWidth: 720 }}>
          <span className={`cla-pill ${r.is_passed ? "moss" : "amber"}`}>
            {r.is_passed ? "Passed" : "Not yet passed"}
          </span>
          <h1 style={{ fontSize: 28, margin: "12px 0 6px" }}>{title}</h1>
          <p style={{ color: "var(--muted)", margin: "0 0 18px" }}>
            Attempt {r.attempt_number} · {r.correct_count}/{r.total_questions} correct
          </p>
          <div className="meter" style={{ marginBottom: 22 }}>
            <b>{r.score_percent}%</b>
            <span className="eyebrow">pass mark {passingScore}%</span>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            {questions.map((q) => {
              const g = r.graded.find((x) => x.question_id === q.id);
              return (
                <div
                  key={q.id}
                  style={{
                    borderTop: "1px solid var(--line)",
                    paddingTop: 14,
                  }}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span className={`cla-pill ${g?.is_correct ? "moss" : "amber"}`} style={{ fontSize: 11 }}>
                      {g?.is_correct ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 8px", fontWeight: 600 }}>{q.question_text}</p>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "var(--ink2)", fontSize: 14 }}>
                    {q.options.map((o) => {
                      const isSelected = g?.selected === o.id;
                      const isCorrect = g?.correct_option_id === o.id;
                      return (
                        <li
                          key={o.id}
                          style={{
                            margin: "4px 0",
                            fontWeight: isCorrect || isSelected ? 600 : 400,
                            color: isCorrect
                              ? "var(--moss)"
                              : isSelected
                                ? "var(--amber)"
                                : undefined,
                          }}
                        >
                          {o.id}. {o.text}
                          {isCorrect ? " · answer" : ""}
                          {isSelected && !isCorrect ? " · your pick" : ""}
                        </li>
                      );
                    })}
                  </ul>
                  {g?.explanation ? (
                    <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--muted)" }}>
                      {g.explanation}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/dashboard/quizzes" className="cla-btn">
              Back to quizzes
            </Link>
            {canRetake ? (
              <a href={`/dashboard/quizzes/${quizId}`} className="cla-btn primary">
                Retake
              </a>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <Link href="/dashboard/quizzes" className="cla-btn ghost" style={{ paddingLeft: 0 }}>
          ← My quizzes
        </Link>
        <span className="cla-pill">Pass {passingScore}%</span>
        {bestScore != null ? <span className="cla-pill moss">Best {bestScore}%</span> : null}
        {attemptCount > 0 ? <span className="cla-pill">Attempts {attemptCount}</span> : null}
        {secondsLeft != null ? (
          <span className={`cla-pill ${secondsLeft < 60 ? "amber" : ""}`}>
            {formatTime(secondsLeft)}
          </span>
        ) : null}
      </div>

      <h1 style={{ fontSize: 26, marginBottom: 8 }}>{title}</h1>
      {description ? (
        <p style={{ color: "var(--muted)", marginTop: 0, maxWidth: "56ch" }}>{description}</p>
      ) : null}

      {!canAttempt ? (
        <div className="cla-card" style={{ padding: 24, marginTop: 16 }}>
          <p style={{ margin: 0 }}>{blockReason ?? "You cannot take this quiz right now."}</p>
        </div>
      ) : (
        <form id="quiz-submit-form" action={action} className="quiz-take">
          <input type="hidden" name="quiz_id" value={quizId} />
          {questions.map((q) => (
            <input key={q.id} type="hidden" name={`answer_${q.id}`} value={answers[q.id] ?? ""} />
          ))}

          <div className="cla-card" style={{ padding: 22, marginTop: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              <span className="mono eyebrow">
                Question {index + 1} of {questions.length}
              </span>
              <span className="mono eyebrow">
                Answered {answeredCount}/{questions.length}
              </span>
            </div>

            <div className="quiz-nav-dots" style={{ marginBottom: 18 }}>
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  type="button"
                  className={`quiz-dot${i === index ? " active" : ""}${answers[q.id] ? " filled" : ""}`}
                  onClick={() => setIndex(i)}
                  aria-label={`Question ${i + 1}`}
                />
              ))}
            </div>

            {current ? (
              <>
                <h2 style={{ fontSize: 18, margin: "0 0 16px", lineHeight: 1.4 }}>
                  {current.question_text}
                </h2>
                <div className="quiz-options">
                  {current.options.map((o) => {
                    const selected = answers[current.id] === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        className={`quiz-option${selected ? " selected" : ""}`}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [current.id]: o.id }))
                        }
                      >
                        <span className="quiz-option-key">{o.id}</span>
                        <span>{o.text}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : null}

            {state.error ? (
              <p style={{ marginTop: 14, color: "var(--danger, #b42318)", fontSize: 13 }}>
                {state.error}
              </p>
            ) : null}

            <div className="navrow" style={{ marginTop: 22 }}>
              <button
                type="button"
                className="cla-btn"
                disabled={index === 0}
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
              >
                ← Previous
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                {index < questions.length - 1 ? (
                  <button
                    type="button"
                    className="cla-btn primary"
                    onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
                  >
                    Next →
                  </button>
                ) : (
                  <button type="submit" className="cla-btn primary" disabled={pending}>
                    {pending ? "Submitting…" : "Submit quiz"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
