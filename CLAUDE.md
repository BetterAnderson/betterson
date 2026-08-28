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
3. **Never invent a benefit.** Every listing needs a real, working source URL (the `u` field). If it can't be verified against a source, it doesn't go in. A wrong entry costs more than a missing one.
4. **No build step.** This is plain HTML, CSS, and vanilla JS, deployed as static files. Do not introduce React, a bundler, or a framework without being asked. The absence of a build step is deliberate — it means nothing can break on demo day. (`scripts/serve.py` is a dev convenience, not a build step — it serves the same files that ship.)

## Stack

- Plain HTML / CSS / vanilla JS. No framework, no build.
- Data: `data/benefits.json`, loaded at runtime with `fetch`.
- Fonts: Archivo + Archivo Black (headings, labels) and Source Sans 3 (body), from Google Fonts.
- Submission intake: Supabase (Postgres + Storage) for the Add a Benefit form. Live. Schema and policies in `docs/supabase-setup.sql`.
- Business inquiries: a mailto link on For Businesses, not a form. No placements are being sold, so a form collecting budget ranges would promise a sales process that doesn't exist. The address is assembled by a small inline script so it isn't in the markup as one string. Switch to the PRD §7.4 form if real inbound ever justifies structured fields.
- Hosting: Vercel, auto-deploying from `main`.
- Maps (future, not now): Leaflet + OpenStreetMap. No Google Maps, no API keys.

## Running it

The catalog is fetched at runtime, which browsers block on `file://` — opening `index.html` directly shows an error, not the site. Serve it:

```
python3 scripts/serve.py        # http://localhost:8000
```

Any static server works. This one also sends no-cache headers, so a CSS or JS edit shows up on refresh instead of silently doing nothing.

## Repo layout

```
/index.html            Browse — the catalog
/about.html            About
/add.html              Add a benefit — submission form
/partners.html         For businesses
/css/styles.css        All styles, shared by every page
/js/app.js             Browse page logic
/js/form.js            Add a benefit — validation and submission
/data/benefits.json    The catalog — generated from Airtable
/img/logos/            Brand logo files — see the README in there
/scripts/serve.py      Local dev server (no-cache static)
/README.md             What this is, how to run it, what's stubbed
/docs/PRD.md           Full product spec
/.claude/launch.json   Preview server config
```

Not written yet, and named in the PRD: `/scripts/import.js` (Airtable CSV → benefits.json).

## Design system

The Anderson colors are the brand and don't change. Everything else — neutrals, backgrounds, darkened variants — can be added when there's a reason, as long as it goes in `:root` as a named token first. **Never write a raw hex outside `:root`.** If a color needs to exist, it needs a name and a comment saying what it's for.

```
--navy-deep:#000729  --blue-mid:#205F94   --blue-bright:#007DB7    ← Anderson, fixed
--gold:#FDE403       --red-orange:#F64A01 --green:#6DA691
--off-white:#EDEFF0  ← currently unused; --sand replaced it as the page ground

--sand:#F7F2EB       ← warm page background. Not an Anderson color; a deliberate
                       team choice over --off-white, which read grey and dated.
--blue-press --on-blue --on-green --on-orange --gold-edge
                     ← darkened twins of the palette. The base colors are tuned
                       for fills and fail contrast as text or hairline borders.
```

**The page is light.** `--sand` ground, white surfaces (`--surface`) for the top bar, category bar, and cards, navy text. Shadows are warm-toned — a cool navy shadow goes muddy over sand.

- `--gold` fails contrast on white. Use it only on navy, or as a fill behind navy text. Current uses: the active nav pill, and the Dining tint.
- **Category tiles are the signature element.** 24px radius, echoing Anderson's program tiles — don't flatten it. Each tile is a soft *wash* of its category color, mixed so all five share a lightness and read as one set; text and icons stay navy so legibility never depends on the tint. Selecting one deepens its wash and adds a border in the full-strength color, so exactly one tile carries strong color at a time.
- Category colors: Dining gold, Shopping red-orange, Experience bright blue, Transportation green, Social Support violet. Full strength on card top borders and value pills; as washes on tiles.
- **Social Support** covers things that aren't a discount on a purchase — food assistance, legal help, utility relief. It exists because CalFresh in "Dining" and legal aid in "Experience" would both be lies. `--violet` is not an Anderson color; the set has no distinct fifth hue.
- Duration tags: green = Ongoing, red-orange = Limited.

## Layout

- **Top bar is sticky** — brand, search, nav. Search is the first thing on the page and stays reachable while scrolling.
- **Category tiles sit directly under it**, in their own white band. Browse has no hero; it goes search → categories → benefits. There is a visually hidden `<h1>` so the page still announces a heading.
- **Filters live in a left sidebar on desktop**, styled as a table of contents: one row per option with a live count, a colored left bar when active. Below 768px the sidebar is replaced by a Filters button opening a bottom sheet with the same rows.
- Counts are faceted — they respond to the other groups' selections but not to their own, so choosing "Ongoing" doesn't zero out "Limited".
- Breakpoints: **1024px** (sidebar + multi-column grid above) and **768px** (bottom sheets, single column below).
- Detail views are a centered modal on desktop and a full-height bottom sheet on phones.

## The submission form

`add.html` + `js/form.js`. Spec is PRD §6.

