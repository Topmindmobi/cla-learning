#!/usr/bin/env node
/**
 * Base44 → Supabase data migration helper
 *
 * 1. In Base44 editor: Data → each collection → Export CSV
 * 2. Save CSVs to ./data/base44-export/
 * 3. Create Supabase project and run supabase/migrations/001_core_schema.sql
 * 4. Use Supabase Table Editor or SQL to import CSVs
 *
 * Priority import order:
 *   courses, lms_courses, lms_modules, lms_chapters, lms_lessons, lms_activities
 *   profiles (after auth users exist), enrollments, lms_activity_progress
 */

const ENTITIES = [
  "Course",
  "LMSCourse",
  "LMSModule",
  "LMSChapter",
  "LMSLesson",
  "LMSActivity",
  "Enrollment",
  "LearnerProfile",
  "Payment",
  "PaymentPlan",
  "Cohort",
  "Instructor",
  "Notification",
];

console.log("Base44 → Supabase migration checklist\n");
console.log("Export these collections from Base44 (Data tab → Export CSV):\n");
ENTITIES.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
console.log(`
Next steps:
  1. Create project at https://supabase.com/dashboard
  2. Run SQL: supabase/migrations/001_core_schema.sql
  3. Copy .env.local.example → .env.local with Supabase keys
  4. Import CSVs via Supabase Table Editor (map columns to new schema)
  5. Run: npm run dev
`);
