# Betterson — PRD v3.2 (Build-a-thon scope)

**Event:** UCLA Anderson Build-a-thon
**Timeline:** 1 week to a demo-able version
**Platform:** Web — desktop-primary (~60% of expected traffic) with full mobile parity (~40%). No native app.
**Supersedes:** v3.1, v3.0, v2.0 · Automation design retained in v1.1

> **Scope note.** This is a judged demo, not a production launch. Everything below is sized to be genuinely buildable in a week and genuinely demonstrable in three minutes.

---

## 1. What we're building

A public website where a UCLA Anderson student can browse every free or discounted resource they're eligible for, filtered by category, eligibility, location, and whether the benefit is permanent or temporary — plus three supporting pages that show the product has been thought through as a product, not just a list.

**Demo success:** a judge opens the site on their phone, filters to something relevant to them, finds a benefit they didn't know they had, and shares it to a group chat in two taps.

---

## 2. Site map

| Page | Nav label | Purpose |
|---|---|---|
| `/` | **Browse** | The catalog. Search, filter, share. |
| `/about` | **About** | Mission, the problem, the team. |
| `/add` | **Add a benefit** | Student submission form. |
| `/partners` | **For businesses** | Reaching Anderson students. Monetization. |

### 2.1 On the two naming questions

**"Make it Better" → nav label "Add a benefit."** The interface should name things by what the person controls. A student scanning a nav bar for where to report a missing benefit will find "Add a benefit" instantly and "Make it Better" not at all. Keep the brand line — use *"Make it better"* as the page's H1, with "Add a benefit" as the nav label and the button text. Brand in the headline, plain verb in the navigation.

**"Contact Us" → "For businesses."** The page's job is to pitch a channel, and "Contact Us" reads as a support address. Alternatives worth considering: *Partner with us*, *Reach Anderson*, *For businesses*. The last is the plainest and signals the audience split immediately — students know it isn't for them, businesses know it is. Judges see the monetization thinking in the nav bar without opening anything.

Other labels are unchanged: a person looking for the mission looks under "About."

---

## 3. Cross-device requirement (anchored)

**Desktop-primary, mobile-complete.** Expected traffic is roughly 60/40 desktop to mobile. Design decisions are made for the desktop reading experience first — wider grids, inline filters, more visible at once — and mobile gets the same capabilities in a layout that fits, not a reduced version of the product.

The distinction that matters: this is not "mobile-first," where the small screen constrains the design. It's parity. Nothing is unavailable on a phone, and nothing about the desktop layout is compromised to accommodate one.

**Requirements:**
- Full functionality from 360px through 1440px+. No feature hidden or dropped at any width.
- **Desktop (≥1024px):** filters inline and always visible, multi-column card grid, centered modal for detail views. This is the layout to polish first — most judges will evaluate on a laptop.
- **Tablet (768–1023px):** filters remain inline, grid reflows to two columns.
- **Mobile (<768px):** filters collapse into a "Filters" button opening a bottom sheet with an active-count badge; category tiles reflow to two across with "Everything" full width; detail views become full-height bottom sheets. Search reachable without scrolling on first paint.
- Touch targets minimum 44×44px wherever the interface is used on a phone.
- Respect `prefers-reduced-motion`. Visible keyboard focus throughout.

**Verification step:** check the real site on at least one physical iOS and one Android phone before demo day. Device emulation misses touch-target and sheet-scroll problems. Mobile being the smaller share of traffic doesn't make it the smaller share of embarrassment if it breaks on stage.

---

## 4. Share a benefit — *deferred*

> **Status:** deferred by the team; specced here so it isn't re-derived later. The per-benefit URL work in §4.1 is worth doing early regardless, since it's a prerequisite and cheap.

Every benefit is individually shareable. This is how the product spreads without a login, and it is the feature most likely to be exercised live by a judge.

### 4.1 Prerequisite — per-benefit URLs

Currently only filter state is encoded in the URL. Sharing requires each benefit to have its own address:

```
/?benefit=bruin-grad-pass
```

Opening that URL loads the site with that benefit's detail view already open. Without this, a shared link lands on an unfiltered homepage and the feature is pointless. **Build this first; the share UI is trivial once it exists.**

### 4.2 Behavior