- Validation runs **on blur and on submit, never on keystroke** — correcting someone mid-word is hostile. Once a field is showing an error it clears as soon as they start fixing it.
- Errors sit against the field they belong to. Never one generic banner; the line above the button only counts how many fields need attention.
- "Not sure" is a valid answer for eligibility and duration. Removing that escape doesn't produce better data, it produces confident-looking wrong data.
- Credit is a required radio with no default, and shows the exact line the listing will carry — *Added by Jane D.* or *Added by a fellow Bruin*.
- Email must end in `@anderson.ucla.edu`, `@g.ucla.edu` or `@ucla.edu`. Checked with a full-segment match, so `@fake.ucla.edu` and `@ucla.edu.evil.com` are both rejected. `trusted` is computed by the database from the domain, not sent by the browser — a submitter can't promote themselves up the queue.
- Spam: a honeypot (`#website`) and a 60-second rate limit. A filled honeypot shows the success screen and stores nothing — never tell a bot it failed.

### How a submission becomes a listing

**Nothing in Supabase reaches the site.** The catalog is `data/benefits.json` in this repo, and `js/app.js` never mentions Supabase. Submissions cannot appear publicly by accident, misconfiguration, or a wrong click — the wire does not exist.

**`status` is decorative.** Nothing reads it. Setting a row to `live` in Supabase publishes nothing; it's a note-to-self for tracking what's been reviewed. Don't mistake it for a publish switch.

Approving one is manual, on purpose:

1. Read the submission in the Supabase dashboard.
2. **Verify it against a real source.** This is the work. A submission is a claim; a listing needs a working `u` and a `vd`. The form's link field is optional, so plenty arrive with nothing to check — find the source or drop the entry.
3. Add it to `data/benefits.json` (or to Laura's Airtable, which generates it).
4. Commit and push.

Left manual deliberately: volume is low, and a script that publishes unverified entries would break the one rule the product is built on. When it's worth automating, `scripts/import.js` should merge the Airtable export with approved Supabase rows — keeping `benefits.json` as what the site reads, so the catalog survives Supabase having a bad day. That script would need a key that can read, i.e. `service_role`, in an environment variable and never in the repo.

- **Storage:** live. `submitBenefit()` posts to Supabase with plain `fetch` — no client library, nothing loaded at page open. The publishable key is in client code on purpose; RLS carries the weight. The database re-checks the email domain, category, duration, location and initial, so the browser check is a courtesy and the database check is the one that holds. Production would still want a confirmation email.

## Data shape

Every benefit in `benefits.json`:

```json
{
  "id": "bruin-grad-pass",
  "t": "Bruin Grad Pass",
  "p": "UCLA Transportation",
  "c": "Transportation",
  "ic": "bus",
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

- `c` (category) is one of: Dining · Shopping · Experience · Transportation · Social Support
- `ic` (icon) is **optional** — the mark shown on the card, keyed to `BENEFIT_ICON` in `js/app.js`. Leave it out and the entry falls back to its category icon; an unrecognised value does the same. Pick by what the benefit *is* (bus, printer, scales), not by who provides it: 27 of 41 listings come from a UCLA-family provider, so a provider mark would make two-thirds of the catalog look identical. Add a new key to `BENEFIT_ICON` rather than reaching for a logo.
- Real brand marks live in `BRAND_ICON` — filled paths in the brand's own colour, on a white badge. Only for the company actually behind the offer (`apple`, `mcdonalds`, `spotify` so far). They come from [Simple Icons](https://simpleicons.org), whose SVGs are CC0; the trademarks stay with their owners. Adding one means pasting a single path, not committing an image file — keep it that way, so there are no binaries in the repo and no requests at page load.
- Brands Simple Icons doesn't carry are listed in `BRAND_FILE` and load from `img/logos/<ic>.svg`, falling back to `.png` and then to a type icon. A missing or misnamed file therefore renders as a normal card, never a broken image. Check simpleicons.org before adding a file.
- `e` (eligibility) is one of: Anderson · All UCLA · Grad student · Any student ID · LA resident · CA resident
- Source URLs must be `https://`. An `http://` link on an HTTPS site is a bad look and some of them get blocked.
- `d` (duration) is Ongoing or Limited. Limited **requires** `exp`, and expired entries must never render.
- `vd` is the last-verified date and displays on every card. This is the product's core trust mechanism — never render a listing without it.
- `lat` / `lng` are nullable placeholders for a future map. Leave them in.

Both trust rules are enforced in code, not by memory: `publishable()` in `js/app.js` drops any entry missing `vd` or past its `exp` before the page ever sees it. Keep that gate — it's why a benefit going stale can't quietly stay on screen.

## URL state

The address bar always describes what's on screen, so any view can be shared:

```
/?cat=Dining&elig=Grad+student&benefit=bruin-grad-pass
```

- Filters and search are in the query string; opening the link restores them.
- `benefit=<id>` opens that detail view on load. An unknown or delisted id is dropped silently and the page renders normally — a shared link to something since removed degrades to a working page, never an error.
- Opening a detail view pushes a history entry, so Back closes it rather than leaving the site.

## Conventions

- Write plain, accessible HTML. Real buttons and labels, visible keyboard focus, `prefers-reduced-motion` respected.
- Escape all interpolated data before it reaches `innerHTML` (`esc()` in `js/app.js`). The catalog is repo-controlled today, but it's generated from Airtable.
- Desktop-primary (~60% of traffic) with full mobile parity (~40%). Nothing is unavailable on a phone. Touch targets 44px minimum below 768px.
- Interface copy: sentence case, plain verbs, active voice. A button that says "Copy link" produces a toast that says "Link copied." Errors say what went wrong and how to fix it, and never apologize.
- Commit messages: short and imperative — "Add filter state to URL", not "updated stuff".

## When in doubt

Ask before adding a dependency, changing the data shape, or introducing a build step. Prefer the boring option — this project's value is that it works and its content is correct, not that it's clever.
