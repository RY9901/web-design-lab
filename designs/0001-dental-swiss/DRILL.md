# Drill 0001 — ten minutes each, blank file, no references

Open an empty `drill.html` outside the repo (or in a scratch folder). No MDN tab, no previous
designs. If you get stuck for more than two minutes, note the gap and move on — the gap list is
the useful output. Time-box strictly.

## Drill A — Named areas (10 min)
**Goal:** a page with `header`, `nav`, `main`, `aside` and `footer` laid out with
`grid-template-areas` only: header across the top, nav and aside either side of main, footer
across the bottom. Then, inside a `max-width: 600px` media query, restack it so the order on
screen is header, main, nav, aside, footer — by changing the area map alone, not the markup
or any `grid-row`/`grid-column` values.

## Drill B — Named lines (10 min)
**Goal:** a grid with a full-bleed coloured band and text that stays in a centred column,
using only named lines in `grid-template-columns` — a gutter track, a content track capped at
`70ch`, and a gutter track on each side, with line names marking where each starts and ends.
Place a heading, a paragraph and a full-bleed `<hr>`-style band, all by line *name*. No numeric
line placement, no wrapper `<div>` with `margin: 0 auto`.

## Drill C — Combine (10 min)
**Goal:** a split hero: a large headline occupying roughly the left 7 of 12 columns, and a stack
of three big numbers with labels in the right 5. Declare the 12-column grid once, name at least
two lines, and place both halves with an area map. At 600px wide it must collapse to a single
column without any new placement properties.
