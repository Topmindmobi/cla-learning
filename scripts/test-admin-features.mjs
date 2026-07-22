#!/usr/bin/env node
/**
 * Verify demo data covers every admin feature (data-layer smoke tests).
 *
 * Usage:
 *   npm run test:admin
 *
 * Optional live site check:
 *   BASE_URL=https://cla-learning.onrender.com npm run test:admin
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { createServiceClient } from "./lib/supabase-admin.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const BASE_URL = (process.env.BASE_URL || "").replace(/\/$/, "");

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error("Missing .env.local");
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function count(supabase, table, filter) {
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count: n, error } = await q;
  if (error) throw error;
  return n ?? 0;
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  assert(url && key, "Need Supabase URL + SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createServiceClient(url, key);

  const results = [];
  async function check(feature, route, fn) {
    try {
      const detail = await fn();
      results.push({ feature, route, ok: true, detail });
      console.log(`✓ ${feature.padEnd(14)} ${route.padEnd(22)} ${detail}`);
    } catch (e) {
      results.push({ feature, route, ok: false, detail: e.message });
      console.log(`✗ ${feature.padEnd(14)} ${route.padEnd(22)} ${e.message}`);
    }
  }

  console.log("Admin feature data checks\n");

  await check("Today", "/admin", async () => {
    const students = await count(supabase, "profiles", (q) => q.eq("role", "user"));
    const staff = await count(supabase, "profiles", (q) =>
      q.in("role", ["admin", "super_admin", "finance", "instructor"]),
    );
    const courses = await count(supabase, "courses", (q) => q.eq("is_published", true));
    const enrollments = await count(supabase, "enrollments", (q) => q.eq("status", "active"));
    assert(students >= 3, `need ≥3 students, got ${students}`);
    assert(staff >= 2, `need ≥2 staff, got ${staff}`);
    assert(courses >= 1, `need ≥1 published course`);
    assert(enrollments >= 1, `need ≥1 active enrollment`);
    return `${students} students, ${staff} staff, ${courses} courses, ${enrollments} active enrollments`;
  });

  await check("Students", "/admin/students", async () => {
    const students = await count(supabase, "profiles", (q) => q.eq("role", "user"));
    const enrollments = await count(supabase, "enrollments");
    assert(students >= 3, `need ≥3 student profiles`);
    assert(enrollments >= 3, `need ≥3 enrollments`);
    return `${students} profiles, ${enrollments} enrollments`;
  });

  await check("Cohorts", "/admin/cohorts", async () => {
    const n = await count(supabase, "cohorts");
    assert(n >= 2, `need ≥2 cohorts, got ${n}`);
    return `${n} cohorts`;
  });

  await check("Attendance", "/admin/attendance", async () => {
    const attendance = await count(supabase, "class_attendance");
    const sessions = await count(supabase, "class_sessions");
    assert(attendance >= 3, `need ≥3 attendance rows`);
    assert(sessions >= 1, `need ≥1 session for mark form`);
    return `${attendance} records, ${sessions} sessions`;
  });

  await check("At risk", "/admin/at-risk", async () => {
    const n = await count(supabase, "enrollments", (q) =>
      q.eq("status", "active").lt("progress_percent", 40),
    );
    assert(n >= 1, `need ≥1 at-risk enrollment (active, progress < 40)`);
    return `${n} at-risk learners`;
  });

  await check("Courses", "/admin/courses", async () => {
    const all = await count(supabase, "courses");
    const drafts = await count(supabase, "courses", (q) => q.eq("is_published", false));
    assert(all >= 5, `need catalog courses`);
    return `${all} courses (${drafts} draft)`;
  });

  await check("Assessments", "/admin/assessments", async () => {
    return "stub page (no DB table yet) — skip data";
  });

  await check("Sessions", "/admin/sessions", async () => {
    const n = await count(supabase, "class_sessions");
    assert(n >= 2, `need ≥2 sessions`);
    return `${n} sessions`;
  });

  await check("Instructors", "/admin/instructors", async () => {
    const n = await count(supabase, "instructors");
    assert(n >= 2, `need ≥2 instructors`);
    return `${n} instructors`;
  });

  await check("Payments", "/admin/payments", async () => {
    const all = await count(supabase, "payments");
    const pending = await count(supabase, "payments", (q) => q.eq("approved_by_admin", false));
    assert(all >= 3, `need ≥3 payments`);
    assert(pending >= 1, `need ≥1 unapproved payment`);
    return `${all} payments (${pending} awaiting approval)`;
  });

  await check("Revenue", "/admin/revenue", async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("amount_due, amount_paid, status, approved_by_admin");
    if (error) throw error;
    assert(data?.length >= 3, "need payment mix for revenue");
    const collected = data
      .filter((p) => p.approved_by_admin)
      .reduce((s, p) => s + Number(p.amount_paid || 0), 0);
    const overdue = data.filter((p) => p.status === "overdue").length;
    assert(collected > 0, "need approved collected amount");
    assert(overdue >= 1, "need overdue payment for revenue view");
    return `collected ${collected} RWF, ${overdue} overdue`;
  });

  await check("Invoices", "/admin/invoices", async () => {
    const invoices = await count(supabase, "invoices");
    const plans = await count(supabase, "payment_plans");
    assert(invoices >= 2, `need ≥2 invoices`);
    assert(plans >= 1, `need ≥1 payment plan`);
    return `${invoices} invoices, ${plans} plans`;
  });

  await check("Users", "/admin/users", async () => {
    const { data, error } = await supabase.from("profiles").select("role");
    if (error) throw error;
    const roles = new Set(data.map((p) => p.role));
    assert(roles.has("super_admin") || roles.has("admin"), "need admin profile");
    assert(roles.has("user"), "need student profiles");
    return `${data.length} profiles, roles: ${[...roles].join(", ")}`;
  });

  await check("Content", "/admin/content", async () => {
    const n = await count(supabase, "coupons");
    const active = await count(supabase, "coupons", (q) => q.eq("active", true));
    assert(n >= 2, `need ≥2 coupons`);
    assert(active >= 1, `need ≥1 active coupon`);
    return `${n} coupons (${active} active)`;
  });

  // Mutation smoke: create + delete a coupon
  await check("Write path", "createCoupon", async () => {
    const code = `TEST${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await supabase
      .from("coupons")
      .insert({
        code,
        description: "[test] ephemeral",
        discount_percent: 5,
        active: true,
      })
      .select("id")
      .single();
    if (error) throw error;
    const { error: delErr } = await supabase.from("coupons").delete().eq("id", data.id);
    if (delErr) throw delErr;
    return `insert+delete coupon ${code}`;
  });

  // Auth login smoke for demo admin
  await check("Auth login", "admin@cla.demo", async () => {
    const anon = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { transport: ws },
    });
    const { data, error } = await anon.auth.signInWithPassword({
      email: "admin@cla.demo",
      password: "DemoCLA2026!",
    });
    if (error) throw error;
    assert(data.session?.access_token, "no session token");
    await anon.auth.signOut();
    return "password sign-in ok";
  });

  if (BASE_URL) {
    console.log(`\nLive route checks (${BASE_URL})\n`);
    const routes = [
      "/login",
      "/admin",
      "/admin/students",
      "/admin/cohorts",
      "/admin/attendance",
      "/admin/at-risk",
      "/admin/courses",
      "/admin/assessments",
      "/admin/sessions",
      "/admin/instructors",
      "/admin/payments",
      "/admin/revenue",
      "/admin/invoices",
      "/admin/users",
      "/admin/content",
    ];
    for (const route of routes) {
      const res = await fetch(`${BASE_URL}${route}`, { redirect: "manual" });
      const ok = res.status === 200 || res.status === 307 || res.status === 302;
      const loc = res.headers.get("location") || "";
      console.log(
        `${ok ? "✓" : "✗"} ${String(res.status).padEnd(4)} ${route.padEnd(22)} ${loc}`,
      );
      results.push({
        feature: `HTTP ${route}`,
        route,
        ok,
        detail: `status ${res.status}`,
      });
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.error("Failures:", failed.map((f) => f.feature).join(", "));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
