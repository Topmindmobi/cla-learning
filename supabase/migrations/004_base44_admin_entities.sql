-- Base44 admin entities → Supabase (Phase 2)
-- Payments, cohorts, attendance, instructors, sessions, invoices, coupons

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role in ('admin', 'super_admin', 'finance')
        or 'admin' = any (p.roles)
        or 'super_admin' = any (p.roles)
        or 'finance' = any (p.roles)
      )
  );
$$;

create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  title text,
  bio text,
  specializations jsonb not null default '[]',
  qualifications text,
  years_experience numeric,
  linkedin_url text,
  avatar_url text,
  availability text default 'Part-time',
  delivery_modes jsonb not null default '[]',
  status text not null default 'Pending Review',
  notes text,
  profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  name text not null,
  start_date date,
  end_date date,
  status text not null default 'planned',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  student_email text not null,
  student_user_id uuid references public.profiles(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  amount_due numeric not null default 0,
  amount_paid numeric not null default 0,
  currency text not null default 'RWF',
  payment_type text not null default 'full',
  status text not null default 'pending',
  approved_by_admin boolean not null default false,
  approved_at timestamptz,
  approved_by text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_id uuid references public.courses(id) on delete set null,
  total_amount numeric not null default 0,
  currency text not null default 'RWF',
  installment_count integer not null default 1,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  student_email text not null,
  student_user_id uuid references public.profiles(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  amount numeric not null default 0,
  currency text not null default 'RWF',
  status text not null default 'draft',
  due_date date,
  issued_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_percent numeric,
  discount_amount numeric,
  currency text default 'RWF',
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  cohort_id uuid references public.cohorts(id) on delete set null,
  instructor_id uuid references public.instructors(id) on delete set null,
  title text not null,
  start_at timestamptz,
  end_at timestamptz,
  location text,
  meeting_url text,
  status text not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_attendance (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.class_sessions(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  student_email text not null,
  student_name text,
  student_user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'present',
  verified_at timestamptz,
  method text,
  marked_by text,
  notes text,
  class_title text,
  class_start timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_status_idx on public.payments (status, approved_by_admin);
create index if not exists payments_email_idx on public.payments (student_email);
create index if not exists cohorts_course_idx on public.cohorts (course_id, status);
create index if not exists class_sessions_start_idx on public.class_sessions (start_at);
create index if not exists class_attendance_class_idx on public.class_attendance (class_id);
create index if not exists class_attendance_email_idx on public.class_attendance (student_email);

alter table public.instructors enable row level security;
alter table public.cohorts enable row level security;
alter table public.payments enable row level security;
alter table public.payment_plans enable row level security;
alter table public.invoices enable row level security;
alter table public.coupons enable row level security;
alter table public.class_sessions enable row level security;
alter table public.class_attendance enable row level security;

drop policy if exists "Staff manage instructors" on public.instructors;
create policy "Staff manage instructors" on public.instructors for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage cohorts" on public.cohorts;
create policy "Staff manage cohorts" on public.cohorts for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage payments" on public.payments;
create policy "Staff manage payments" on public.payments for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage payment_plans" on public.payment_plans;
create policy "Staff manage payment_plans" on public.payment_plans for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage invoices" on public.invoices;
create policy "Staff manage invoices" on public.invoices for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage coupons" on public.coupons;
create policy "Staff manage coupons" on public.coupons for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage class_sessions" on public.class_sessions;
create policy "Staff manage class_sessions" on public.class_sessions for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff manage class_attendance" on public.class_attendance;
create policy "Staff manage class_attendance" on public.class_attendance for all
  using (public.is_staff()) with check (public.is_staff());

-- Learners can see their own payment/attendance/invoice rows
drop policy if exists "Users view own payments" on public.payments;
create policy "Users view own payments" on public.payments for select
  using (auth.uid() = student_user_id or lower(student_email) = lower(coalesce(auth.jwt()->>'email', '')));

drop policy if exists "Users view own attendance" on public.class_attendance;
create policy "Users view own attendance" on public.class_attendance for select
  using (auth.uid() = student_user_id or lower(student_email) = lower(coalesce(auth.jwt()->>'email', '')));

drop policy if exists "Users view own invoices" on public.invoices;
create policy "Users view own invoices" on public.invoices for select
  using (auth.uid() = student_user_id or lower(student_email) = lower(coalesce(auth.jwt()->>'email', '')));
