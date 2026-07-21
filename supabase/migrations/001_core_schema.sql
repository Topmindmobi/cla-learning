-- CLA Learning — core schema (Phase 1)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard

create extension if not exists "pgcrypto";

-- Profiles extend Supabase auth.users
create type user_role as enum ('user', 'admin', 'super_admin', 'finance', 'instructor');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role user_role not null default 'user',
  roles user_role[] not null default array['user']::user_role[],
  instructor_course_ids uuid[] not null default '{}',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type course_category as enum (
  'professional_courses',
  'consulting',
  'training_development',
  'short_term_courses',
  'research_surveys',
  'finance',
  'management',
  'technology'
);

create type course_difficulty as enum ('beginner', 'intermediate', 'advanced');

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  short_description text,
  full_description text,
  learning_outcomes text,
  target_audience text,
  course_requirements text,
  career_benefits text,
  category course_category not null,
  difficulty course_difficulty not null default 'beginner',
  thumbnail_url text,
  instructor_name text,
  instructor_title text,
  instructor_avatar text,
  duration_hours numeric,
  price numeric not null default 0,
  currency text not null default 'RWF',
  language text not null default 'English',
  what_you_will_learn jsonb not null default '[]',
  requirements jsonb not null default '[]',
  tags jsonb not null default '[]',
  is_published boolean not null default false,
  is_featured boolean not null default false,
  enrollment_count integer not null default 0,
  average_rating numeric not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type enrollment_status as enum ('active', 'completed', 'paused', 'dropped');

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  cohort_id uuid,
  status enrollment_status not null default 'active',
  progress_percent numeric not null default 0,
  completed_lessons jsonb not null default '[]',
  last_accessed_lesson_id uuid,
  enrolled_date date,
  completed_date date,
  certificate_issued boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, user_id)
);

-- LMS hierarchy
create type lms_course_status as enum ('draft', 'published', 'archived');

create table public.lms_courses (
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

create table public.lms_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  code text not null,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.lms_chapters (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.lms_courses(id) on delete cascade,
  module_id uuid not null references public.lms_modules(id) on delete cascade,
  code text not null,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create type lms_lesson_type as enum ('concept', 'applied_exercise', 'case_study', 'reading', 'video');

create table public.lms_lessons (
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

create type lms_activity_type as enum ('content', 'video', 'quiz', 'assignment', 'discussion');

create table public.lms_activities (
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

create table public.lms_activity_progress (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.lms_activities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  completed boolean not null default false,
  progress_data jsonb not null default '{}',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (activity_id, user_id)
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.lms_courses enable row level security;
alter table public.lms_modules enable row level security;
alter table public.lms_chapters enable row level security;
alter table public.lms_lessons enable row level security;
alter table public.lms_activities enable row level security;
alter table public.lms_activity_progress enable row level security;

create policy "Profiles viewable by owner"
  on public.profiles for select using (auth.uid() = id);

create policy "Profiles updatable by owner"
  on public.profiles for update using (auth.uid() = id);

create policy "Published courses are public"
  on public.courses for select using (is_published = true);

create policy "Users view own enrollments"
  on public.enrollments for select using (auth.uid() = user_id);

create policy "Published LMS courses are public"
  on public.lms_courses for select using (status = 'published');

create policy "Published LMS lessons are public"
  on public.lms_lessons for select using (is_published = true);

create policy "Published LMS activities are public"
  on public.lms_activities for select using (is_published = true);

create policy "Users manage own activity progress"
  on public.lms_activity_progress for all using (auth.uid() = user_id);

-- Indexes
create index courses_published_idx on public.courses (is_published, is_featured);
create index enrollments_user_idx on public.enrollments (user_id);
create index lms_lessons_chapter_idx on public.lms_lessons (chapter_id, sort_order);
create index lms_activities_lesson_idx on public.lms_activities (lesson_id, sort_order);