- **Share control** on the detail view, and a small share icon on each card.
- **Mobile:** invoke the Web Share API (`navigator.share`). This opens the native sheet, which already contains WhatsApp, Slack, Messages, and everything else the student has installed. No per-app integration needed — this is the whole reason to use it.
- **Desktop / unsupported browsers:** fall back to a small menu — Copy link · Email · WhatsApp. Copy link is the primary action.
- **Prefilled text:** `"UCLA students get [benefit] — [link]"`. Short enough to survive a paste into Slack without wrapping.
- **Confirmation:** "Link copied" toast, dismissing after ~2 seconds. The button that says "Copy link" produces a toast that says "Link copied" — same word, both places.

Native per-app integrations (a Slack app, a WhatsApp Business hook) are explicitly out of scope. The Web Share API covers them for free.

---

## 5. Page: About

Three sections, in this order.

**Mission.** One or two sentences. Something close to: *Every Anderson student is entitled to more than they know about. Betterson puts all of it in one place, and tells you when we last checked.*

**The problem.** Objective and factual, not a takedown. The information exists but is distributed across university department pages, student government sites, transit authorities, public libraries, and national brand programs — each maintained separately, for different audiences, with no shared index. UCLA's central discounts page is oriented toward employees. A student would have to already know a benefit exists in order to find it. State this neutrally; the fragmentation is a structural artifact of how universities are organized, not anyone's failure, and describing it that way is both more accurate and more credible to a judge.

**How we keep it current.** Short paragraph on the verified-date model and the source link on every listing. This is what separates the product from a blog post, so it belongs on the About page rather than buried.

**Team.** Placeholder blocks — photo, name, program, one line each. Content to be supplied by the team. Keep the layout tolerant of 3–6 members.

---

## 6. Page: Add a benefit

**H1:** "Make it better."
**Sub:** "Found something we're missing? Tell us and we'll verify it and add it."

### 6.1 Fields

Twelve required fields is a lot to face as a single column. Split the form into two visible steps so it reads as two short tasks rather than one wall. Both steps are on the same page — no wizard, no navigation between them.

**Step 1 — The benefit** (all required)

| Field | Type | Notes |
|---|---|---|
| Benefit name | Text | Short title |
| Provider / business | Text | Separate from the description — a distinct data field, and asking for it separately saves manual cleanup |
| Category | Select | Dining · Shopping · Experience · Transportation |
| Description | Textarea | Under 200 words, with a live word counter |
| Who can use it | Select | Anderson · All UCLA · Grad student · Any student ID · LA resident · CA resident · Not sure |
| How long it lasts | Radio | Ongoing · Limited · Not sure. Selecting Limited reveals a required end-date field. |
| Where | Select | On campus · Off campus · Virtual |
| Have you used this yourself? | Radio | Yes, personally · No, heard about it · No, saw it advertised |

**Step 2 — About you** (all required)

| Field | Type | Notes |
|---|---|---|
| First name | Text | |
| Last initial | Text, 1 char | |
| UCLA email | Email | Domain-validated, see §6.2 |
| Credit me on the listing | Radio — Yes / No | See the note below on why this is a radio, not a checkbox |

**Optional**

| Field | Type | Notes |
|---|---|---|
| Link | URL | Where they found it |
| Photo | File upload | For offline finds — a window sign, a printed flyer. JPG/PNG/HEIC, max 10MB, single file. |
| How to redeem | Text | "Show BruinCard," "use code," etc. |

**Two notes on making these required:**

**Keep "Not sure" as a valid choice** on eligibility and duration. Required should mean the submitter has to *answer*, not that they have to *guess*. Removing the escape hatch doesn't produce better data — it produces confident-looking wrong data, which is worse than a flagged unknown, because the reviewer no longer knows which entries need checking. "Where" is concrete enough that a student can always answer it, so it needs no escape.

**"Credit me" should be a required radio, not a required checkbox.** A checkbox you're forced to tick isn't consent — it's a term of service. As a Yes/No radio, the answer is required but either answer is acceptable, which is what you actually want: a deliberate attribution decision on every submission, made by the person whose name it is. Default neither option selected.

**Attribution display.** The credit line keeps the same sentence shape either way, so the listing never looks like it's missing data:

