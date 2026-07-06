/** Fill english: and translation: fields from line-per-stanza text files. */
import { readFileSync, writeFileSync } from "node:fs";

const englishPath = process.argv[2];
const hebrewPath = process.argv[3];
const poemPath = process.argv[4];

function yamlQuote(s) {
  return `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function readLines(path) {
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

const englishLines = readLines(englishPath);
const hebrewLines = readLines(hebrewPath);

const md = readFileSync(poemPath, "utf8");
const lines = md.split(/\r?\n/);
const out = [];
let englishIdx = 0;
let hebrewIdx = 0;
let pairCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim() === 'english: ""') {
    if (englishIdx >= englishLines.length) {
      throw new Error(`Ran out of English lines at pair ${pairCount + 1}`);
    }
    out.push(`    english: ${yamlQuote(englishLines[englishIdx])}`);
    englishIdx++;
    continue;
  }
  if (line.trim() === 'translation: ""') {
    if (hebrewIdx >= hebrewLines.length) {
      throw new Error(`Ran out of Hebrew lines at pair ${pairCount + 1}`);
    }
    out.push(`    translation: ${yamlQuote(hebrewLines[hebrewIdx])}`);
    hebrewIdx++;
    pairCount++;
    continue;
  }
  out.push(line);
}

if (englishIdx !== englishLines.length) {
  throw new Error(
    `English mismatch: used ${englishIdx}, file has ${englishLines.length}`,
  );
}
if (hebrewIdx !== hebrewLines.length) {
  throw new Error(
    `Hebrew mismatch: used ${hebrewIdx}, file has ${hebrewLines.length}`,
  );
}

writeFileSync(poemPath, out.join("\n"));
console.log(`Filled ${pairCount} pairs in ${poemPath}`);
