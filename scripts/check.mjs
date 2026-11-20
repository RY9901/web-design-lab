#!/usr/bin/env node
// Quality gate for web-design-lab. Zero dependencies by design.
//
// The routine builds; Raziq reviews. This gate is what makes that honest:
//   1. structural checks a reviewer should not have to do by hand
//   2. MECHANICAL CONSTRAINT CHECKS — the brief's hard constraint, verified, not claimed
//   3. a review-backlog limit, so unreviewed builds cannot pile up
//
// Statuses: "prepared" (brief written, not built) -> "built" (shipped by the routine)
//           -> a design with VALIDATE.md is reviewed. No VALIDATE.md means awaiting review.

import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DESIGNS = path.join(ROOT, "designs");
const THEMES = path.join(ROOT, "themes");

const BACKLOG_WARN = 5;
const BACKLOG_FAIL = 10;

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

  const h1s = html.match(/<h1\b/gi) || [];
  if (h1s.length === 0) err(where, "no <h1>");
  if (h1s.length > 1) err(where, `${h1s.length} <h1> elements — there should be exactly one`);

  const inline = html.match(/<[a-z][^>]*\sstyle=["'][^"']+["']/gi) || [];
  if (inline.length) err(where, `${inline.length} inline style attribute(s) — put it in styles.css`);

  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    if (!/\balt=/i.test(tag)) err(where, `<img> without alt: ${tag.slice(0, 70)}`);
  }

  for (const m of html.matchAll(/(?:href|src)=["']([^"'#?]+)["']/gi)) {
    const ref = m[1];
    if (/^(https?:|mailto:|tel:|data:|\/\/)/i.test(ref)) continue;
    if (!existsSync(path.resolve(designDir, ref))) err(where, `dead local reference: ${ref}`);
  }

  if (/https?:\/\/(cdn|unpkg|cdnjs|code\.jquery)/i.test(html)) {
    err(where, "loads a CDN script or stylesheet — designs must be self-contained");
  }
}

function checkCss(where, css) {
  if (!/:focus-visible/.test(css)) {
    warn(where, "no :focus-visible rule — keyboard focus is probably invisible");
  }
  if (/outline:\s*(none|0)/.test(css) && !/:focus-visible/.test(css)) {
    err(where, "removes outline without providing a :focus-visible style");
  }
}

