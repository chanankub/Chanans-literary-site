-- Allow a comment thread on the about page.
-- Run once in the Supabase SQL editor.

do $$
declare
  constraint_name text;
begin
  select con.conname into constraint_name
  from pg_constraint as con
  join pg_class as rel on rel.oid = con.conrelid
  join pg_namespace as nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'comments'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) ilike '%kind%';

  if constraint_name is not null then
    execute format(
      'alter table public.comments drop constraint %I',
      constraint_name
    );
  end if;
end $$;

alter table public.comments
  add constraint comments_kind_check
  check (kind in ('poem', 'story', 'note', 'about'));
