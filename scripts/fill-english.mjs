/** Fill english: fields in a poem md from a line-per-stanza text file. */
import { readFileSync, writeFileSync } from "node:fs";

const englishPath = process.argv[2];
const poemPath = process.argv[3];

function yamlQuote(s) {
  return `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

const englishLines = readFileSync(englishPath, "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean);

const md = readFileSync(poemPath, "utf8");
const lines = md.split(/\r?\n/);
const out = [];
let englishIdx = 0;
let pairCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim() === "english: \"\"") {
    if (englishIdx >= englishLines.length) {
      throw new Error(`Ran out of English lines at pair ${pairCount + 1}`);
    }
    out.push(`    english: ${yamlQuote(englishLines[englishIdx])}`);
    englishIdx++;
    pairCount++;
    continue;
  }
  out.push(line);
}

if (englishIdx !== englishLines.length) {
  throw new Error(
    `Line count mismatch: used ${englishIdx} English lines, file has ${englishLines.length}`,
  );
}

writeFileSync(poemPath, out.join("\n"));
console.log(`Filled ${pairCount} english lines in ${poemPath}`);
