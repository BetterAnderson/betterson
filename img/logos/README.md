# Brand logo files

Drop a logo here and it appears on that brand's cards automatically. Nothing
else to change.

## Naming

The filename must match the `ic` value in `data/benefits.json`:

| File to add            | Appears on                          |
|------------------------|-------------------------------------|
| `chipotle.svg`         | Chipotle U Rewards, seasonal drops  |
| `jackinthebox.svg`     | Free Jumbo Jack on seven strikeouts |
| `pandaexpress.svg`     | $7 Panda Plate after a home win     |

`.png` works too — the page tries `.svg` first, then `.png`. If neither is
found the card quietly falls back to its type icon, so a missing or misnamed
file never leaves a broken image on the page.

## What to use

- **SVG is best** — sharp at any size, usually a few KB.
- **PNG** if that's all you can get: at least 128×128, transparent background,
  square-ish. Avoid a white box behind the logo; the badge is already white.
- Use the plain logo mark, not a lock-up with a tagline or wordmark stack.
  It renders at roughly 20px, so anything with small text turns to mush.

Grab these from the brand's own newsroom or press-kit page where possible —
those are the versions they intend other people to use.

## A note on why the others aren't here

McDonald's, Spotify and Apple don't need files. Their marks are single SVG
paths inlined in `BRAND_ICON` in `js/app.js`, taken from Simple Icons (CC0).
That's the preferred route: no binaries in the repo and no image requests when
the page loads. If a brand you want turns up at simpleicons.org, use that
instead of adding a file here.

Trademarks belong to their owners. These identify whose offer a listing is.
