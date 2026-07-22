-- Teaching + assessments (Phase 3) — also creates LMS hierarchy if missing from 001

-- Enums (safe if already present)
do $$ begin
  create type lms_course_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type lms_lesson_type as enum ('concept', 'applied_exercise', 'case_study', 'reading', 'video');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type lms_activity_type as enum ('content', 'video', 'quiz', 'assignment', 'discussion');
exception when duplicate_object then null;
end $$;

create table if not exists public.lms_courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  level integer,
  description text,
  credits_total numeric,
  tqt_hours numeric,
  glh_hours numeric,
  ssr_hours numeric,
  exam_hours_total numeric,
  entry_requirement text,
  structure_note text,
  module_selection_rule jsonb,
  status lms_course_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lms_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  code text not null,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lms_chapters (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  module_id uuid not null references public.lms_modules(id) on delete cascade,
  code text not null,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lms_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  module_id uuid not null references public.lms_modules(id) on delete cascade,
  chapter_id uuid not null references public.lms_chapters(id) on delete cascade,
  code text not null,
  title text not null,
  lesson_type lms_lesson_type not null default 'concept',
  learning_objectives jsonb not null default '[]',
  introduction text,
  key_notes text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.lms_activities (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lms_lessons(id) on delete cascade,
  title text not null,
  activity_type lms_activity_type not null default 'content',
  description text,
  content_html text,
  video_url text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.lms_activity_progress (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.lms_activities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  completed boolean not null default false,
  progress_data jsonb not null default '{}',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (activity_id, user_id)
);

alter table public.lms_courses enable row level security;
alter table public.lms_modules enable row level security;
alter table public.lms_chapters enable row level security;
alter table public.lms_lessons enable row level security;
alter table public.lms_activities enable row level security;
alter table public.lms_activity_progress enable row level security;

drop policy if exists "Published LMS courses are public" on public.lms_courses;
create policy "Published LMS courses are public"
  on public.lms_courses for select using (status = 'published');

drop policy if exists "Published LMS lessons are public" on public.lms_lessons;
create policy "Published LMS lessons are public"
  on public.lms_lessons for select using (is_published = true);

drop policy if exists "Published LMS activities are public" on public.lms_activities;
create policy "Published LMS activities are public"
  on public.lms_activities for select using (is_published = true);

drop policy if exists "Users manage own activity progress" on public.lms_activity_progress;
create policy "Users manage own activity progress"
  on public.lms_activity_progress for all using (auth.uid() = user_id);

-- Question banks
create table if not exists public.question_banks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_id uuid references public.courses(id) on delete set null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  bank_id uuid references public.question_banks(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  question_text text not null,
  question_type text not null default 'multiple_choice',
  options jsonb not null default '[]',
  correct_index integer not null default 0,
  explanation text,
  difficulty text default 'medium',
  topic text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.module_quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  lms_course_id uuid references public.lms_courses(id) on delete set null,
  lms_module_id uuid references public.lms_modules(id) on delete set null,
  title text not null,
  description text,
  questions jsonb not null default '[]',
  passing_score integer not null default 70,
  time_limit_minutes integer,
  is_published boolean not null default false,
  shuffle_questions boolean not null default false,
  allow_retake boolean not null default true,
  max_attempts integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  cohort_id uuid references public.cohorts(id) on delete set null,
  student_email text not null,
  student_user_id uuid references public.profiles(id) on delete set null,
  assignment_title text not null,
  submission_text text,
  file_url text,
  file_name text,
  status text not null default 'submitted',
  grade numeric,
  max_score numeric not null default 100,
  feedback text,
  graded_at timestamptz,
  graded_by text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applicants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  course_id uuid references public.courses(id) on delete set null,
  cohort_id uuid references public.cohorts(id) on delete set null,
  status text not null default 'lead',
  notes text,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists applicants_email_course_idx
  on public.applicants (lower(email), coalesce(course_id, '00000000-0000-0000-0000-000000000000'::uuid));

create table if not exists public.role_configs (
  id uuid primary key default gen_random_uuid(),
  role text not null unique,
  allowed_paths jsonb not null default '[]',
  notes text,
  updated_at timestamptz not null default now()
);

alter table public.lms_courses
  add column if not exists synced_course_id uuid references public.courses(id) on delete set null;

alter table public.lms_modules
  add column if not exists overview text,
  add column if not exists module_type text default 'core',
  add column if not exists credits numeric,
  add column if not exists is_published boolean not null default false;

alter table public.lms_chapters
  add column if not exists learning_outcome text,
  add column if not exists is_published boolean not null default false;

alter table public.class_sessions
  add column if not exists description text,
  add column if not exists instructor_name text;

alter table public.question_banks enable row level security;
alter table public.questions enable row level security;
alter table public.module_quizzes enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.applicants enable row level security;
alter table public.role_configs enable row level security;

drop policy if exists "Staff manage question_banks" on public.question_banks;
create policy "Staff manage question_banks" on public.question_banks for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage questions" on public.questions;
create policy "Staff manage questions" on public.questions for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage module_quizzes" on public.module_quizzes;
create policy "Staff manage module_quizzes" on public.module_quizzes for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage assignment_submissions" on public.assignment_submissions;
create policy "Staff manage assignment_submissions" on public.assignment_submissions for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage applicants" on public.applicants;
create policy "Staff manage applicants" on public.applicants for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage role_configs" on public.role_configs;
create policy "Staff manage role_configs" on public.role_configs for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage lms_courses" on public.lms_courses;
create policy "Staff manage lms_courses" on public.lms_courses for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage lms_modules" on public.lms_modules;
create policy "Staff manage lms_modules" on public.lms_modules for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage lms_chapters" on public.lms_chapters;
create policy "Staff manage lms_chapters" on public.lms_chapters for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage lms_lessons" on public.lms_lessons;
create policy "Staff manage lms_lessons" on public.lms_lessons for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage lms_activities" on public.lms_activities;
create policy "Staff manage lms_activities" on public.lms_activities for all
  using (public.is_staff()) with check (public.is_staff());

create index if not exists questions_bank_idx on public.questions (bank_id, sort_order);
create index if not exists module_quizzes_course_idx on public.module_quizzes (course_id);
create index if not exists assignment_submissions_status_idx on public.assignment_submissions (status, submitted_at);
create index if not exists applicants_status_idx on public.applicants (status, created_at);
create index if not exists lms_lessons_chapter_idx on public.lms_lessons (chapter_id, sort_order);
create index if not exists lms_activities_lesson_idx on public.lms_activities (lesson_id, sort_order);
