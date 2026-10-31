-- Reader login, seen list, and comments.
-- Run once in the Supabase SQL editor.
-- Replace the owner email below with yours before running.

create schema if not exists private;

create table if not exists private.owner (
  email text primary key
);

revoke all on schema private from public, anon, authenticated;
revoke all on table private.owner from public, anon, authenticated;

insert into private.owner (email)
values ('chanankub@gmail.com')
on conflict (email) do nothing;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.owner as owner_row
    where lower(owner_row.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_owner() from public, anon;
grant execute on function public.is_owner() to authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  created_at timestamptz not null default now(),
  constraint profiles_nickname_len check (
    char_length(btrim(nickname)) between 1 and 40
    and char_length(nickname) <= 40
  )
);

create table if not exists public.reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('poem', 'story', 'note')),
  slug text not null,
  title text not null,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  unique (user_id, kind, slug)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('poem', 'story', 'note')),
  slug text not null,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  visibility text not null check (visibility in ('public', 'private')),
  created_at timestamptz not null default now()
);

create index if not exists comments_public_kind_idx
  on public.comments (kind, slug)
  where visibility = 'public';

alter table public.profiles enable row level security;
alter table public.reads enable row level security;
alter table public.comments enable row level security;

revoke all on public.profiles from anon;
revoke all on public.reads from anon;
revoke all on public.comments from anon;

grant select, insert on public.profiles to authenticated;
grant select, insert, update on public.reads to authenticated;
grant select, insert, delete on public.comments to authenticated;

drop policy if exists "profiles are readable when signed in" on public.profiles;
create policy "profiles are readable when signed in"
  on public.profiles
  for select
  to authenticated
  using (true);

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "read own visits" on public.reads;
create policy "read own visits"
  on public.reads
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "insert own visit" on public.reads;
create policy "insert own visit"
  on public.reads
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.profiles as profile
      where profile.id = auth.uid()
    )
  );

drop policy if exists "update own visit" on public.reads;
create policy "update own visit"
  on public.reads
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "read allowed comments" on public.comments;
create policy "read allowed comments"
  on public.comments
  for select
  to authenticated
  using (
    visibility = 'public'
    or user_id = auth.uid()
    or public.is_owner()
  );

drop policy if exists "insert own comment" on public.comments;
create policy "insert own comment"
  on public.comments
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.profiles as profile
      where profile.id = auth.uid()
    )
  );

drop policy if exists "delete own comment or owner" on public.comments;
create policy "delete own comment or owner"
  on public.comments
  for delete
  to authenticated
  using (user_id = auth.uid() or public.is_owner());
