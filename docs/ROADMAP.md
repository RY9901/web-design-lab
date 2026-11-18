# Roadmap

The routine builds; I direct and review. Each phase adds something the previous one made
possible.

## Phase 1 — Ship (now)

One design per day, built by the routine, reviewed by me.

- 60 briefs in the catalogue; each consumed once
- `BUILD.md` per design, leading with what the build is least sure about
- `VALIDATE.md` per design: my verdict, what I accepted, what I sent back
- Quality gate on every push: constraint, a11y basics, dead links, size budgets
- Routine halts if ten designs are waiting on review

**Done when:** 20 designs shipped and validated, and the gallery is something I would put in
front of someone.

## Phase 2 — Prove it works, not just that it exists

Review by eye does not scale past a dozen designs. This phase makes the gate do the work.

- GitHub Actions running `npm run check` on every push, blocking on failure
- Playwright screenshots at 360 / 768 / 1440, committed per design — so a regression is visible
  in the diff
- Lighthouse budget: accessibility ≥ 95, performance ≥ 95. A design that fails gets a **fix
  run**, not a new brief
- Automated constraint checks where they can be automated: no `<img>` when the brief says no
  images, folder size against a stated KB budget
- Weekly consolidation run: extract repeated values into `shared/tokens.css` and write up what
  changed. This is what turns 60 pages into a design system

## Phase 3 — Own the delivery

Static hosting on someone else's platform is one command. Running the thing is the skill.

- A $5/month VPS: nginx, a real domain, Let's Encrypt, systemd, `ufw`, fail2ban, log rotation
- Deploy the gallery there; GitHub Pages stays as the mirror
- Uptime checks and a deploy that rolls back on failure

## Phase 4 — Make it an application

- Fastify + SQLite. The gallery served from a database, not a generated file
- Sessions and hashed passwords, an admin view to publish and unpublish designs, a JSON API
- The review workflow moves into the app: validate a design in the browser, not by editing
  Markdown

## What I am accountable for

Not the CSS. The catalogue, the constraints, the review standard, and the gate. If a design
ships broken, the honest answer is that my gate did not catch it — so the gate is the thing
that has to keep getting better.
