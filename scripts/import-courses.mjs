#!/usr/bin/env node
/**
 * Import course catalog into Supabase.
 *
 * Sources (in order):
 *   1. Live Base44 API (if BASE44_APP_ID + BASE44_APP_BASE_URL are set)
 *   2. scripts/data/courses.seed.json (from Base44 AdminTimetable + marketing pages)
 *
 * Usage:
 *   npm run import:courses
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const seedPath = join(root, "scripts/data/courses.seed.json");
const migrationPath = join(root, "supabase/migrations/002_course_slug_and_seed.sql");

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error("Missing .env.local — run: npm run setup:cloud");
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

function titleToSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function mapBase44Course(row) {
  const category = row.category || "professional_courses";
  const validCategories = new Set([
    "professional_courses", "consulting", "training_development", "short_term_courses",
    "research_surveys", "finance", "management", "technology",
  ]);
  return {
    slug: row.slug || titleToSlug(row.title),
    title: row.title,
    subtitle: row.subtitle ?? null,
    short_description: row.short_description ?? row.description ?? null,
    full_description: row.full_description ?? row.description ?? null,
    category: validCategories.has(category) ? category : "professional_courses",
    difficulty: row.difficulty || "beginner",
    instructor_name: row.instructor_name ?? null,
    instructor_title: row.instructor_title ?? null,
    price: Number(row.price ?? 0),
    currency: row.currency || "RWF",
    language: row.language || "English",
    tags: Array.isArray(row.tags) ? row.tags : [],
    is_published: row.is_published !== false,
    is_featured: row.is_featured === true,
    average_rating: Number(row.average_rating ?? 0),
    enrollment_count: Number(row.enrollment_count ?? 0),
    rating_count: Number(row.rating_count ?? 0),
  };
}

async function fetchBase44Courses(env) {
  const appId = env.BASE44_APP_ID || "6a5f189a194ad915ba223b83";
  const baseUrl = (env.BASE44_APP_BASE_URL || "https://cornerstone-luthien-advisory-cop-ba223b83.base44.app").replace(/\/$/, "");
  const apiBase = `${baseUrl}/api/apps/${appId}/entities`;

  const endpoints = [
    ["Course", encodeURIComponent(JSON.stringify({ is_published: true }))],
    ["LMSCourse", encodeURIComponent(JSON.stringify({ status: "published" }))],
  ];

  const rows = [];
  for (const [entity, q] of endpoints) {
    try {
      const res = await fetch(`${apiBase}/${entity}?q=${q}`, { headers: { Accept: "application/json" } });
      if (!res.ok) continue;
      const data = await res.json();
      if (!Array.isArray(data)) continue;
      for (const item of data) {
        if (entity === "LMSCourse") {
          rows.push(mapBase44Course({
            title: item.title,
            subtitle: item.code,
            short_description: item.description,
            full_description: item.description,
            category: "professional_courses",
            difficulty: "intermediate",
            tags: [item.code].filter(Boolean),
            is_published: true,
            slug: titleToSlug(item.code || item.title),
          }));
        } else {
          rows.push(mapBase44Course(item));
        }
      }
    } catch {
      /* ignore — fall back to seed file */
    }
  }
  return rows;
}

function loadSeedCourses() {
  return JSON.parse(readFileSync(seedPath, "utf8")).map(mapBase44Course);
}

async function ensureSlugColumn(supabase) {
  const { error } = await supabase.from("courses").select("slug").limit(1);
  if (error?.message?.includes("slug")) {
    console.log("⚠ slug column missing — run supabase/migrations/002_course_slug_and_seed.sql in SQL Editor first");
    console.log("  Or paste the migration file contents and execute.");
    process.exit(1);
  }
}

async function upsertCourses(supabase, courses) {
  const bySlug = new Map();
  for (const c of courses) {
    if (c.slug && c.title) bySlug.set(c.slug, c);
  }
  const unique = [...bySlug.values()];
  let inserted = 0;
  let updated = 0;
  let failed = 0;

  for (const course of unique) {
    const { data: existing } = await supabase.from("courses").select("id").eq("slug", course.slug).maybeSingle();
    if (existing) {
      const { error } = await supabase.from("courses").update({ ...course, updated_at: new Date().toISOString() }).eq("slug", course.slug);
      if (error) {
        console.error("✗ update", course.slug, error.message);
        failed++;
      } else {
        updated++;
      }
    } else {
      const { error } = await supabase.from("courses").insert(course);
      if (error) {
        console.error("✗ insert", course.slug, error.message);
        failed++;
      } else {
        inserted++;
      }
    }
  }
  return { inserted, updated, failed, total: unique.length };
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || serviceKey.includes("your_")) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const { createServiceClient } = await import("./lib/supabase-admin.mjs");
  const supabase = createServiceClient(url, serviceKey);

  await ensureSlugColumn(supabase);

  console.log("Fetching courses from Base44 (if available)…");
  const base44Courses = await fetchBase44Courses(env);
  const seedCourses = loadSeedCourses();

  const merged = [...seedCourses, ...base44Courses];
  console.log(`Seed file: ${seedCourses.length} courses`);
  console.log(`Base44 API: ${base44Courses.length} courses`);
  console.log(`Importing ${new Set(merged.map((c) => c.slug)).size} unique courses…\n`);

  const result = await upsertCourses(supabase, merged);

  console.log(`\n✓ Done — ${result.inserted} inserted, ${result.updated} updated, ${result.failed} failed (${result.total} total)`);

  const { count } = await supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true);
  console.log(`✓ ${count ?? "?"} published courses now in Supabase`);

  if (result.failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
