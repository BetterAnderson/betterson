# Team photos

One photo per person, named after their first name in lowercase:

| File | Person |
|------|--------|
| `jingxiang.jpg` | Jingxiang |
| `laura.jpg` | Laura |

`.png` works too — the page tries `.jpg` first, then `.png`. A missing photo
falls back to the person's initials on a coloured circle, so the section never
shows a broken image while someone is still finding a good picture.

## What works

- **Square, or close to it.** These render as a circle, so anything very wide
  or very tall gets cropped at the edges. Head and shoulders, centred.
- **About 400×400 is plenty.** They display at roughly 88px, so 400px covers
  retina screens with room to spare. Bigger just costs load time.
- **Under ~200KB each.** A phone photo straight off the camera is 3–5MB and
  will be the slowest thing on the page. Resize before adding — on a Mac,
  open in Preview → Tools → Adjust Size.
- **JPG for photographs.** PNG is for logos and flat colour; on a photo it is
  several times larger for no visible gain.

## Worth thinking about first

These are pictures of real people on a public website, indexed by search
engines, with no login in front of them. That is a fine choice to make — just
make it deliberately, and make sure everyone pictured has actually agreed to
it rather than being told about it afterwards.
