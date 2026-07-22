-- LMS activity extras (CIPS codes + media) and readable hierarchy for published courses

alter table public.lms_activities
  add column if not exists module_code text,
  add column if not exists lo_code text,
  add column if not exists ac_code text,
  add column if not exists file_url text,
  add column if not exists external_link text,
  add column if not exists estimated_duration_minutes integer,
  add column if not exists is_required boolean not null default true;

-- Learners can read module/chapter outline for published LMS programmes
drop policy if exists "Published LMS modules are public" on public.lms_modules;
create policy "Published LMS modules are public"
  on public.lms_modules for select
  using (
    exists (
      select 1 from public.lms_courses c
      where c.id = course_id and c.status = 'published'
    )
  );

drop policy if exists "Published LMS chapters are public" on public.lms_chapters;
create policy "Published LMS chapters are public"
  on public.lms_chapters for select
  using (
    exists (
      select 1 from public.lms_courses c
      where c.id = course_id and c.status = 'published'
    )
  );

notify pgrst, 'reload schema';
