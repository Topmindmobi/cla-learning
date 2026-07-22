"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  markActivityComplete,
  type LearnerActionState,
} from "@/app/(student)/dashboard/learner-actions";
import type {
  LmsActivityRow,
  LmsChapterRow,
  LmsCourseRow,
  LmsLessonRow,
  LmsModuleRow,
} from "@/lib/admin/lms";
import DiscussionPanel, { type DiscussionPost } from "@/components/student/DiscussionPanel";

type Props = {
  course: LmsCourseRow;
  modules: LmsModuleRow[];
  chapters: LmsChapterRow[];
  lessons: LmsLessonRow[];
  activities: LmsActivityRow[];
  completedActivityIds: string[];
  percent: number;
  discussionsByActivity?: Record<string, DiscussionPost[]>;
};

function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const parts = u.pathname.split("/");
      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts[embedIdx + 1]) {
        return `https://www.youtube.com/embed/${parts[embedIdx + 1]}`;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

function vimeoEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("vimeo.com")) return null;
    const id = u.pathname.split("/").filter(Boolean).pop();
    return id ? `https://player.vimeo.com/video/${id}` : null;
  } catch {
    return null;
  }
}

function VideoStage({ url }: { url: string }) {
  const yt = youtubeEmbed(url);
  const vimeo = vimeoEmbed(url);
  const embed = yt || vimeo;
  if (embed) {
    return (
      <div className="stage" style={{ padding: 0 }}>
        <iframe
          src={embed}
          title="Lesson video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: "100%", height: "100%", border: 0 }}
        />
      </div>
    );
  }
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return (
      <div className="stage" style={{ padding: 0 }}>
        <video controls src={url} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
    );
  }
  return (
    <div className="stage">
      <a href={url} target="_blank" rel="noreferrer" className="cla-btn" style={{ color: "#fff" }}>
        Open video
      </a>
    </div>
  );
}