| Answer | Listing shows |
|---|---|
| Yes | *Added by Jane D.* |
| No | *Added by a fellow Bruin* |

Considered and rejected: "Mysterious Bruin." It's charming on first read and tiring by the tenth listing, and on a product whose whole argument is that its information can be trusted, *mysterious* pulls against the tone. "A fellow Bruin" is warm, communal, and stays invisible in the way good interface copy should.

Two rules that go with it:

- **The line only appears on student-submitted entries.** Entries the team sourced directly show no attribution line at all. Labeling team research as "Added by a fellow Bruin" would be false, and the distinction is worth preserving — it lets a visitor see that real students contribute here.
- **The string never varies.** No rotating alternates, no randomized flavor text. One label, used consistently, is how it reads as a system rather than a joke.

**Why each promoted field earns being required:**

- **Eligibility, duration, where** — these map one-to-one onto the site's filters. Collecting them at submission means an entry is publishable straight after verification instead of needing a second round of questions with someone who's moved on.
- **"Have you used this yourself?"** — the highest-value question on the form. A firsthand redemption is much stronger evidence than a rumor, and it lets the team triage the review queue by confidence rather than by arrival order. Costs one tap.
- **Attribution** — a credit line is real motivation to contribute, and settling it upfront avoids chasing consent later.

**Do not add:** phone number, student ID number, year of graduation. None are used, and collecting personal data you don't need is a bad look in a product judged partly on thoughtfulness.

### 6.2 Email validation

The submission email must end in one of:

```
@anderson.ucla.edu
@g.ucla.edu
@ucla.edu
```

Any other domain is rejected.

**Trust tiering.** `@anderson.ucla.edu` submissions are marked higher-trust in the review queue and sort to the top. The other two are accepted and reviewed normally. This keeps the Anderson signal without turning a secondary email address into a rejection.

**Behavior:**
- Validate on blur and again on submit, not on every keystroke — mid-typing errors are hostile.
- Rejection copy names the rule and the fix, without apologising or being vague: *"Submissions need a UCLA address — @anderson.ucla.edu, @g.ucla.edu, or @ucla.edu. This helps us check where a benefit came from."*
- Client-side validation only for the demo. Note in the README that production would need server-side revalidation plus a confirmation email, since a client-side check is trivially bypassed. Saying so demonstrates you know the difference.

### 6.3 States

- **Empty:** the form itself, with a line on what happens next — "We check every submission against its source before it goes live. Usually a few days."
- **Success:** replace the form with a confirmation naming what was submitted, and a link back to Browse. No modal.
- **Error:** inline, next to the offending field, in the interface's voice. Never a single generic banner.

### 6.4 Backend (demo scope)

Submissions can write to a Google Form backend, an Airtable base, or a simple JSON endpoint — whatever the team can stand up fastest. Submitted entries land as `status: submitted` and never appear on the public site until a human moves them to `live`. No auto-publishing, even in the demo. Basic spam protection: a honeypot field and a submission rate limit.

---

## 7. Page: For businesses

**Purpose:** demonstrate that the team thought about how this sustains itself. Written for a business, but performing for a judge.

### 7.1 The pitch

Lead with the audience, not the product. Anderson students are a concentrated, high-intent, high-disposable-income group who are frequently new to Los Angeles and actively deciding which gym, grocery, bank, and restaurants to make routine. They form those habits within the first quarter and keep them for two years and often well beyond. That window is the asset.

**Numbers to fill in from Anderson's published class profile:** enrollment across programs, average age, pre-MBA industry mix, percentage relocating to LA. Do not estimate these — cite the official class profile or leave the block out. A judge from Anderson will spot an invented number instantly.

### 7.2 Placement inventory

Present as a tiered menu. It reads as a real business model rather than a vague "we could sell ads."

| Placement | What it is |
|---|---|
| **Homepage feature** | Hero placement on Browse. One partner at a time, rotating weekly. |
| **Category sponsorship** | A partner owns a category header — "Wellness, presented by [brand]." |
| **Featured listing** | A pinned card at the top of relevant filter results, labeled. |
| **Verified partner listing** | Enriched detail page — photos, full redemption steps, direct booking link. Free listings stay plain. |
| **Seasonal takeover** | Orientation week, start of quarter, finals. The highest-intent windows in the calendar. |
| **Co-created Anderson offer** | We work with the brand to build an offer exclusive to Anderson students, then feature it. |
| **Performance reporting** | Monthly report on views, clicks, and shares for the partner's listing. |

