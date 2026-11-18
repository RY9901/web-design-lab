# Validation — <design slug>

> Copy this into the design folder as `VALIDATE.md`. This is my review of what the routine
> shipped, and it is the only thing that marks a design as finished. The quality gate counts
> designs without one and halts the routine at ten.
>
> Target: ten minutes per design. Read `BUILD.md` first — its *what I am unsure about* section
> tells you where to look.

## Verdict

`accepted` · `accepted with notes` · `sent back`

## Constraint

The brief's hard constraint, and whether it was actually met. Check it yourself — do not take
`BUILD.md`'s word for it. If the brief said *no images*, grep for `<img`, `svg`, `background-image`
and `url(`.

## What I checked

- [ ] Opened it at 320px — no horizontal scroll
- [ ] Tabbed through it — every interactive element reachable, focus visible
- [ ] Read the HTML — one `<h1>`, sensible heading order, semantic elements
- [ ] Constraint verified by hand, not assumed
- [ ] `npm run check` passes

## What I accepted

What is genuinely good, and what I would have done differently but let stand.

## What I sent back

Anything that needs a fix run, ranked. Be specific enough that the next run can act on it
without asking.

## Answers to the build's two questions

`BUILD.md` ends with two judgment calls. They are mine to make. Answer them here — the next
build reads this file.

## Time

Target 10 minutes. Actual: ___.