export default function LearnerLmsPlayer({
  course,
  modules,
  chapters,
  lessons,
  activities,
  completedActivityIds,
  percent,
  discussionsByActivity = {},
}: Props) {
  const completed = useMemo(() => new Set(completedActivityIds), [completedActivityIds]);

  const flatItems = useMemo(() => {
    const items: Array<{ lesson: LmsLessonRow; activity: LmsActivityRow | null }> = [];
    for (const lesson of lessons) {
      const acts = activities.filter((a) => a.lesson_id === lesson.id);
      if (acts.length === 0) items.push({ lesson, activity: null });
      else for (const activity of acts) items.push({ lesson, activity });
    }
    return items;
  }, [lessons, activities]);

  const initialKey = useMemo(() => {
    const firstOpen = flatItems.find(
      (item) => item.activity && !completed.has(item.activity.id),
    );
    const pick = firstOpen ?? flatItems[0];
    if (!pick) return "";
    return pick.activity ? `a:${pick.activity.id}` : `l:${pick.lesson.id}`;
  }, [flatItems, completed]);

  const [selectedKey, setSelectedKey] = useState(initialKey);
  const [tab, setTab] = useState<"Overview" | "Notes">("Overview");
  const [state, action, pending] = useActionState(markActivityComplete, {} as LearnerActionState);
  const advancedForMessage = useRef<string | null>(null);

  useEffect(() => {
    if (!state.message || advancedForMessage.current === state.message) return;
    advancedForMessage.current = state.message;
    const idx = flatItems.findIndex((item) => {
      if (item.activity) return selectedKey === `a:${item.activity.id}`;
      return selectedKey === `l:${item.lesson.id}`;
    });
    const following =
      idx >= 0 && idx < flatItems.length - 1 ? flatItems[idx + 1] : null;
    if (following) {
      setSelectedKey(
        following.activity ? `a:${following.activity.id}` : `l:${following.lesson.id}`,
      );
      setTab("Overview");
    }
  }, [state.message, flatItems, selectedKey]);

  const selected = useMemo(() => {
    if (selectedKey.startsWith("a:")) {
      const id = selectedKey.slice(2);
      const activity = activities.find((a) => a.id === id) ?? null;
      const lesson = activity
        ? lessons.find((l) => l.id === activity.lesson_id) ?? null
        : null;
      return { lesson, activity };
    }
    if (selectedKey.startsWith("l:")) {
      const id = selectedKey.slice(2);
      return { lesson: lessons.find((l) => l.id === id) ?? null, activity: null };
    }
    return { lesson: null, activity: null };
  }, [selectedKey, activities, lessons]);

  const currentIndex = flatItems.findIndex((item) => {
    if (item.activity) return selectedKey === `a:${item.activity.id}`;
    return selectedKey === `l:${item.lesson.id}`;
  });
  const prev = currentIndex > 0 ? flatItems[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < flatItems.length - 1
      ? flatItems[currentIndex + 1]
      : null;

  function goTo(item: { lesson: LmsLessonRow; activity: LmsActivityRow | null }) {
    setSelectedKey(item.activity ? `a:${item.activity.id}` : `l:${item.lesson.id}`);
    setTab("Overview");
  }

  const title = selected.activity?.title ?? selected.lesson?.title ?? course.title;
  const videoUrl = selected.activity?.video_url ?? null;
  const html = selected.activity?.content_html ?? null;
  const description = selected.activity?.description ?? selected.lesson?.introduction ?? null;
  const keyNotes = selected.lesson?.key_notes ?? null;
  const objectives = selected.lesson?.learning_objectives ?? [];
  const cips = [selected.activity?.module_code, selected.activity?.lo_code, selected.activity?.ac_code]
    .filter(Boolean)
    .join(" · ");
  const isDone = selected.activity ? completed.has(selected.activity.id) : false;

  return (
    <div className="wrap">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
        <Link href="/dashboard/course" className="cla-btn ghost" style={{ paddingLeft: 0 }}>
          ← My learning
        </Link>
        <span className="cla-pill brand">{percent}% complete</span>
        {course.level != null ? <span className="cla-pill">Level {course.level}</span> : null}
        <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
          {course.code}
        </span>
      </div>
      <h1 style={{ fontSize: 26, marginBottom: 22 }}>{course.title}</h1>

      <div className="player">
        <div className="cla-card outline">
          {modules.length === 0 ? (
            <p style={{ padding: 18, color: "var(--muted)", fontSize: 14 }}>No modules published yet.</p>
          ) : (
            modules.map((mod) => {
              const modChapters = chapters.filter((c) => c.module_id === mod.id);
              const modLessons = lessons.filter((l) => l.module_id === mod.id);
              const modActs = activities.filter((a) =>
                modLessons.some((l) => l.id === a.lesson_id),
              );
              const doneCount = modActs.filter((a) => completed.has(a.id)).length;
              const totalCount = modActs.length || modLessons.length;

              return (
                <div key={mod.id} className="mod">
                  <div className="t">
                    {mod.code} · {mod.title}
                    <small>
                      {doneCount}/{totalCount}
                    </small>
                  </div>
                  {modChapters.map((ch) => (
                    <div key={ch.id}>
                      <div
                        style={{
                          padding: "6px 18px 2px",
                          fontSize: 11,
                          color: "var(--muted)",
                          fontWeight: 600,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {ch.code} — {ch.title}
                      </div>
                      {lessons
                        .filter((l) => l.chapter_id === ch.id)
                        .map((lesson) => {
                          const acts = activities.filter((a) => a.lesson_id === lesson.id);
                          if (acts.length === 0) {
                            const key = `l:${lesson.id}`;
                            return (
                              <button
                                key={lesson.id}
                                type="button"
                                className={`les${selectedKey === key ? " active" : ""}`}
                                onClick={() => {
                                  setSelectedKey(key);
                                  setTab("Overview");
                                }}
                                style={{ width: "100%", border: 0, background: "transparent", textAlign: "left" }}
                              >
                                <span className="tick" />
                                {lesson.title}
                              </button>
                            );
                          }
                          return acts.map((act) => {
                            const key = `a:${act.id}`;
                            const done = completed.has(act.id);
                            return (
                              <button
                                key={act.id}
                                type="button"
                                className={`les${selectedKey === key ? " active" : ""}`}
                                onClick={() => {
                                  setSelectedKey(key);
                                  setTab("Overview");
                                }}
                                style={{ width: "100%", border: 0, background: "transparent", textAlign: "left" }}
                              >
                                <span className={`tick${done ? " done" : ""}`}>
                                  {done ? (
                                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M1.5 5.2l2.3 2.3L8.5 2.8" />
                                    </svg>
                                  ) : null}
                                </span>
                                {act.title}
                                {act.estimated_duration_minutes ? (
                                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)" }}>
                                    {act.estimated_duration_minutes}m
                                  </span>
                                ) : null}
                              </button>
                            );
                          });
                        })}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>

        <div>
          {videoUrl ? (
            <VideoStage url={videoUrl} />
          ) : (
            <div className="stage">
              <div className="play" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 3.5l11 6.5-11 6.5z" />
                </svg>
              </div>
              <div className="scrub">
                <i style={{ width: `${Math.max(percent, 4)}%` }} />
              </div>
            </div>
          )}

          <div className="tabs" role="tablist">
            {(["Overview", "Notes"] as const).map((t) => (
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

          {tab === "Overview" ? (
            <div className="prose">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                {selected.activity ? (
                  <span className="cla-pill">{selected.activity.activity_type}</span>
                ) : selected.lesson ? (
                  <span className="cla-pill">{selected.lesson.lesson_type}</span>
                ) : null}
                {cips ? <span className="cla-pill moss mono">{cips}</span> : null}
                {isDone ? <span className="cla-pill moss">Complete</span> : null}
              </div>
              <h3>{title}</h3>
              {description ? <p style={{ whiteSpace: "pre-wrap" }}>{description}</p> : null}
              {html ? (
                <div
                  style={{ marginTop: 12 }}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ) : null}
              {Array.isArray(objectives) && objectives.length > 0 ? (
                <>
                  <h3 style={{ marginTop: 18, fontSize: 16 }}>Learning objectives</h3>
                  <ul>
                    {objectives.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              <p style={{ marginTop: 18, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {selected.activity?.file_url ? (
                  <a href={selected.activity.file_url} target="_blank" rel="noreferrer" className="cla-pill moss">
                    Download file
                  </a>
                ) : null}
                {selected.activity?.external_link ? (
                  <a href={selected.activity.external_link} target="_blank" rel="noreferrer" className="cla-pill">
                    External resource
                  </a>
                ) : null}
              </p>
              {selected.activity?.activity_type === "discussion" ? (
                <DiscussionPanel
                  activityId={selected.activity.id}
                  courseId={course.id}
                  posts={(discussionsByActivity[selected.activity.id] ?? []).map((p) => ({
                    id: p.id,
                    author_name: p.author_name,
                    author_email: p.author_email,
                    body: p.body,
                    created_at: p.created_at,
                  }))}
                  prompt={selected.activity.description}
                />
              ) : null}
            </div>
          ) : (
            <div className="prose">
              <h3>Key notes</h3>
              {keyNotes ? (
                <p style={{ whiteSpace: "pre-wrap" }}>{keyNotes}</p>
              ) : (
                <p style={{ color: "var(--muted)" }}>No notes for this lesson yet.</p>
              )}
            </div>
          )}

          {(state.message || state.error) && (
            <p style={{ marginTop: 12, fontSize: 13, color: state.error ? "var(--danger, #b42318)" : "var(--moss)" }}>
              {state.error ?? (state.message?.startsWith("Marked complete") ? "Marked complete." : state.message)}
            </p>
          )}

          <div className="navrow">
            <button
              type="button"
              className="cla-btn"
              disabled={!prev}
              onClick={() => prev && goTo(prev)}
            >
              ← {prev ? (prev.activity?.title ?? prev.lesson.title) : "Previous"}
            </button>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {selected.activity && !isDone ? (
                <form action={action}>
                  <input type="hidden" name="activity_id" value={selected.activity.id} />
                  <input type="hidden" name="course_id" value={course.id} />
                  <button type="submit" className="cla-btn primary" disabled={pending}>
                    {pending ? "Saving…" : "Mark complete and continue →"}
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="cla-btn primary"
                  disabled={!next}
                  onClick={() => next && goTo(next)}
                >
                  {next ? "Continue →" : "End of programme"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
