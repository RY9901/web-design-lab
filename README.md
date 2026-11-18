# web-design-lab

Static web designs, built by hand, one at a time.

**Live gallery:** https://ry9901.github.io/web-design-lab/ *(enabled in Phase 0 step 8)*

---

## How this works, stated plainly

This repository is a **supervised learning lab**, and it is AI-assisted. I would rather say so
than have you work it out.

Three mornings a week (Mon/Wed/Fri, 05:00 +08) a scheduled [Claude Code](https://claude.com/claude-code)
routine runs in the cloud and does four things:

1. reviews the design I built last session, in writing, including what I got wrong
2. picks the next brief from [`catalog/briefs.json`](catalog/briefs.json) — a fixed catalogue of
   60, each one a combination of *industry × aesthetic × layout archetype × one hard constraint*
3. writes that brief out: an invented brand, real copy, a spec naming the CSS techniques the
   design is supposed to exercise
4. writes 2–3 ten-minute drills on exactly those techniques

**It does not write the designs.** Every line of HTML and CSS in `designs/*/` is written by me,
by hand, from a blank file, in a two-hour session that evening. Then I write `LEARN.md` — what I
decided, what broke, what I would do differently — in my own words, and the next routine run
critiques it and asks me three questions about my own code.

The point is not volume. The point is being able to defend every line of it.

## Why it is built this way

| Choice | Reason |
|---|---|
| No build step, no framework, no Tailwind | The CSS is the skill being learned. A build step hides it. |
| Hand-written, not generated | Generated code I cannot explain is worse than no portfolio at all. |
| A fixed catalogue, each brief consumed once | 60 designs converge on the same design unless the axes are decided up front. |
| One hard constraint per brief | *No images*, *monochrome*, *under 15KB*, *grid-only*, *keyboard-navigable*. Constraints are where the learning is. |
| Invented brands with real copy | Lorem ipsum makes 60 designs read as one. |
| Auto-pause after two missed nights | The repo stops rather than filling with briefs I never built. An honest gap beats fake throughput. |

## Repository layout

```
catalog/briefs.json      the 60 briefs, each consumed once
shared/                  reset + design tokens, grown by extraction from shipped designs
designs/NNNN-slug/       BRIEF SPEC DRILL (routine) · index.html styles.css LEARN (me) · REVIEW (routine)
scripts/check.mjs        quality gate, zero dependencies
scripts/build-gallery.mjs generates the root index.html
docs/ROUTINE.md          the exact prompt the routine runs
docs/CURRICULUM.md       what each phase is for, and the exit criteria
INTERVIEW.md             every question the routine asked, and my answer
```

## Commands

```bash
npm run check      # quality gate: structure, a11y basics, dead links, size budgets
npm run gallery    # regenerate the root index.html
npm run verify     # both
npm run brief -- --industry "glass blower" --aesthetic "bauhaus" \
                 --archetype "card gallery" --constraint "no images at all"
```

## Status

**Phase 0 — foundation.** No designs built yet. See [docs/CURRICULUM.md](docs/CURRICULUM.md)
for the phase plan and the week-6 exit criteria.

## Licence

MIT for the code. All brands, logos and copy in `designs/` are invented for the exercise and
refer to no real company.
