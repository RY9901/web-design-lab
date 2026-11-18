# Curriculum

Three build nights a week, two hours each. Starting point, stated honestly: I can read HTML and
CSS comfortably, but writing it from memory is awkward. That is a **recall** problem, not a
comprehension problem, so every session starts with drills written from a blank file.

## Phase 1 — Recall (weeks 1–6, briefs 1–18)

| Builds | Theme | Techniques |
|---|---|---|
| 1–6 | Layout primitives | `grid-template-areas`, named lines, `auto-fit`/`minmax()`, `min()`/`max()`/`clamp()` for sizing, nested grid, sticky inside a grid track |
| 7–12 | Type and spacing | modular scale, fluid type with `clamp()`, line-height and vertical rhythm, multi-column, `text-wrap: balance`, font fallback metrics |
| 13–18 | Responsive and state | container queries, `:focus-visible`, `prefers-reduced-motion`, `color-scheme` and dark mode, `aspect-ratio` + `object-fit`, `:has()` |

**Exit criteria for Phase 1:** build a responsive two-column page with CSS Grid, from memory,
in under 30 minutes. If that is not true by week 6, the method is wrong — stop and rebuild
Phase 1 around narrower drills. That is a real kill criterion, not a motivational slogan.

## Phase 2 — Delivery (weeks 7–14, briefs 19–36)

The designs stop being the only deliverable. How they ship becomes the second half.

- GitHub Actions running `npm run check` on every push, blocking on failure
- Playwright screenshots at 360 / 768 / 1440, committed per design
- Lighthouse budget: accessibility ≥ 95, performance ≥ 95. A design that fails gets a **fix
  night**, not a new brief.
- A $5/month VPS: nginx, a real domain, Let's Encrypt, systemd, `ufw`, fail2ban, log rotation
- Deploy the gallery there. GitHub Pages stays as the mirror.
- From week 10 the routine also writes **one reference implementation per week** — I build mine
  first, then diff against it.

## Phase 3 — Application (weeks 15+, briefs 37–60)

- Fastify + SQLite. The gallery becomes a server-rendered app, not a generated file.
- Sessions, hashed passwords, an admin page to publish designs, a JSON API. No library magic I
  cannot explain line by line.
- The routine shifts to building designs itself; **I hand-build every fifth one** to keep recall
  sharp and to have honest stories about code I wrote.

## The budget

Claude Pro. The routine and my interactive sessions draw from the same weekly allowance, so the
routine is deliberately cheap: three runs a week, writing prose and critique, never
implementations. The majority of the budget is reserved for working through reviews
interactively — that is where the learning actually happens, and it is the half that makes the
repository defensible in a room.
