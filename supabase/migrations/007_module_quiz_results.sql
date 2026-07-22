-- Learner quiz attempts + published quiz read access

create table if not exists public.module_quiz_results (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.module_quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  student_email text not null,
  responses jsonb not null default '{}',
  score_percent numeric not null default 0,
  correct_count integer not null default 0,
  total_questions integer not null default 0,
  is_passed boolean not null default false,
  attempt_number integer not null default 1,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists module_quiz_results_quiz_idx on public.module_quiz_results (quiz_id);
create index if not exists module_quiz_results_user_idx on public.module_quiz_results (user_id);

alter table public.module_quiz_results enable row level security;

drop policy if exists "Users manage own quiz results" on public.module_quiz_results;
create policy "Users manage own quiz results"
  on public.module_quiz_results for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Staff read quiz results" on public.module_quiz_results;
create policy "Staff read quiz results"
  on public.module_quiz_results for select
  using (public.is_staff());

-- Learners can take published quizzes
drop policy if exists "Published quizzes are readable" on public.module_quizzes;
create policy "Published quizzes are readable"
  on public.module_quizzes for select
  using (is_published = true);

notify pgrst, 'reload schema';
