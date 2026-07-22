#!/usr/bin/env node
/**
 * Seed demo users + admin ops data so every admin feature has real rows.
 *
 * Usage:
 *   npm run seed:demo
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Demo login (after seed):
 *   email:    admin@cla.demo
 *   password: DemoCLA2026!
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServiceClient } from "./lib/supabase-admin.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

const DEMO_PASSWORD = "DemoCLA2026!";
const DEMO_NOTE = "[demo seed]";

const DEMO_USERS = [
  {
    email: "admin@cla.demo",
    full_name: "Demo Super Admin",
    role: "super_admin",
    roles: ["super_admin", "admin"],
  },
  {
    email: "finance@cla.demo",
    full_name: "Demo Finance",
    role: "finance",
    roles: ["finance"],
  },
  {
    email: "instructor@cla.demo",
    full_name: "Demo Instructor",
    role: "instructor",
    roles: ["instructor"],
  },
  {
    email: "alice@student.demo",
    full_name: "Alice Mukamana",
    role: "user",
    roles: ["user"],
  },
  {
    email: "bob@student.demo",
    full_name: "Bob Nkurunziza",
    role: "user",
    roles: ["user"],
  },
  {
    email: "cara@student.demo",
    full_name: "Cara Uwase",
    role: "user",
    roles: ["user"],
  },
  {
    email: "david@student.demo",
    full_name: "David Habimana",
    role: "user",
    roles: ["user"],
  },
  {
    email: "erin@student.demo",
    full_name: "Erin Ingabire",
    role: "user",
    roles: ["user"],
  },
];

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error("Missing .env.local — run: npm run setup:cloud");
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

async function ensureUser(supabase, user) {
  const { data: listed, error: listErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw listErr;

  const existing = listed.users.find((u) => u.email?.toLowerCase() === user.email.toLowerCase());
  if (existing) {
    const { error: updErr } = await supabase.auth.admin.updateUserById(existing.id, {
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: user.full_name },
    });
    if (updErr) throw updErr;
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: user.full_name },
  });
  if (error) throw error;
  return data.user.id;
}

async function wipeDemoOps(supabase, studentEmails, instructorEmails) {
  // Order matters for FKs
  await supabase.from("class_attendance").delete().like("notes", `${DEMO_NOTE}%`);
  await supabase.from("class_attendance").delete().in("student_email", studentEmails);

  const { data: demoSessions } = await supabase
    .from("class_sessions")
    .select("id")
    .like("notes", `${DEMO_NOTE}%`);
  if (demoSessions?.length) {
    await supabase.from("class_sessions").delete().in(
      "id",
      demoSessions.map((s) => s.id),
    );
  }

  await supabase.from("invoices").delete().like("notes", `${DEMO_NOTE}%`);
  await supabase.from("invoices").delete().in("student_email", studentEmails);

  await supabase.from("payments").delete().like("notes", `${DEMO_NOTE}%`);
  await supabase.from("payments").delete().in("student_email", studentEmails);

  await supabase.from("payment_plans").delete().like("notes", `${DEMO_NOTE}%`);
  await supabase.from("coupons").delete().like("description", `${DEMO_NOTE}%`);
  await supabase.from("cohorts").delete().like("notes", `${DEMO_NOTE}%`);
  await supabase.from("instructors").delete().in("email", instructorEmails);
  await supabase.from("instructors").delete().like("notes", `${DEMO_NOTE}%`);
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createServiceClient(url, key);

  console.log("Seeding CLA admin demo data…");
  console.log("  project:", url);

  const { data: courses, error: courseErr } = await supabase
    .from("courses")
    .select("id, slug, title, price, is_published")
    .order("title");
  if (courseErr) throw courseErr;
  if (!courses?.length) {
    console.error("No courses found. Run: npm run import:courses");
    process.exit(1);
  }

  const bySlug = Object.fromEntries(courses.map((c) => [c.slug, c]));
  const cipsL4 = bySlug["cips-level-4-diploma"] || courses[0];
  const cipsL3 = bySlug["cips-level-3-advanced-certificate"] || courses[1] || courses[0];
  const acca = bySlug["acca-applied-knowledge"] || courses.find((c) => c.slug?.includes("acca")) || courses[2] || courses[0];

  // Ensure at least one draft for Courses UI variety
  const published = courses.filter((c) => c.is_published);
  if (published.length) {
    const draftCandidate = published[published.length - 1];
    await supabase.from("courses").update({ is_published: false }).eq("id", draftCandidate.id);
  }

  const profileByEmail = {};
  for (const user of DEMO_USERS) {
    const id = await ensureUser(supabase, user);
    const { error } = await supabase
      .from("profiles")
      .update({
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        roles: user.roles,
      })
      .eq("id", id);
    if (error) throw error;
    profileByEmail[user.email] = id;
    console.log(`  ✓ user ${user.email} (${user.role})`);
  }

  const studentEmails = DEMO_USERS.filter((u) => u.role === "user").map((u) => u.email);
  const instructorEmails = ["bernard@cla.demo", "faculty@cla.demo", "instructor@cla.demo"];

  await wipeDemoOps(supabase, studentEmails, instructorEmails);

  // Clear prior demo enrollments for these students (re-insert below)
  const studentIds = studentEmails.map((e) => profileByEmail[e]);
  await supabase.from("enrollments").delete().in("user_id", studentIds);

  const { data: instructors, error: instErr } = await supabase
    .from("instructors")
    .insert([
      {
        full_name: "Bernard Niyonsenga",
        email: "bernard@cla.demo",
        phone: "+250788111001",
        title: "CIPS Certified Trainer",
        bio: "Lead CIPS faculty for CLA Learning.",
        specializations: ["CIPS", "Procurement"],
        qualifications: "MCIPS, MBA",
        years_experience: 12,
        availability: "Full-time",
        delivery_modes: ["In-person", "Online"],
        status: "Active",
        notes: DEMO_NOTE,
        profile_id: profileByEmail["instructor@cla.demo"],
      },
      {
        full_name: "Grace Uwimana",
        email: "faculty@cla.demo",
        phone: "+250788111002",
        title: "ACCA Tutor",
        bio: "ACCA Applied Knowledge tutor.",
        specializations: ["ACCA", "Finance"],
        qualifications: "ACCA, BCom",
        years_experience: 8,
        availability: "Part-time",
        delivery_modes: ["Online"],
        status: "Pending Review",
        notes: DEMO_NOTE,
      },
      {
        full_name: "Demo Instructor",
        email: "instructor@cla.demo",
        title: "Guest Facilitator",
        specializations: ["Facilitation"],
        availability: "Part-time",
        delivery_modes: ["Online"],
        status: "Active",
        notes: DEMO_NOTE,
        profile_id: profileByEmail["instructor@cla.demo"],
      },
    ])
    .select("id, email");
  if (instErr) throw instErr;
  const instructorId = (email) => instructors.find((i) => i.email === email)?.id;
  console.log(`  ✓ instructors (${instructors.length})`);

  const { data: cohorts, error: cohortErr } = await supabase
    .from("cohorts")
    .insert([
      {
        course_id: cipsL4.id,
        name: "CIPS L4 — July 2026 Kigali",
        start_date: isoDate(daysFromNow(-14)),
        end_date: isoDate(daysFromNow(160)),
        status: "active",
        notes: DEMO_NOTE,
      },
      {
        course_id: cipsL3.id,
        name: "CIPS L3 — Autumn intake",
        start_date: isoDate(daysFromNow(30)),
        end_date: isoDate(daysFromNow(200)),
        status: "planned",
        notes: DEMO_NOTE,
      },
      {
        course_id: acca.id,
        name: "ACCA AK — completed Q1",
        start_date: isoDate(daysFromNow(-200)),
        end_date: isoDate(daysFromNow(-40)),
        status: "completed",
        notes: DEMO_NOTE,
      },
    ])
    .select("id, name, course_id");
  if (cohortErr) throw cohortErr;
  console.log(`  ✓ cohorts (${cohorts.length})`);

  const enrollmentRows = [
    {
      user_id: profileByEmail["alice@student.demo"],
      course_id: cipsL4.id,
      cohort_id: cohorts[0].id,
      status: "active",
      progress_percent: 15,
      enrolled_date: isoDate(daysFromNow(-20)),
    },
    {
      user_id: profileByEmail["bob@student.demo"],
      course_id: cipsL4.id,
      cohort_id: cohorts[0].id,
      status: "active",
      progress_percent: 25,
      enrolled_date: isoDate(daysFromNow(-18)),
    },
    {
      user_id: profileByEmail["cara@student.demo"],
      course_id: cipsL3.id,
      cohort_id: cohorts[1].id,
      status: "active",
      progress_percent: 55,
      enrolled_date: isoDate(daysFromNow(-40)),
    },
    {
      user_id: profileByEmail["david@student.demo"],
      course_id: acca.id,
      cohort_id: cohorts[2].id,
      status: "completed",
      progress_percent: 100,
      enrolled_date: isoDate(daysFromNow(-180)),
      completed_date: isoDate(daysFromNow(-45)),
    },
    {
      user_id: profileByEmail["erin@student.demo"],
      course_id: cipsL3.id,
      status: "paused",
      progress_percent: 30,
      enrolled_date: isoDate(daysFromNow(-60)),
    },
    {
      user_id: profileByEmail["alice@student.demo"],
      course_id: cipsL3.id,
      status: "active",
      progress_percent: 80,
      enrolled_date: isoDate(daysFromNow(-90)),
    },
  ];

  const { error: enrErr } = await supabase.from("enrollments").insert(enrollmentRows);
  if (enrErr) throw enrErr;
  console.log(`  ✓ enrollments (${enrollmentRows.length}) — includes at-risk (<40%)`);

  for (const courseId of [cipsL4.id, cipsL3.id, acca.id]) {
    const { count } = await supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("course_id", courseId);
    await supabase.from("courses").update({ enrollment_count: count ?? 0 }).eq("id", courseId);
  }

  const sessionPayload = [
    {
      course_id: cipsL4.id,
      cohort_id: cohorts[0].id,
      instructor_id: instructorId("bernard@cla.demo"),
      title: "CIPS L4 — Module 1 Live Class",
      start_at: daysFromNow(-2).toISOString(),
      end_at: new Date(daysFromNow(-2).getTime() + 2 * 3600_000).toISOString(),
      location: "CLA Kigali Campus — Room 2",
      status: "completed",
      notes: DEMO_NOTE,
    },
    {
      course_id: cipsL4.id,
      cohort_id: cohorts[0].id,
      instructor_id: instructorId("bernard@cla.demo"),
      title: "CIPS L4 — Module 2 Workshop",
      start_at: daysFromNow(1).toISOString(),
      end_at: new Date(daysFromNow(1).getTime() + 2 * 3600_000).toISOString(),
      meeting_url: "https://zoom.example/cla-cips-l4",
      status: "scheduled",
      notes: DEMO_NOTE,
    },
    {
      course_id: acca.id,
      cohort_id: cohorts[2].id,
      instructor_id: instructorId("faculty@cla.demo"),
      title: "ACCA AK — Revision Session",
      start_at: daysFromNow(5).toISOString(),
      end_at: new Date(daysFromNow(5).getTime() + 90 * 60_000).toISOString(),
      meeting_url: "https://zoom.example/cla-acca",
      status: "scheduled",
      notes: DEMO_NOTE,
    },
  ];

  const { data: sessions, error: sessErr } = await supabase
    .from("class_sessions")
    .insert(sessionPayload)
    .select("id, title, start_at, course_id");
  if (sessErr) throw sessErr;
  console.log(`  ✓ sessions (${sessions.length})`);

  const pastSession = sessions[0];
  const attendanceRows = [
    {
      class_id: pastSession.id,
      course_id: pastSession.course_id,
      student_email: "alice@student.demo",
      student_name: "Alice Mukamana",
      student_user_id: profileByEmail["alice@student.demo"],
      status: "present",
      method: "manual",
      marked_by: "admin@cla.demo",
      notes: DEMO_NOTE,
      class_title: pastSession.title,
      class_start: pastSession.start_at,
      verified_at: new Date().toISOString(),
    },
    {
      class_id: pastSession.id,
      course_id: pastSession.course_id,
      student_email: "bob@student.demo",
      student_name: "Bob Nkurunziza",
      student_user_id: profileByEmail["bob@student.demo"],
      status: "late",
      method: "manual",
      marked_by: "admin@cla.demo",
      notes: DEMO_NOTE,
      class_title: pastSession.title,
      class_start: pastSession.start_at,
    },
    {
      class_id: pastSession.id,
      course_id: pastSession.course_id,
      student_email: "cara@student.demo",
      student_name: "Cara Uwase",
      student_user_id: profileByEmail["cara@student.demo"],
      status: "absent",
      method: "manual",
      marked_by: "admin@cla.demo",
      notes: DEMO_NOTE,
      class_title: pastSession.title,
      class_start: pastSession.start_at,
    },
    {
      class_id: sessions[1].id,
      course_id: sessions[1].course_id,
      student_email: "alice@student.demo",
      student_name: "Alice Mukamana",
      student_user_id: profileByEmail["alice@student.demo"],
      status: "present",
      method: "manual",
      marked_by: "admin@cla.demo",
      notes: DEMO_NOTE,
      class_title: sessions[1].title,
      class_start: sessions[1].start_at,
    },
    {
      class_id: sessions[1].id,
      course_id: sessions[1].course_id,
      student_email: "david@student.demo",
      student_name: "David Habimana",
      student_user_id: profileByEmail["david@student.demo"],
      status: "present",
      method: "qr",
      marked_by: "system",
      notes: DEMO_NOTE,
      class_title: sessions[1].title,
      class_start: sessions[1].start_at,
    },
  ];
  const { error: attErr } = await supabase.from("class_attendance").insert(attendanceRows);
  if (attErr) throw attErr;
  console.log(`  ✓ attendance (${attendanceRows.length})`);

  const paymentRows = [
    {
      student_email: "alice@student.demo",
      student_user_id: profileByEmail["alice@student.demo"],
      course_id: cipsL4.id,
      amount_due: 20000,
      amount_paid: 20000,
      currency: "RWF",
      payment_type: "full",
      status: "paid",
      approved_by_admin: false,
      notes: `${DEMO_NOTE} awaiting approval`,
    },
    {
      student_email: "bob@student.demo",
      student_user_id: profileByEmail["bob@student.demo"],
      course_id: cipsL4.id,
      amount_due: 20000,
      amount_paid: 20000,
      currency: "RWF",
      payment_type: "full",
      status: "paid",
      approved_by_admin: true,
      approved_at: new Date().toISOString(),
      approved_by: "admin@cla.demo",
      notes: DEMO_NOTE,
    },
    {
      student_email: "cara@student.demo",
      student_user_id: profileByEmail["cara@student.demo"],
      course_id: cipsL3.id,
      amount_due: 20000,
      amount_paid: 8000,
      currency: "RWF",
      payment_type: "installment",
      status: "partial",
      approved_by_admin: true,
      approved_at: new Date().toISOString(),
      approved_by: "finance@cla.demo",
      notes: DEMO_NOTE,
    },
    {
      student_email: "erin@student.demo",
      student_user_id: profileByEmail["erin@student.demo"],
      course_id: cipsL3.id,
      amount_due: 20000,
      amount_paid: 0,
      currency: "RWF",
      payment_type: "full",
      status: "overdue",
      approved_by_admin: false,
      notes: DEMO_NOTE,
    },
  ];
  const { data: payments, error: payErr } = await supabase
    .from("payments")
    .insert(paymentRows)
    .select("id, student_email");
  if (payErr) throw payErr;
  console.log(`  ✓ payments (${payments.length})`);

  const { data: plans, error: planErr } = await supabase
    .from("payment_plans")
    .insert([
      {
        name: "CIPS L4 — 3 installments",
        course_id: cipsL4.id,
        total_amount: 60000,
        currency: "RWF",
        installment_count: 3,
        status: "active",
        notes: DEMO_NOTE,
      },
      {
        name: "ACCA AK — pay in full",
        course_id: acca.id,
        total_amount: Number(acca.price || 25000),
        currency: "RWF",
        installment_count: 1,
        status: "active",
        notes: DEMO_NOTE,
      },
    ])
    .select("id");
  if (planErr) throw planErr;
  console.log(`  ✓ payment plans (${plans.length})`);

  const invoiceRows = [
    {
      student_email: "alice@student.demo",
      student_user_id: profileByEmail["alice@student.demo"],
      course_id: cipsL4.id,
      payment_id: payments[0].id,
      amount: 20000,
      currency: "RWF",
      status: "sent",
      due_date: isoDate(daysFromNow(7)),
      issued_at: new Date().toISOString(),
      notes: DEMO_NOTE,
    },
    {
      student_email: "bob@student.demo",
      student_user_id: profileByEmail["bob@student.demo"],
      course_id: cipsL4.id,
      payment_id: payments[1].id,
      amount: 20000,
      currency: "RWF",
      status: "paid",
      due_date: isoDate(daysFromNow(-3)),
      issued_at: daysFromNow(-10).toISOString(),
      notes: DEMO_NOTE,
    },
    {
      student_email: "erin@student.demo",
      student_user_id: profileByEmail["erin@student.demo"],
      course_id: cipsL3.id,
      payment_id: payments[3].id,
      amount: 20000,
      currency: "RWF",
      status: "overdue",
      due_date: isoDate(daysFromNow(-14)),
      issued_at: daysFromNow(-30).toISOString(),
      notes: DEMO_NOTE,
    },
  ];
  const { error: invErr } = await supabase.from("invoices").insert(invoiceRows);
  if (invErr) throw invErr;
  console.log(`  ✓ invoices (${invoiceRows.length})`);

  // Coupons: upsert by code
  for (const coupon of [
    {
      code: "WELCOME10",
      description: `${DEMO_NOTE} 10% off first enrolment`,
      discount_percent: 10,
      discount_amount: null,
      currency: "RWF",
      active: true,
      expires_at: daysFromNow(90).toISOString(),
    },
    {
      code: "FLAT5000",
      description: `${DEMO_NOTE} flat RWF 5,000 off`,
      discount_percent: null,
      discount_amount: 5000,
      currency: "RWF",
      active: true,
      expires_at: daysFromNow(45).toISOString(),
    },
    {
      code: "EXPIRED25",
      description: `${DEMO_NOTE} inactive promo`,
      discount_percent: 25,
      discount_amount: null,
      currency: "RWF",
      active: false,
      expires_at: daysFromNow(-10).toISOString(),
    },
  ]) {
    const { error } = await supabase.from("coupons").upsert(coupon, { onConflict: "code" });
    if (error) throw error;
  }
  console.log("  ✓ coupons (3)");

  console.log("\nDone. Demo credentials:");
  console.log(`  Admin:      admin@cla.demo / ${DEMO_PASSWORD}`);
  console.log(`  Finance:    finance@cla.demo / ${DEMO_PASSWORD}`);
  console.log(`  Instructor: instructor@cla.demo / ${DEMO_PASSWORD}`);
  console.log(`  Students:   alice@student.demo … erin@student.demo / ${DEMO_PASSWORD}`);
  console.log("\nNext: npm run test:admin");
}

main().catch((e) => {
  console.error("Seed failed:", e.message || e);
  process.exit(1);
});
