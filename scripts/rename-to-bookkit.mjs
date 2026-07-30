#!/usr/bin/env node
/**
 * rename-to-bookkit.mjs
 * Renames the leftover "Veya" / "site-creator" placeholders to "BookKit"
 * across the app. Ordered most-specific-first so compound tokens
 * (veya.com, VEY-PENDING, © 2026 Veya Booking) are handled cleanly before
 * the bare "Veya" pass.
 *
 * Usage:  node rename-to-bookkit.mjs [rootDir]
 * Default rootDir = "." (run from repo root).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] || ".";

// files that contain the placeholders (from an audit of the repo)
const FILES = [
  "app/page.tsx",
  "app/layout.tsx",
  "app/lib/supabase-browser.ts",
  "package.json",
];

// ordered: specific compound tokens first, bare word last
const RULES = [
  // package.json template name
  [/site-creator-vinext-starter/g, "bookkit"],
  // slug / URL shown in the builder  (veya.com/ -> bookkit.site/)
  [/veya\.com\//g, "bookkit.site/"],
  [/veya\.com/g, "bookkit.site"],
  // confirmation reference prefix  VEY-PENDING -> BK-PENDING
  [/\bVEY-/g, "BK-"],
  // footer / titles that pair Veya with another word
  [/Veya Booking/g, "BookKit"],
  [/Veya Production/g, "BookKit Production"],
  // possessive: Veya’s / Veya's  -> BookKit’s / BookKit's
  [/Veya\u2019s/g, "BookKit\u2019s"],
  [/Veya's/g, "BookKit's"],
  // the bare brand word
  [/\bVeya\b/g, "BookKit"],
  // all-caps UI labels: VEYA -> BOOKKIT (but not the VEY- ref prefix, handled above)
  [/\bVEYA\b/g, "BOOKKIT"],

  // --- visible logo wordmark ---
  // Pattern: <span className="brand-mark">V</span><span>veya</span>
  // The "V" mark + "veya" together render the logo. Replace the lowercase
  // wordmark with "BookKit" and drop the now-redundant single-letter mark's
  // letter to "B" so the logo reads correctly.
  [/(<span className="brand-mark">)V(<\/span>\s*<span>)veya(<\/span>)/g, "$1B$2ookKit$3"],
  [/(<span className="brand-mark">)V(<\/span>\s*<strong>)veya(<\/strong>)/g, "$1B$2ookKit$3"],
  // any remaining standalone lowercase wordmark in a tag
  [/(<span>)veya(<\/span>)/g, "$1BookKit$2"],
  [/(<strong>)veya(<\/strong>)/g, "$1BookKit$2"],

  // --- code references (rename the string; the matching file/route must be
  //     renamed too — see note printed at the end) ---
  [/\/api\/veya/g, "/api/bookkit"],
  // any /veya-*.(png|jpg|webp|svg) image asset in /public
  [/\/veya-([a-z0-9-]+\.(?:png|jpg|jpeg|webp|svg))/g, "/bookkit-$1"],
];

let totalReplacements = 0;
const summary = [];

for (const rel of FILES) {
  const path = join(root, rel);
  if (!existsSync(path)) { summary.push(`  (skip, not found) ${rel}`); continue; }
  let text = readFileSync(path, "utf8");
  const before = text;
  let fileCount = 0;
  for (const [re, to] of RULES) {
    text = text.replace(re, (m) => { fileCount++; return to; });
  }
  if (text !== before) {
    writeFileSync(path, text);
    totalReplacements += fileCount;
    summary.push(`  ✓ ${rel} — ${fileCount} replacements`);
  } else {
    summary.push(`  · ${rel} — no changes`);
  }
}

console.log("Rename → BookKit");
console.log(summary.join("\n"));
console.log(`\nTotal: ${totalReplacements} replacements`);

// verify nothing left behind
let leftover = 0;
for (const rel of FILES) {
  const path = join(root, rel);
  if (!existsSync(path)) continue;
  const t = readFileSync(path, "utf8");
  const m = t.match(/veya/gi);
  if (m) { leftover += m.length; console.log(`  ⚠ ${rel} still has ${m.length} "veya" occurrence(s)`); }
}
console.log(leftover === 0 ? "✓ No 'veya' occurrences remain." : `✗ ${leftover} leftover — review above.`);

console.log(`
Note — two code references were renamed in text; rename the matching files too:
  • /api/veya  → /api/bookkit   (rename the route dir/handler that serves it)
  • /veya-hero-braid-distinct.png → /bookkit-hero-braid-distinct.png
    (rename the file in /public accordingly)
If you'd rather keep those internal names, revert just those two rules — they're
not user-visible. Everything else (titles, logo, copy, footer) is now BookKit.`);

process.exit(leftover === 0 ? 0 : 1);