The most defensible of these is **co-created exclusive offers**. It's the only one that isn't advertising — it makes the catalog better for students at the same time as it serves the brand, so the incentives don't conflict. Lead the page with it rather than with the hero banner.

### 7.3 Editorial integrity (state this on the page)

A short, prominent commitment:

- Paid placements are always visibly labeled.
- Payment never affects the accuracy of any listing.
- Payment never changes the ranking or filtering of unpaid listings.
- We don't remove or suppress a benefit because a competitor pays us.

This costs nothing, takes four lines, and is exactly the kind of consideration the rubric's originality criterion rewards. It also pre-empts the obvious judge question: *doesn't taking money from businesses corrupt the list?*

### 7.4 Contact form

Business name · contact name · work email · company website · placements of interest (multi-select) · budget range (optional) · message. Same success and error patterns as §6.3.

Add one line of framing at the top of the page so nobody is misled: this is a Build-a-thon project and no placements are currently being sold. Being straight about that is better than letting a judge wonder.

---

## 8. Rubric alignment

The published rubric, and where the work sits against it:

| Criterion | Weight | What carries it |
|---|---|---|
| **Functionality & Execution** | 30% | Everything works, live, on a phone. No dead links, no placeholder text in a demo path, no expired listings on screen. Form validation actually validates. Share actually shares. |
| **Problem–Solution Fit** | 25% | A judge finds a benefit they personally didn't know about. The residency tiers are the strongest surprise generators. |
| **Design & UX** | 20% | Anderson palette and tile signature, mobile parity, considered empty and error states. |
| **Creativity & Originality** | 15% | The verified-date trust model, the Ongoing/Limited split, residency-based eligibility, and a monetization model with an integrity policy attached. |
| **Clarity of Demo/Comms** | 10% | See §8.2 — the rubric names the README explicitly. |

### 8.1 Where the marginal hour goes

Functionality is weighted highest and is also the easiest to lose points on, because judges click things. **One dead source link or one wrong price does more damage than three missing features.** Before adding anything new, re-verify every existing listing. That is the highest-expected-value hour available this week.

Problem–Solution Fit at 25% is won by content, not code. Five real Anderson-tier entries would move this score more than any feature on this list — and they're the only entries no competing team could produce.

### 8.2 README is a graded deliverable

The rubric names the README directly, so it isn't optional documentation. It should contain:

- What the product is, in two sentences.
- The problem, stated objectively.
- How to run it.
- What's real and what's stubbed — say plainly that Anderson-tier entries are placeholders and that email validation is client-side only. Judges find these anyway; naming them first reads as rigor rather than oversight.
- The freshness model, and how it would scale (point at the v1.1 two-stage pipeline).
- The business model, in a paragraph.
- What we'd build next.

### 8.3 Demo path

Rehearse one three-minute route and don't improvise:

1. Open on a phone. Land on Browse.
2. Filter to **LA resident** → Discover & Go. "Most of you qualify for this and didn't know."
3. Open the detail view, show the source link and verified date. "Every entry is checkable."
4. Share it — native sheet, into a group chat.
5. Switch to **Limited** → show expiry handling. "Nothing expired ever shows."
6. Add a benefit — submit one live, show the domain rejection with a non-Anderson address.
7. For businesses — 20 seconds on co-created offers and the integrity policy.

---

## 9. Out of scope

No login or accounts. No native app. No merchant self-serve portal. No transactions or redemption tracking. No automated verification pipeline (see v1.1 §6). No local Westwood merchant listings. No proximity sorting. No per-app share integrations beyond the native share sheet. No real ad sales.

---

## 10. Open questions

1. Who owns Anderson-tier content sourcing? Still the highest-leverage unassigned task.
2. Team bios and photos — owner and deadline.
3. Are the Anderson class profile numbers we want to cite on the partners page publicly published, and who pulls them?

**Resolved since v3.0:** email allowlist is `@anderson.ucla.edu`, `@g.ucla.edu`, `@ucla.edu`, with the Anderson domain trust-tiered (§6.2).
