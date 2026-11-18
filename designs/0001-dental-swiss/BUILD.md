# Build 0001 — Harbourline Dental

**Constraint: "no images at all" — met.** No `<img>`, `<picture>`, `<svg>`, `url()`, image file reference,
icon font or emoji anywhere. `npm run check` verifies this mechanically. Visuals are type, 1px/3px rules and
flat colour only. Total folder size is a few KB of hand-written HTML/CSS, no JavaScript.

## Decisions

1. **Whole page as one `grid-template-areas` map on 14 tracks** (gutter + 12 columns + gutter). The desktop map
   is the base rule; the mobile map (3 tracks) is a different map in `@media (max-width: 899px)`, with no new
   placement rules. Rejected: a 12-col grid on a centred wrapper — it can't make full-bleed rules without extra
   wrappers.
2. **Named lines by meaning**: `full-start / content-start+label-start / label-end+body-start / body-end+content-end / full-end`.
   Every section hangs its heading on `label-start/label-end` and its content on `body-start/body-end`.
   On mobile the same names collapse onto one line, so section CSS is untouched. Rejected: numeric
   `grid-column: 4 / 13`.
3. **`subgrid`** so sections (full-width areas) inherit the page's named lines and full-bleed hairlines come free
   (`border-top` on the section). Rejected: nested independent grids, which lose the line names.
4. **Hanging-label layout instead of a 7/5 split for the whole page.** Only the hero uses 7/5; sections use 3/9.
   Rejected: team and fees side by side — their widths wouldn't contain the label/body lines.
5. **Palette is exactly three hex values.** Muted text isn't allowed (no fourth colour), so hierarchy is size/weight only.
   Signal red is used three times: primary CTA, the "0", the phone number.

## What I am least sure about

- **Subgrid + `main { display: contents }`.** `main` is a landmark and `display: contents` has had
  accessibility-tree bugs in some browsers/screen readers (older ones dropped the role). I'd test with a screen
  reader first. Fix if needed: make `main` a real subgrid area instead.
- **Red contrast.** I changed signal from the suggested `#d8281e` (≈4.4:1, fails AA on paper) to `#c8231a`
  (≈5:1 by my calculation, not measured with a tool). White text on the red button is ≈5.6:1.
- **Baseline rhythm is partial.** Spacing uses only 0.5rem multiples, but the display type uses line-heights
  of 0.9–0.95 that don't sit on the 8px grid. Real Swiss work would snap these.
- **Mid widths (900–1199px):** cells are 2×2 and the 3-column label gets tight for "Harbourline Dental".
  I screenshotted 900 but only looked closely at 320 and 1280.
- Checked by script: no horizontal scroll at 320, 375, 768, 899, 900, 1280, 1600. I did not test real keyboard
  tabbing; focus style is a 3px ink outline.

## What I did not do

- No dark mode (`color-scheme: light`) — three-colour Swiss palette; a dark variant would be a fourth.
- `LEARN.md` from the SPEC checklist is not written: the routine's own instructions say BUILD.md, so this file stands in for it.
- `shared/tokens.css` is linked for spacing/type tokens only; its colours are unused. Extraction candidates:
  hanging-label `.band` pattern, `--gutter`, `.cells` 2/4 grid.

## Two questions for Raziq

1. The hero numerals ("25 / 0 / 1987") dominate the headline at desktop. Should facts stay this loud, or should
   the headline win and the numerals drop to roughly half size?
2. Red appears three times, but the "0" is the only red on the page that isn't an action. Is it right for red to
   mean "emphasis" there, or should red be reserved strictly for actions (CTA, phone)?
