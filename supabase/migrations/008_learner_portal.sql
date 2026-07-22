-- Learner access for sessions, assignments, and purchase intents

-- Learners can read upcoming class sessions (timetable is shared; filtering is app-side by enrollment)
drop policy if exists "Authenticated users read class sessions" on public.class_sessions;
create policy "Authenticated users read class sessions"
  on public.class_sessions for select
  using (auth.role() = 'authenticated');

-- Learners manage their own assignment submissions
drop policy if exists "Users view own assignment submissions" on public.assignment_submissions;
create policy "Users view own assignment submissions"
  on public.assignment_submissions for select
  using (
    auth.uid() = student_user_id
    or lower(student_email) = lower(coalesce(auth.jwt()->>'email', ''))
  );

drop policy if exists "Users insert own assignment submissions" on public.assignment_submissions;
create policy "Users insert own assignment submissions"
  on public.assignment_submissions for insert
  with check (
    auth.uid() = student_user_id
    or lower(student_email) = lower(coalesce(auth.jwt()->>'email', ''))
  );

drop policy if exists "Users update own assignment submissions" on public.assignment_submissions;
create policy "Users update own assignment submissions"
  on public.assignment_submissions for update
  using (
    auth.uid() = student_user_id
    or lower(student_email) = lower(coalesce(auth.jwt()->>'email', ''))
  )
  with check (
    auth.uid() = student_user_id
    or lower(student_email) = lower(coalesce(auth.jwt()->>'email', ''))
  );

-- Learners may create their own pending payment / purchase intent
drop policy if exists "Users insert own payments" on public.payments;
create policy "Users insert own payments"
  on public.payments for insert
  with check (
    auth.uid() = student_user_id
    or lower(student_email) = lower(coalesce(auth.jwt()->>'email', ''))
  );

-- Lightweight in-app notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, is_read, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Users manage own notifications" on public.notifications;
create policy "Users manage own notifications"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Staff manage notifications" on public.notifications;
create policy "Staff manage notifications"
  on public.notifications for all
  using (public.is_staff())
  with check (public.is_staff());

-- Discussion posts on LMS activities
create table if not exists public.discussion_posts (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.lms_activities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  author_name text,
  author_email text,
  body text not null,
  parent_id uuid references public.discussion_posts(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists discussion_posts_activity_idx on public.discussion_posts (activity_id, created_at);

alter table public.discussion_posts enable row level security;

drop policy if exists "Authenticated read discussion posts" on public.discussion_posts;
create policy "Authenticated read discussion posts"
  on public.discussion_posts for select
  using (auth.role() = 'authenticated');

drop policy if exists "Users insert discussion posts" on public.discussion_posts;
create policy "Users insert discussion posts"
  on public.discussion_posts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own discussion posts" on public.discussion_posts;
create policy "Users delete own discussion posts"
  on public.discussion_posts for delete
  using (auth.uid() = user_id);

drop policy if exists "Staff manage discussion posts" on public.discussion_posts;
create policy "Staff manage discussion posts"
  on public.discussion_posts for all
  using (public.is_staff())
  with check (public.is_staff());

notify pgrst, 'reload schema';
