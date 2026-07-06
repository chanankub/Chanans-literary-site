/** Turn Scots line text into poem frontmatter YAML (english + translation empty). */
import { readFileSync, writeFileSync } from "node:fs";

const scotsPath = process.argv[2];
const outPath = process.argv[3];
const metaArg = process.argv[4] || "{}";
const meta = metaArg.endsWith(".json")
  ? JSON.parse(readFileSync(metaArg, "utf8"))
  : JSON.parse(metaArg);

function yamlQuote(s) {
  return `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

const raw = readFileSync(scotsPath, "utf8");
const pairs = [];
let pendingSpacer = false;

for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed) {
    pendingSpacer = true;
    continue;
  }
  if (pendingSpacer && pairs.length > 0) {
    pairs.push({ spacer: true });
    pendingSpacer = false;
  }
  pairs.push({ original: trimmed, english: "", translation: "" });
}

const lines = [
  "---",
  `title: ${yamlQuote(meta.title)}`,
  `originalTitle: ${yamlQuote(meta.originalTitle)}`,
  `author: ${yamlQuote(meta.author)}`,
  `authorEn: ${yamlQuote(meta.authorEn)}`,
  `authorBirth: ${meta.authorBirth}`,
  `authorDeath: ${meta.authorDeath}`,
  `sourceLang: ${yamlQuote(meta.sourceLang ?? "sco")}`,
  `draft: ${meta.draft ?? true}`,
  `order: ${meta.order}`,
  `pairLayout: trilingual`,
  "pairs:",
];

for (const p of pairs) {
  if (p.spacer) {
    lines.push("  - spacer: true");
  } else {
    lines.push(`  - original: ${yamlQuote(p.original)}`);
    lines.push(`    english: ""`);
    lines.push(`    translation: ""`);
  }
}

lines.push("---", "");
writeFileSync(outPath, lines.join("\n"));
console.log(`Wrote ${pairs.filter((p) => !p.spacer).length} lines to ${outPath}`);
