#!/usr/bin/env node
/**
 * Import a Word (.docx) file into content/stories or content/notes.
 *
 * Usage:
 *   npm run import:docx -- path/to/file.docx --type story|note [--title "כותרת"] [--slug my-slug]
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mammoth from "mammoth";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = { type: null, title: null, slug: null, draft: false };
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--type" && argv[i + 1]) {
      args.type = argv[++i];
    } else if (arg === "--title" && argv[i + 1]) {
      args.title = argv[++i];
    } else if (arg === "--slug" && argv[i + 1]) {
      args.slug = argv[++i];
    } else if (arg === "--draft") {
      args.draft = true;
    } else if (!arg.startsWith("-")) {
      positional.push(arg);
    }
  }

  args.docxPath = positional[0];
  return args;
}

function slugify(text) {
  return (
    text
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\u0590-\u05FF\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase()
      .slice(0, 80) || "untitled"
  );
}

function escapeYaml(value) {
  return JSON.stringify(value);
}

function htmlToMarkdown(html) {
  let md = html;

  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]+src="([^"]+)"[^>]*\/?>/gi, "![]($1)");
  md = md.replace(/<[^>]+>/g, "");
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.trim();

  return md;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.docxPath || !args.type) {
    console.error(`
Usage:
  npm run import:docx -- <file.docx> --type story|note [--title "כותרת"] [--slug slug] [--draft]

Examples:
  npm run import:docx -- ./my-story.docx --type story --title "שם הסיפור"
  npm run import:docx -- ./note.docx --type note --slug my-note-2026
`);
    process.exit(1);
  }

  if (!["story", "note"].includes(args.type)) {
    console.error('Error: --type must be "story" or "note"');
    process.exit(1);
  }

  const docxPath = path.resolve(args.docxPath);
  try {
    await fs.access(docxPath);
  } catch {
    console.error(`Error: file not found: ${docxPath}`);
    process.exit(1);
  }

  const collection = args.type === "story" ? "stories" : "notes";
  const baseName = path.basename(docxPath, path.extname(docxPath));
  const slug = args.slug || slugify(args.title || baseName);
  const title = args.title || baseName;

  const imagesDir = path.join(ROOT, "public", "images", slug);
  await fs.mkdir(imagesDir, { recursive: true });

  const result = await mammoth.convertToHtml(
    { path: docxPath },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        const ext = image.contentType?.split("/")[1] || "png";
        const imageName = `image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const imagePath = path.join(imagesDir, imageName);
        const buffer = await image.read();
        await fs.writeFile(imagePath, buffer);
        const webPath = `/Chanans-literary-site/images/${slug}/${imageName}`;
        return { src: webPath };
      }),
    },
  );

  if (result.messages.length) {
    console.warn("Conversion messages:");
    for (const msg of result.messages) {
      console.warn(`  [${msg.type}] ${msg.message}`);
    }
  }

  let body = htmlToMarkdown(result.value);
  body = body.replace(
    /!\[\]\((\/Chanans-literary-site\/images\/[^)]+)\)/g,
    "![]($1)",
  );

  const today = new Date().toISOString().slice(0, 10);
  const frontmatter = `---
title: ${escapeYaml(title)}
summary: ""
date: ${today}
draft: ${args.draft}
---

`;

  const outDir = path.join(ROOT, "src", "content", collection);
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${slug}.md`);
  await fs.writeFile(outPath, frontmatter + body + "\n", "utf8");

  console.log(`Written: ${outPath}`);
  if (args.draft) {
    console.log("Note: draft=true — set draft: false in frontmatter to publish.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
