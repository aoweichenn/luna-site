import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const hostingSource = resolve(projectRoot, ".openai", "hosting.json");
const hostingTarget = resolve(projectRoot, "dist", ".openai", "hosting.json");

const hosting = JSON.parse(await readFile(hostingSource, "utf8"));

if (
  typeof hosting.project_id !== "string" ||
  hosting.project_id.trim().length === 0
) {
  throw new Error(".openai/hosting.json must contain a non-empty project_id");
}

await mkdir(dirname(hostingTarget), { recursive: true });
await copyFile(hostingSource, hostingTarget);

console.log("Prepared the Sites deployment metadata in dist/.openai/hosting.json");
