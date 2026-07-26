import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDirectory, "..");
const documentsDirectory = resolve(siteRoot, "content", "docs-zh");
const outputPath = resolve(siteRoot, "content", "docs-zh.json");
const slugs = [
  "readme",
  "language",
  "architecture",
  "execution-semantics",
  "roadmap",
];

const documents = Object.fromEntries(
  slugs.map((slug) => [
    slug,
    readFileSync(resolve(documentsDirectory, `${slug}.md`), "utf8").replace(
      /\r\n?/g,
      "\n",
    ),
  ]),
);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(documents, null, 2)}\n`, "utf8");

console.log(`Built ${slugs.length} Chinese documents`);
