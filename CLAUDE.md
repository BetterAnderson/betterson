# CLAUDE.md — Betterson

Project context for Claude Code. Read this first in every session.

## What this is

Betterson is a public website that centralizes the free and discounted resources a UCLA Anderson student is eligible for — dining, shopping, experiences, transportation. Built for the Anderson Build-a-thon, one week, judged.

The full specification is in `docs/PRD.md`. **Read it before making product decisions.** This file covers how to work in the repo; the PRD covers what to build and why.

## Team

- **Laura** — strategy and content. Owns the benefits catalog. Works in Airtable, does not use git.
- **[Your name]** — product and engineering. Owns the codebase. Sole committer.

## Non-negotiable rules

1. **Never commit secrets.** No API keys, no `.env` files, no Supabase service-role key. The Supabase anon key is safe in client code *only* because Row Level Security is enabled — never disable RLS.
2. **Never commit student submissions.** Names, emails, and uploaded photos live in Supabase, never in the repo. Only verified, published listings go into `data/benefits.json`, and those contain no submitter contact details.
3. **Never invent a benefit.** Every listing needs a real, working `source_url`. If it can't be verified against a source, it doesn't go in. A wrong entry costs more than a missing one.
4. **No build step.** This is plain HTML, CSS, and vanilla JS, deployed as static files. Do not introduce React, a bundler, or a framework without being asked. The absence of a build step is deliberate — it means nothing can break on demo day.

## Stack

- Plain HTML / CSS / vanilla JS. No framework, no build.
- Data: `data/benefits.json`, loaded at runtime with `fetch`.
- Submission intake: Supabase (Postgres + Storage) for the Add a Benefit form.
- Business inquiries: Formspree for the For Businesses form.
- Hosting: Vercel, auto-deploying from `main`.
- Maps (future, not now): Leaflet + OpenStreetMap. No Google Maps, no API keys.

## Repo layout

```
/index.html            Browse — the catalog
/about.html            About
/add.html              Add a benefit (submission form)
/partners.html         For businesses
/css/styles.css        All styles, shared
/js/app.js             Browse page logic
/js/form.js            Form validation and submission
/data/benefits.json    The catalog — generated from Airtable
/scripts/import.js     Airtable CSV -> benefits.json
/docs/PRD.md           Full product spec
```

## Design system

Colors are sampled from UCLA Anderson's site and are fixed. Use the CSS variables, never raw hex:

```
--navy-deep:#000729  --blue-mid:#205F94   --blue-bright:#007DB7
--gold:#FDE403       --red-orange:#F64A01 --green:#6DA691
--off-white:#EDEFF0
```

- `--gold` fails contrast on white. Use it only on navy, or as a fill behind navy text.
- Category tiles use a 24px radius. This echoes Anderson's program tiles and is the signature element — don't flatten it.
- Category colors: Dining gold, Shopping red-orange, Experience bright blue, Transportation green.
- Duration tags: green = Ongoing, red-orange = Limited.

## Data shape

Every benefit in `benefits.json`:

```json
{
  "id": "bruin-grad-pass",
  "t": "Bruin Grad Pass",
  "p": "UCLA Transportation",
  "c": "Transportation",
  "v": "$25 per quarter for unlimited...",
  "e": "Grad student",
  "d": "Ongoing",
  "loc": "Off campus",
  "r": "Register on the transit portal...",
  "u": "https://...",
  "vd": "2026-08-25",
  "exp": null,
  "lat": null,
  "lng": null,
  "n": "Notes..."
}
```

- `e` (eligibility) is one of: Anderson · All UCLA · Grad student · Any student ID · LA resident · CA resident
- `d` (duration) is Ongoing or Limited. Limited **requires** `exp`, and expired entries must never render.
- `vd` is the last-verified date and displays on every card. This is the product's core trust mechanism — never render a listing without it.
- `lat` / `lng` are nullable placeholders for a future map. Leave them in.

## Conventions

- Write plain, accessible HTML. Real buttons and labels, visible keyboard focus, `prefers-reduced-motion` respected.
- Desktop-primary (~60% of traffic) with full mobile parity (~40%). Nothing is unavailable on a phone.
- Interface copy: sentence case, plain verbs, active voice. A button that says "Copy link" produces a toast that says "Link copied." Errors say what went wrong and how to fix it, and never apologize.
- Commit messages: short and imperative — "Add filter state to URL", not "updated stuff".

## When in doubt

Ask before adding a dependency, changing the data shape, or introducing a build step. Prefer the boring option — this project's value is that it works and its content is correct, not that it's clever.
