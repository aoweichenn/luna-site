import {
  copyFile,
  mkdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const hostingSource = resolve(projectRoot, ".openai", "hosting.json");
const hostingTarget = resolve(projectRoot, "dist", ".openai", "hosting.json");
const serverEntry = resolve(projectRoot, "dist", "server", "index.js");
const serverHandler = resolve(projectRoot, "dist", "server", "handler.js");

const hosting = JSON.parse(await readFile(hostingSource, "utf8"));

if (
  typeof hosting.project_id !== "string" ||
  hosting.project_id.trim().length === 0
) {
  throw new Error(".openai/hosting.json must contain a non-empty project_id");
}

await mkdir(dirname(hostingTarget), { recursive: true });
await copyFile(hostingSource, hostingTarget);

await rename(serverEntry, serverHandler);
await writeFile(
  serverEntry,
  `import handler from "./handler.js";

export * from "./handler.js";

export default {
  fetch(request, _environment, executionContext) {
    return handler(request, executionContext);
  },
};
`,
  "utf8",
);

console.log(
  "Prepared the Sites metadata and Worker-compatible vinext entrypoint",
);