// The hard constraint, verified mechanically wherever that is possible.
function checkConstraint(where, constraint, html, css, bytes) {
  const c = (constraint || "").toLowerCase();
  const all = html + "\n" + css;

  if (c.includes("no images")) {
    const hits = [];
    if (/<img\b/i.test(html)) hits.push("<img>");
    if (/<picture\b/i.test(html)) hits.push("<picture>");
    if (/<svg\b/i.test(html)) hits.push("<svg>");
    if (/url\(\s*['"]?(?!#)/i.test(css)) hits.push("url() in CSS");
    if (/\.(png|jpe?g|gif|webp|avif|svg)\b/i.test(all)) hits.push("an image file reference");
    if (hits.length) err(where, `constraint "no images at all" violated: ${hits.join(", ")}`);
  }

  if (c.includes("no javascript")) {
    if (/<script\b/i.test(html)) err(where, 'constraint "no JavaScript" violated: <script> present');
    if (/\son[a-z]+=["']/i.test(html)) err(where, 'constraint "no JavaScript" violated: inline event handler');
  }

  if (c.includes("no flexbox") || c.includes("grid only")) {
    if (/display\s*:\s*(inline-)?flex/i.test(css)) {
      err(where, 'constraint "CSS Grid only, no flexbox" violated: display:flex in styles.css');
    }
  }

  if (c.includes("no border-radius")) {
    if (/border-radius/i.test(css)) err(where, 'constraint "no border-radius anywhere" violated');
  }

  if (c.includes("no media queries")) {
    if (/@media[^{]*\(\s*(min|max)-(width|height)/i.test(css)) {
      err(where, 'constraint "no media queries at all" violated: a width/height media query is present');
    }
  }

  if (c.includes("no custom fonts") || c.includes("system fonts only")) {
    if (/@font-face/i.test(css)) err(where, `constraint "${constraint}" violated: @font-face`);
    if (/fonts\.(googleapis|gstatic)\.com/i.test(all)) err(where, `constraint "${constraint}" violated: Google Fonts`);
  }

  const budget = /under\s+(\d+)\s*kb/i.exec(c);
  if (budget) {
    const limit = Number(budget[1]) * 1024;
    if (bytes > limit) {
      err(where, `${(bytes / 1024).toFixed(1)}KB exceeds the ${budget[1]}KB budget in its own constraint`);
    }
  }

  const colours = /maximum\s+(\d+)\s+colou?rs?/i.exec(c);
  if (colours) {
    const found = new Set((css.match(/#[0-9a-f]{3,8}\b/gi) || []).map((h) => h.toLowerCase()));
    if (found.size > Number(colours[1]) + 2) {
      warn(where, `${found.size} distinct hex colours for a "${constraint}" brief — check this by eye`);
    }
  }
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
  if (!["prepared", "built"].includes(meta.status)) {
    err(where, `meta.status "${meta.status}" is not "prepared" or "built"`);
  }

  for (const f of ["BRIEF.md", "SPEC.md"]) {
    if (!existsSync(path.join(dir, f))) err(where, `missing ${f}`);
  }

  const indexPath = path.join(dir, "index.html");
  const cssPath = path.join(dir, "styles.css");

  if (meta.status === "built") {
    if (!existsSync(indexPath)) err(where, 'status "built" but no index.html');
    if (!existsSync(cssPath)) err(where, 'status "built" but no styles.css');
    if (!existsSync(path.join(dir, "BUILD.md"))) {
      err(where, 'status "built" but no BUILD.md — the build must explain itself before review');
    }
  }

  if (existsSync(indexPath)) {
    const html = await readFile(indexPath, "utf8");
    const css = existsSync(cssPath) ? await readFile(cssPath, "utf8") : "";
    checkHtml(where, html, dir);
    if (css) checkCss(where, css);
    checkConstraint(where, meta.constraint, html, css, await dirSize(dir));
  }

  meta.__reviewed = existsSync(path.join(dir, "VALIDATE.md"));
  return meta;
}


// Themes are the sellable pack. They carry no brief and no constraint, so they
// get the structural checks only — but they DO get them. They were shipping
// completely ungated, which is how a page goes out with faults nobody saw.

// A var() pointing at a token nobody declares resolves to nothing, and the
// property is dropped — no error, no warning, just a collapsed button or a
// missing gap. This is the check that would have caught --space-7.
function declaredTokens(css) {
  const out = new Set();
  for (const m of css.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) out.add(m[1]);
  return out;
}

function checkTokenRefs(where, css, declared) {
  const used = new Set();
  for (const m of css.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)) used.add(m[1]);
  for (const t of [...used].filter((x) => !declared.has(x)).sort()) {
    err(where, `uses ${t}, which no stylesheet declares — the property is dropped silently`);
  }
}

async function checkTheme(slug) {
  const dir = path.join(THEMES, slug);
  const where = `themes/${slug}`;
  let pages = 0;

  const entries = (await readdir(dir, { withFileTypes: true }))
    .filter((e) => e.isFile() && e.name.endsWith(".html"))
    .map((e) => e.name)
    .sort();

  if (!entries.includes("index.html")) err(where, "no index.html");

  for (const name of entries) {
    const html = await readFile(path.join(dir, name), "utf8");
    checkHtml(`${where}/${name}`, html, dir);
    pages++;
  }

  const themeCss = path.join(dir, "theme.css");
  if (!existsSync(themeCss)) {
    err(where, "no theme.css — a theme must define its own token layer");
  } else {
    const css = await readFile(themeCss, "utf8");
    const base = await readFile(path.join(ROOT, "system", "base.css"), "utf8");
    checkTokenRefs(where, css, new Set([...declaredTokens(base), ...declaredTokens(css)]));
    // The theme layer’s whole job is to restate the contract from base.css.
    for (const token of ["--c-ground", "--c-ink", "--c-accent", "--font-display"]) {
      if (!css.includes(token)) warn(where, `theme.css never redefines ${token}`);
    }
    if (!/@layer\s+tokens/.test(css)) {
      warn(where, "theme.css has no @layer tokens block — cascade order is not guaranteed");
    }
  }

  return pages;
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
    ? (await readdir(DESIGNS, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name).sort()
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

  const built = metas.filter((m) => m.status === "built");
  const awaitingReview = built.filter((m) => !m.__reviewed);

  if (awaitingReview.length > BACKLOG_FAIL) {
    err(
      "repo",
      `${awaitingReview.length} built designs have no VALIDATE.md. The routine must stop building until these are reviewed: ${awaitingReview
        .map((m) => m.slug)
        .join(", ")}`
    );
  } else if (awaitingReview.length > BACKLOG_WARN) {
    warn("repo", `${awaitingReview.length} designs awaiting review — the routine halts at ${BACKLOG_FAIL}`);
  }

  const themeSlugs = existsSync(THEMES)
    ? (await readdir(THEMES, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name).sort()
    : [];
  let themePages = 0;
  for (const slug of themeSlugs) themePages += await checkTheme(slug);

  report({
    built: built.length,
    reviewed: built.length - awaitingReview.length,
    awaiting: awaitingReview.length,
    total: briefs.length,
    themes: themeSlugs.length,
    themePages,
  });
}

function report(stats) {
  const line = "-".repeat(66);
  console.log(line);
  if (stats) {
    console.log(
      `themes: ${stats.themes}   theme pages: ${stats.themePages}   designs: ${checked}   built: ${stats.built}   reviewed: ${stats.reviewed}   awaiting review: ${stats.awaiting}   briefs: ${stats.total}`
    );
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
