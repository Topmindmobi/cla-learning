-- Staff policies for admin console (optional if using service role key).
-- Safe to run even when SUPABASE_SERVICE_ROLE_KEY is used by the app.

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

drop policy if exists "Staff can view all profiles" on public.profiles;
create policy "Staff can view all profiles"
  on public.profiles for select
  using (public.is_staff() or auth.uid() = id);

drop policy if exists "Staff can update profiles" on public.profiles;
create policy "Staff can update profiles"
  on public.profiles for update
  using (public.is_staff());

drop policy if exists "Staff can manage courses" on public.courses;
create policy "Staff can manage courses"
  on public.courses for all
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "Staff can view enrollments" on public.enrollments;
create policy "Staff can view enrollments"
  on public.enrollments for select
  using (public.is_staff() or auth.uid() = user_id);

drop policy if exists "Staff can update enrollments" on public.enrollments;
create policy "Staff can update enrollments"
  on public.enrollments for update
  using (public.is_staff());
