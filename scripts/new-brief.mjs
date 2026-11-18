#!/usr/bin/env node
// Append a brief to the catalogue, so the lab can outlive the original 60.
//
//   node scripts/new-brief.mjs \
//     --industry "glass blower" --aesthetic "bauhaus" \
//     --archetype "card gallery" --constraint "no images at all" \
//     --focus open --techniques "subgrid,color-mix()"

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CATALOG = path.join(ROOT, "catalog", "briefs.json");

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i].replace(/^--/, "");
  args[key] = process.argv[i + 1];
}

const required = ["industry", "aesthetic", "archetype", "constraint"];
const missing = required.filter((k) => !args[k]);
if (missing.length) {
  console.error(`missing required option(s): ${missing.map((m) => "--" + m).join(", ")}`);
  process.exit(1);
}

const catalog = JSON.parse(await readFile(CATALOG, "utf8"));
const id = Math.max(0, ...catalog.briefs.map((b) => b.id)) + 1;

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").split("-").slice(0, 2).join("-");

const slug = `${String(id).padStart(4, "0")}-${slugify(args.industry)}-${slugify(args.aesthetic)}`;

if (catalog.briefs.some((b) => b.slug === slug)) {
  console.error(`slug ${slug} already exists — vary the industry or aesthetic`);
  process.exit(1);
}

catalog.briefs.push({
  id,
  slug,
  industry: args.industry,
  aesthetic: args.aesthetic,
  archetype: args.archetype,
  constraint: args.constraint,
  focus: args.focus || "open",
  techniques: (args.techniques || "").split(",").map((t) => t.trim()).filter(Boolean),
  status: "unbuilt",
  builtAt: null,
});

await writeFile(CATALOG, JSON.stringify(catalog, null, 2) + "\n", "utf8");
console.log(`added brief ${id}: ${slug}`);
