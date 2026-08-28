-- Betterson — submission intake schema
-- Run once in the Supabase SQL Editor (Project → SQL Editor → New query).
-- Safe to re-run: every statement is guarded.

-- ---------------------------------------------------------------- table
create table if not exists public.benefit_submissions (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),

  -- Set by the database, never by the submitter. A submission is only ever
  -- 'submitted' until a human moves it on. See the column grant below.
  status           text not null default 'submitted'
                   check (status in ('submitted','reviewing','live','rejected')),

  -- the benefit
  name             text not null check (char_length(name) between 1 and 200),
  provider         text not null check (char_length(provider) between 1 and 200),
  category         text not null check (category in
                     ('Dining','Shopping','Experience','Transportation','Social Support')),
  description      text not null check (char_length(description) between 1 and 4000),
  eligibility      text not null,
  duration         text not null check (duration in ('Ongoing','Limited','Not sure')),
  ends             date,
  where_used       text not null check (where_used in ('On campus','Off campus','Virtual')),
  used_personally  text not null,
  link             text check (link is null or char_length(link) <= 2000),
  redeem           text check (redeem is null or char_length(redeem) <= 500),
  photo_path       text,

  -- the submitter
  first_name       text not null check (char_length(first_name) between 1 and 100),
  last_initial     text not null check (char_length(last_initial) = 1),
  email            text not null check (email ~* '@(anderson\.ucla\.edu|g\.ucla\.edu|ucla\.edu)$'),
  credit           boolean not null default false,

  -- Computed, so a submitter can't award themselves priority in the queue.
  trusted          boolean generated always as (email ilike '%@anderson.ucla.edu') stored
);

create index if not exists benefit_submissions_triage
  on public.benefit_submissions (status, trusted desc, created_at desc);

-- ------------------------------------------------------------------ RLS
alter table public.benefit_submissions enable row level security;

drop policy if exists "anyone may submit" on public.benefit_submissions;
create policy "anyone may submit"
  on public.benefit_submissions
  for insert to anon
  with check (true);

-- No select/update/delete policy exists, so the publishable key cannot read
-- back a single row. Submissions are visible only in the dashboard.

-- --------------------------------------------------------------- grants
-- "Automatically expose new tables" is off, so privileges are explicit.
grant usage on schema public to anon;

-- Column-level: `status`, `id`, `created_at` and `trusted` are deliberately
-- absent, so a submission cannot arrive pre-approved.
grant insert (
  name, provider, category, description, eligibility, duration, ends,
  where_used, used_personally, link, redeem, photo_path,
  first_name, last_initial, email, credit
) on table public.benefit_submissions to anon;

-- -------------------------------------------------------------- storage
insert into storage.buckets (id, name, public)
values ('submission-photos', 'submission-photos', false)
on conflict (id) do nothing;

drop policy if exists "anyone may upload a submission photo" on storage.objects;
create policy "anyone may upload a submission photo"
  on storage.objects
  for insert to anon
  with check (bucket_id = 'submission-photos');

-- Private bucket, insert only: uploads work, nobody can list or read them
-- with the publishable key.
