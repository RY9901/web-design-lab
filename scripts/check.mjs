#!/usr/bin/env node
// Quality gate for web-design-lab. Zero dependencies by design.
//
// These are STRUCTURAL checks, not full HTML validation. They catch the mistakes
// that actually accumulate in a repo like this: missing lang, missing alt, inline
// styles, dead local links, a design marked built with no LEARN.md, and briefs
// that got reissued. Phase 2 adds real validation, screenshots and Lighthouse.

import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DESIGNS = path.join(ROOT, "designs");

const errors = [];
const warnings = [];
let checked = 0;

const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

async function dirSize(dir) {
  let total = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += await dirSize(full);
    else total += (await stat(full)).size;
  }
  return total;
}

function checkHtml(where, html, designDir) {
  if (!/<!doctype html>/i.test(html)) err(where, "missing <!doctype html>");
  if (!/<html[^>]+\blang=/i.test(html)) err(where, "<html> has no lang attribute");
  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) err(where, "missing viewport meta");
  if (!/<title>[^<]+<\/title>/i.test(html)) err(where, "missing or empty <title>");

  const inline = html.match(/<[a-z][^>]*\sstyle=["'][^"']+["']/gi) || [];
  if (inline.length) err(where, `${inline.length} inline style attribute(s) — put it in styles.css`);

  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    if (!/\balt=/i.test(tag)) err(where, `<img> without alt: ${tag.slice(0, 70)}`);
  }

  // Local references must resolve.
  for (const m of html.matchAll(/(?:href|src)=["']([^"'#?]+)["']/gi)) {
    const ref = m[1];
    if (/^(https?:|mailto:|tel:|data:|\/\/)/i.test(ref)) continue;
    const target = path.resolve(designDir, ref);
    if (!existsSync(target)) err(where, `dead local reference: ${ref}`);
  }

  if (!/styles\.css/.test(html)) warn(where, "does not link styles.css");
}

async function checkDesign(slug) {
  const dir = path.join(DESIGNS, slug);
  const where = `designs/${slug}`;
  checked++;

  const metaPath = path.join(dir, "meta.json");
  if (!existsSync(metaPath)) {
    err(where, "no meta.json");
    return null;
  }

  let meta;
  try {
    meta = JSON.parse(await readFile(metaPath, "utf8"));
  } catch (e) {
    err(where, `meta.json does not parse: ${e.message}`);
    return null;
  }

  for (const field of ["id", "slug", "status"]) {
    if (meta[field] === undefined) err(where, `meta.json missing "${field}"`);
  }
  if (meta.slug && meta.slug !== slug) err(where, `meta.slug "${meta.slug}" does not match folder name`);

  for (const f of ["BRIEF.md", "SPEC.md"]) {
    if (!existsSync(path.join(dir, f))) err(where, `missing ${f} — the routine should have written it`);
  }

  const indexPath = path.join(dir, "index.html");
  const hasIndex = existsSync(indexPath);

  if (meta.status === "built") {
    if (!hasIndex) err(where, 'status is "built" but there is no index.html');

    const learnPath = path.join(dir, "LEARN.md");
    if (!existsSync(learnPath)) {
      err(where, 'status is "built" but there is no LEARN.md — a design is not done until you write up what you learned');
    } else {
      const learn = (await readFile(learnPath, "utf8")).trim();
      if (learn.length < 200) err(where, `LEARN.md is only ${learn.length} chars — write at least a few real paragraphs`);
      if (/TODO|FIXME|lorem ipsum/i.test(learn)) err(where, "LEARN.md still contains placeholder text");
    }
  }

  if (hasIndex) {
    checkHtml(where, await readFile(indexPath, "utf8"), dir);

    // Honour a size budget stated in the brief constraint, e.g. "under 15KB total".
    const budget = /under\s+(\d+)\s*KB/i.exec(meta.constraint || "");
    if (budget) {
      const limit = Number(budget[1]) * 1024;
      const size = await dirSize(dir);
      if (size > limit) {
        err(where, `${(size / 1024).toFixed(1)}KB exceeds the ${budget[1]}KB budget in its own constraint`);
      }
    }
  }

  return meta;
}

async function main() {
  const catalogPath = path.join(ROOT, "catalog", "briefs.json");
  if (!existsSync(catalogPath)) {
    err("catalog/briefs.json", "missing");
    return report();
  }

  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const briefs = catalog.briefs || [];

  const seenIds = new Set();
  const seenSlugs = new Set();
  for (const b of briefs) {
    if (seenIds.has(b.id)) err("catalog", `duplicate brief id ${b.id}`);
    if (seenSlugs.has(b.slug)) err("catalog", `duplicate brief slug ${b.slug}`);
    seenIds.add(b.id);
    seenSlugs.add(b.slug);
  }

  const slugs = existsSync(DESIGNS)
    ? (await readdir(DESIGNS, { withFileTypes: true }))
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort()
    : [];

  const metas = [];
  for (const slug of slugs) {
    const meta = await checkDesign(slug);
    if (meta) metas.push(meta);

    const brief = briefs.find((b) => b.slug === slug);
    if (!brief) err(`designs/${slug}`, "no matching brief in catalog/briefs.json");
    else if (brief.status === "unbuilt") {
      err("catalog", `brief ${brief.slug} still marked unbuilt but its folder exists — consumed-once invariant broken`);
    }
  }

  // The repo must never show more prepared briefs than finished builds by a wide margin.
  const built = metas.filter((m) => m.status === "built").length;
  const prepared = metas.length - built;
  if (prepared > 2) {
    err("repo", `${prepared} briefs prepared but unbuilt — the routine should have paused. Build them or delete them.`);
  }

  report({ built, prepared, total: briefs.length });
}

function report(stats) {
  const line = "-".repeat(60);
  console.log(line);
  if (stats) {
    console.log(`designs checked: ${checked}   built: ${stats.built}   awaiting build: ${stats.prepared}   briefs in catalog: ${stats.total}`);
    console.log(line);
  }

  for (const w of warnings) console.log(`warn   ${w}`);
  for (const e of errors) console.log(`FAIL   ${e}`);

  if (!errors.length) {
    console.log(warnings.length ? `passed with ${warnings.length} warning(s)` : "all checks passed");
  } else {
    console.log(`${errors.length} error(s)`);
  }
  process.exit(errors.length ? 1 : 0);
}

await main();
