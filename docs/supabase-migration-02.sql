-- Betterson — migration 02
-- The form was asking students to describe a benefit we can read off the link
-- ourselves. Now only the link and who they are are required; everything about
-- the benefit is optional. The database has to agree, or every submission
-- fails on a NOT NULL.
--
-- RUN THESE ONE AT A TIME, top to bottom, in the Supabase SQL Editor.
-- Deliberately not one block: a single transaction rolls back entirely if any
-- statement fails, which hides which one it was. Each step below stands alone
-- and each is safe to re-run.


-- ===========================================================================
-- STEP 1 — make the benefit fields optional
-- This is the one that matters. With just this, submissions start working.
-- ===========================================================================
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


-- ===========================================================================
-- STEP 2 — clear rows that predate the link requirement
-- Anything submitted before this change may have no link, which would block
-- step 3. At this stage that is all test data.
-- Check first if you want to see what you're removing:
--   select count(*) from public.benefit_submissions where link is null;
-- ===========================================================================
delete from public.benefit_submissions
where link is null or link = '';


-- ===========================================================================
-- STEP 3 — make the link required
-- It's the one thing we can't derive, so it carries the whole submission.
-- ===========================================================================
alter table public.benefit_submissions
  alter column link set not null;


-- ===========================================================================
-- STEP 4 — and make sure it's actually a URL
-- ===========================================================================
alter table public.benefit_submissions
  drop constraint if exists benefit_submissions_link_check;

alter table public.benefit_submissions
  add constraint benefit_submissions_link_check
  check (link ~* '^https?://' and char_length(link) <= 2000);
