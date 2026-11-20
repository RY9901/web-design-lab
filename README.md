# web-design-lab

A sellable multi-theme website template pack, hand-written in HTML and CSS with no build step,
built by a scheduled agent and reviewed by me.

**Live:** https://ry9901.github.io/web-design-lab/

| Theme | Register | |
|---|---|---|
| 001 Vela | Techno-minimal, dark | [view](https://ry9901.github.io/web-design-lab/themes/001-vela/) |
| 002 Marrow | Editorial-luxe, photographic | [view](https://ry9901.github.io/web-design-lab/themes/002-marrow/) |
| 003 Atlas Works | Soft-brutalist, type-led | [view](https://ry9901.github.io/web-design-lab/themes/003-atlas-works/) |

---

## How this works, stated plainly

This repository is AI-built, and I would rather say so than have you work it out.

A scheduled [Claude Code](https://claude.com/claude-code) routine runs in the cloud and ships
one theme per run. It takes the next entry from [`catalog/themes.json`](catalog/themes.json),
hand-writes `index.html` and `theme.css` against the shared system, runs two gates, writes down
what it is unsure about, and pushes.

**It is never allowed to call a theme finished.** The most it may record is
`needs-visual-review`. I promote a theme to `built` after looking at it in a browser. That rule
exists because it was learned the hard way: three themes in a row were rejected, and every
fault that mattered — a hero photograph with nowhere for the type to sit, section images that
fought the hero, a nav that collapsed into itself below 700px, a dropdown rendering white text
on a cream panel — was invisible in the source and obvious in a screenshot. An agent that
cannot see does not get to grade its own work.

## The two rulebooks

**The system contract.** [`system/base.css`](system/base.css) owns the reset, the layout
primitives and the shared components. A theme never edits it. It redefines the token contract
in its own `@layer tokens` block and adds its signature pieces in `@layer components`. Every
colour and every font goes through a token — a literal outside the token block is a defect.

**The design floor.** Themes 003 onward are built to the [Hallmark](https://github.com/) floor:
no eyebrow above a heading, no tracked small-caps labels, no accented word inside a headline,
no invented metrics or client logos, one filled button per screen, `transform` and `opacity`
only. Vela and Marrow predate it and are exempt by decision, not by oversight.

The floor exists because of a measurable problem. Vela and Marrow were built in deliberately
opposite registers and still independently arrived at the same three devices: an eyebrow,
tracked small caps, and one accent-coloured word in the headline. Those are the defaults a
model falls into. Across eight themes that is not a pack, it is one theme eight times.

## Why it is built this way

| Choice | Reason |
|---|---|
| No build step, no framework, no Tailwind | Every theme is readable on its own, in a browser, forever. A buyer can open one file and change it. |
| One shared base, per-theme token overrides | The pack is a system, not eight unrelated pages. Fixing the nav once fixed it everywhere. |
| Two gates, not one | `check.mjs` catches structure and dead tokens; the design linter catches the defaults. They find different things. |
| The routine may not mark work `built` | It cannot see. The one rule it must never break. |
| Slots instead of invented proof | Fake metrics and client logos are both dishonest and unsellable. Where proof goes, there is a labelled slot. |
| The routine pauses on a review backlog | A repo of unreviewed generated pages proves nothing. |

## Known gaps

- **Photography licensing.** Marrow hotlinks Unsplash. The licence does not clearly cover
  images sold on in a template, so before this pack is sold the demo and the download have to
  part company: slots and a credits file in the download, photographs in the live demo only.
  Atlas Works already works this way.
- Only the homepage of each theme exists; the briefs specify three or four pages each.
- The render tier of the design linter needs puppeteer, which is not installed, so rendered
  overflow and contrast checks are done by hand in a browser.

## Repository layout

```
catalog/themes.json          the theme briefs, each consumed once
system/base.css              the shared layer: reset, layout, components
themes/NNN-slug/             index.html + theme.css + BUILD.md
designs/                     legacy: the earlier constraint-exercise pipeline
scripts/check.mjs            structural gate, zero dependencies
scripts/build-gallery.mjs    generates the root index.html
docs/ROUTINE.md              the exact prompt the routine runs
docs/ROADMAP.md              what each phase adds
```

## Commands

```bash
npm run check      # structural gate: tokens, a11y basics, dead links, review backlog
npm run gallery    # regenerate the root index.html
npm run verify     # both
```

## Licence

MIT for the code. Every brand, project and quote in `themes/` is invented and refers to no real
company. Demo photographs are not covered by that licence and are not part of the pack.
