# Spec 0001 — Harbourline Dental

**Archetype:** split hero · **Constraint:** no images at all

## Section order
1. `header` — wordmark left, four nav links right
2. `main > .hero` — split: statement (left), three numeral facts (right)
3. `section#treatments` — "What we do", four items
4. `section#team` — "The people", four names
5. `section#fees` — real table
6. `footer#book` — booking details and small print

## Layout
Desktop (≥ 900px): the whole page sits on a **12-column grid**. The hero is split roughly
7 / 5. Below 900px everything stacks to one column, and nothing may scroll sideways at 320px.

## Techniques this design must exercise (named, so the drills and review can check them)

1. **`grid-template-areas`** — the page-level layout is declared as a named-area map, e.g.
   areas for `header`, `hero`, `facts`, `treatments`, `team`, `fees`, `footer`. The mobile
   layout is a *different* area map inside a media query, not new placement rules.
2. **Named grid lines** — define lines such as `[full-start] … [content-start] … [content-end]
   … [full-end]` in `grid-template-columns`, and place at least three elements with
   `grid-column: content-start / content-end` (or similar). Lines should name *meaning*, not
   numbers.

Using `grid-template-areas` for the hero but numeric placement (`grid-column: 3 / 9`) for
everything else does not satisfy the spec.

## Swiss details to get right
- One font family (system sans stack is fine), two weights at most
- Flush-left, ragged-right; no centred body text
- Hairline rules (`1px`) separating sections
- Signal red used for **at most** three things on the page
- A visible baseline rhythm: pick a spacing unit (e.g. `0.5rem`) and use only multiples

## Done checklist
- [ ] No images of any kind (`grep -ri "<img\|<svg\|url(" designs/0001-dental-swiss` finds nothing)
- [ ] `grid-template-areas` used with a distinct mobile map
- [ ] ≥ 3 elements placed with named lines
- [ ] No horizontal scroll at 320px
- [ ] Every link and the CTAs reachable and visibly focused by keyboard only (`:focus-visible`)
- [ ] Text contrast ≥ 4.5:1 including red-on-paper
- [ ] Fees are a real `<table>` with `<th scope>` headers
- [ ] One `<h1>`; heading levels do not skip
- [ ] Exactly three colours in the CSS
- [ ] `npm run check` passes
- [ ] `LEARN.md` written in your own words (what you decided, what broke, what you'd change)
