#!/usr/bin/env node
// The browser half of the quality gate. One Chromium launch does four jobs:
//
//   1. SCREENSHOTS at 360 / 768 / 1440, committed per design, so a visual
//      regression shows up in the diff instead of in nobody's memory.
//   2. OVERFLOW: document.scrollWidth must not exceed the viewport. This is the
//      real check; a script that only greps CSS cannot see a 1000px-wide table.
//   3. AXE: accessibility violations at serious/critical severity fail the build.
//   4. KEYBOARD: actually presses Tab through the page and asserts every focused
//      element has a visible indicator. Closes the gap a build cannot self-check.
//
// Run: npm run gate   (or node scripts/browser-gate.mjs [slug])
//
// Needs devDependencies installed and `npx playwright install chromium`.
// scripts/check.mjs stays dependency-free and is what the daily routine relies on;
// this script is the backstop that CI always runs.

import { readFile, readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const ROOT = path.resolve(import.meta.dirname, "..");
const DESIGNS = path.join(ROOT, "designs");
const WIDTHS = [360, 768, 1440];
const MAX_TABS = 60;

const only = process.argv[2];
const errors = [];
const warnings = [];

const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

async function builtDesigns() {
  if (!existsSync(DESIGNS)) return [];
  const out = [];
  for (const entry of await readdir(DESIGNS, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (only && entry.name !== only) continue;
    const metaPath = path.join(DESIGNS, entry.name, "meta.json");
    if (!existsSync(metaPath)) continue;
    const meta = JSON.parse(await readFile(metaPath, "utf8"));
    if (meta.status !== "built") continue;
    if (!existsSync(path.join(DESIGNS, entry.name, "index.html"))) continue;
    out.push(meta);
  }
  return out.sort((a, b) => a.id - b.id);
}

// Does the currently focused element show a visible focus indicator?
const FOCUS_PROBE = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const s = getComputedStyle(el);
  const outline =
    s.outlineStyle !== "none" && parseFloat(s.outlineWidth || "0") > 0;
  const shadow = s.boxShadow && s.boxShadow !== "none";
  const label =
    el.tagName.toLowerCase() +
    (el.id ? "#" + el.id : "") +
    ' "' + (el.textContent || "").trim().slice(0, 30) + '"';
  return { visible: Boolean(outline || shadow), label };
})()`;

async function gateDesign(browser, meta) {
  const dir = path.join(DESIGNS, meta.slug);
  const where = `designs/${meta.slug}`;
  const url = pathToFileURL(path.join(dir, "index.html")).href;

  await mkdir(path.join(dir, "shots"), { recursive: true });

  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    try {
      await page.goto(url, { waitUntil: "load" });

      await page.screenshot({
        path: path.join(dir, "shots", `${width}.png`),
        fullPage: true,
      });

      const scrollWidth = await page.evaluate(
        "Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)"
      );
      if (scrollWidth > width + 1) {
        err(where, `horizontal overflow at ${width}px — content is ${scrollWidth}px wide`);
      }

      // Accessibility, at the narrow and wide ends only.
      if (width === 360 || width === 1440) {
        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();

        for (const v of violations) {
          const line = `${v.id} (${v.impact}) — ${v.help} [${v.nodes.length} node(s)] at ${width}px`;
          if (v.impact === "critical" || v.impact === "serious") err(where, line);
          else warn(where, line);
        }
      }

      // Keyboard: tab through and require a visible indicator every time.
      if (width === 1440) {
        const seen = new Set();
        let invisible = [];
        for (let i = 0; i < MAX_TABS; i++) {
          await page.keyboard.press("Tab");
          const probe = await page.evaluate(FOCUS_PROBE);
          if (!probe) break;
          if (seen.has(probe.label)) break; // wrapped around
          seen.add(probe.label);
          if (!probe.visible) invisible.push(probe.label);
        }
        if (!seen.size) {
          warn(where, "nothing is focusable — check this is really a static page with no links");
        }
        if (invisible.length) {
          err(
            where,
            `${invisible.length} focusable element(s) show no visible focus indicator: ${invisible
              .slice(0, 4)
              .join(", ")}`
          );
        }
      }
    } finally {
      await page.close();
    }
  }
}

const designs = await builtDesigns();
if (!designs.length) {
  console.log("browser gate: nothing built to check");
  process.exit(0);
}

const browser = await chromium.launch();
try {
  for (const meta of designs) {
    process.stdout.write(`checking ${meta.slug} ... `);
    const before = errors.length;
    await gateDesign(browser, meta);
    console.log(errors.length === before ? "ok" : "FAILED");
  }
} finally {
  await browser.close();
}

const line = "-".repeat(66);
console.log(line);
console.log(`browser gate: ${designs.length} design(s), ${WIDTHS.join("/")} px, screenshots written to designs/*/shots/`);
console.log(line);
for (const w of warnings) console.log(`warn   ${w}`);
for (const e of errors) console.log(`FAIL   ${e}`);
console.log(errors.length ? `${errors.length} error(s)` : warnings.length ? `passed with ${warnings.length} warning(s)` : "all browser checks passed");
process.exit(errors.length ? 1 : 0);
