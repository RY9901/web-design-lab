# web-design-lab

A static-design pipeline. One complete, constrained web design shipped per day, built by a
scheduled agent and reviewed by me.

**Live gallery:** https://ry9901.github.io/web-design-lab/

---

## How this works, stated plainly

This repository is AI-built, and I would rather say so than have you work it out.

Every morning at 05:00 (+08) a scheduled [Claude Code](https://claude.com/claude-code) routine
runs in the cloud and ships one design:

1. takes the next brief from [`catalog/briefs.json`](catalog/briefs.json) — a fixed catalogue of
   60, each one a combination of *industry × aesthetic × layout archetype × **one hard
   constraint***
2. writes the brief out: an invented brand with real copy, and a spec naming the CSS techniques
   the design must exercise
3. hand-writes `index.html` and `styles.css` — no framework, no build step, no CDN
4. runs the quality gate and fixes what it reports
5. writes `BUILD.md`: the decisions it made, the alternatives it rejected, **what it is least
   sure about**, and two judgment calls left for me
6. commits and pushes

**My job is design direction and review.** I set the catalogue — the industries, the aesthetics,
the archetypes, and the constraints that make each design a real problem rather than a
template. Then I validate what shipped and record the verdict in `VALIDATE.md`: constraint met
or not, what I accepted, what I sent back, and why.

Unreviewed work is not finished work. If ten designs pile up without a `VALIDATE.md`, the
routine stops building and says so.

## Why it is built this way

| Choice | Reason |
|---|---|
| No build step, no framework, no Tailwind | Every file in `designs/` is readable on its own, in the browser, forever. No dependency rot across 60 designs. |
| A fixed catalogue, each brief consumed once | 60 designs converge on the same design unless the axes are decided up front. |
| **One hard constraint per brief** | *No images*, *monochrome*, *under 15KB*, *grid-only*, *keyboard-navigable*. The constraint is the design problem. Without it this is just 60 landing pages. |
| Invented brands with real copy | Lorem ipsum makes 60 designs read as one. |
| `BUILD.md` leads with uncertainty | A build that tells me where it is probably wrong is reviewable in ten minutes. One that claims success is not. |
| The routine pauses on a review backlog | A repo of unreviewed generated pages proves nothing. The gate enforces it. |

## Repository layout

```
catalog/briefs.json       the 60 briefs, each consumed once
shared/                   reset + design tokens, grown by extraction
designs/NNNN-slug/        BRIEF SPEC index.html styles.css BUILD (routine) · VALIDATE (me)
scripts/check.mjs         quality gate, zero dependencies
scripts/build-gallery.mjs generates the root index.html
docs/ROUTINE.md           the exact prompt the routine runs
docs/ROADMAP.md           what each phase adds
```

## Commands

```bash
npm run check      # quality gate: constraints, a11y basics, dead links, size budgets, review backlog
npm run gallery    # regenerate the root index.html
npm run verify     # both
npm run brief -- --industry "glass blower" --aesthetic "bauhaus" \
                 --archetype "card gallery" --constraint "no images at all"
```

## Status

**Phase 1.** Designs shipping daily. See [docs/ROADMAP.md](docs/ROADMAP.md).

## Licence

MIT for the code. All brands, logos and copy in `designs/` are invented for the exercise and
refer to no real company.
