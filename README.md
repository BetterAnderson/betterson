# Betterson

A public website where a UCLA Anderson student can browse every free or discounted
resource they're eligible for — dining, shopping, experiences, transportation —
filtered by who they are, where they are, and whether the benefit is permanent or
temporary. Every listing shows the date we last verified it and links to its source.

Built for the UCLA Anderson Build-a-thon.

## Running it

**You need a local server. Opening `index.html` by double-clicking will not work** —
the catalog is loaded from a separate file at runtime, and browsers block that when
a page is opened directly from disk. You'll get an error message instead of the site.

```bash
python3 scripts/serve.py
```

Then open http://localhost:8000. Pass a number to use a different port
(`python3 scripts/serve.py 3000`).

Any static server works, but this one turns off browser caching, so an edit to the
CSS or JS shows up on refresh instead of silently doing nothing.

## What's here

```
index.html            Browse — the catalog
about.html            About
add.html              Add a benefit
partners.html         For businesses
css/styles.css        All styles, shared by every page
js/app.js             Browse page logic
data/benefits.json    The catalog
scripts/serve.py      Local dev server
docs/PRD.md           Full product spec
```

## What's real and what isn't

- **The catalog is real.** 54 verified listings, each with a working source link.
- **Anderson-only benefits are thin.** Four entries so far. The rest have to be pulled from internal channels rather than the public web, and they are the most valuable content the site could carry.
  web — someone on the team has to pull them from internal channels. This is the
  most valuable missing content.
- **The Add a benefit form works, but submissions go nowhere yet.** Every field
  validates, the UCLA email domain check is live, and the success state is real —
  but `submitBenefit()` in `js/form.js` still needs a Supabase call behind it.
  Nothing is stored today.
- **Email validation is client-side only.** A production version would have to
  re-check the domain server-side and send a confirmation email; a check that runs
  in the browser is trivially bypassed. Submissions are also never auto-published —
  they land as `status: submitted` for a human to review.
- **For businesses takes enquiries by email, not a form.** Nothing is being sold
  yet, so a form asking for budget ranges would imply a pipeline that doesn't
  exist. The audience statistics block is deliberately empty until someone pulls
  real figures from Anderson's published class profile. We're not estimating them.
- **Sharing a single benefit works by URL** (`/?benefit=bruin-grad-pass` opens that
  benefit directly), but there's no share button yet.

## How listings stay trustworthy

Two rules are enforced in code, not by memory:

- A listing with no verified date never renders.
- A time-limited listing stops rendering the day after it expires.

Both live in `publishable()` in `js/app.js`. A benefit that goes stale disappears
on its own rather than sitting there being wrong.

## Editing the catalog

`data/benefits.json` holds every listing. The field names are short (`t` for title,
`p` for provider, and so on) — the full shape is documented in `CLAUDE.md`.

Content is maintained in Airtable and exported from there. Nothing goes in without
a real, working source URL.
