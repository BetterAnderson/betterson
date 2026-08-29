-- Betterson — migration 02
-- The form was asking students to describe a benefit we can read off the link
-- ourselves. Now only the link and who they are are required; everything about
-- the benefit is optional. The database has to agree, or every submission
-- fails on a NOT NULL.
--
-- Run once in the Supabase SQL Editor. Safe to re-run.
--
-- NOTE: the last statement makes `link` required. If you still have rows from
-- before this change with no link, it will error — clear those rows first
-- (Table Editor → benefit_submissions), then run it again.

-- ------------------------------------------------- benefit fields optional
alter table public.benefit_submissions
  alter column name            drop not null,
  alter column provider        drop not null,
  alter column category        drop not null,
  alter column description     drop not null,
  alter column eligibility     drop not null,
  alter column duration        drop not null,
  alter column where_used      drop not null,
  alter column used_personally drop not null;

-- The existing CHECK constraints need no change: in SQL a check passes unless
-- it evaluates to FALSE, and anything compared against NULL yields NULL. So
-- category IN (...) still rejects 'Crypto' and still allows a blank.
-- What it does NOT allow is an empty string, which is why the client sends
-- null rather than "" for a field left blank.

-- ---------------------------------------------------------- link required
-- It's the one thing we can't derive, so it carries the whole submission.
update public.benefit_submissions set link = null where link = '';

alter table public.benefit_submissions
  alter column link set not null;

alter table public.benefit_submissions
  drop constraint if exists benefit_submissions_link_check;

alter table public.benefit_submissions
  add constraint benefit_submissions_link_check
  check (link ~* '^https?://' and char_length(link) <= 2000);
