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

