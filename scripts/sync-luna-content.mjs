import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDirectory, "..");
const sourceRoot = resolve(
  process.env.LUNA_SOURCE_ROOT ?? resolve(siteRoot, "../luna"),
);
const outputPath = resolve(siteRoot, "content", "luna-snapshot.json");

const runGit = (...args) =>
  execFileSync("git", ["-C", sourceRoot, ...args], {
    encoding: "utf8",
  }).trim();

const languageByExtension = new Map([
  [".c", "c"],
  [".h", "c"],
  [".cpp", "cpp"],
  [".hpp", "cpp"],
  [".luna", "luna"],
  [".lir", "lir"],
  [".md", "markdown"],
  [".py", "python"],
  [".yml", "yaml"],
  [".yaml", "yaml"],
  [".json", "json"],
  [".txt", "text"],
]);

function getLanguage(path) {
  const basename = path.split("/").at(-1) ?? path;

  if (basename === "CMakeLists.txt" || basename.endsWith(".cmake")) {
    return "cmake";
  }

  if (basename === ".clang-format" || basename === ".editorconfig") {
    return "config";
  }

  if (basename === ".gitignore") {
    return "text";
  }

  return languageByExtension.get(extname(path)) ?? "text";
}

function getGroup(path) {
  if (path.startsWith("src/")) {
    return "编译器实现";
  }

  if (path.startsWith("include/")) {
    return "公共头文件";
  }

  if (path.startsWith("tests/")) {
    return "测试与验证";
  }

  if (path.startsWith("docs/")) {
    return "设计文档";
  }

  if (path.startsWith("examples/")) {
    return "示例程序";
  }

  if (path.startsWith(".github/")) {
    return "持续集成";
  }

  return "工程配置";
}

const commit = runGit("rev-parse", "HEAD");
const commitDate = runGit("show", "-s", "--format=%cI", "HEAD");
const paths = execFileSync("git", ["-C", sourceRoot, "ls-files", "-z"])
  .toString("utf8")
  .split("\0")
  .filter(Boolean)
  .sort((left, right) => left.localeCompare(right, "en"));

const files = paths.map((path) => {
  const absolutePath = resolve(sourceRoot, path);
  const original = readFileSync(absolutePath);
  const content = original.toString("utf8").replace(/\r\n?/g, "\n");
  const newlineCount = content.split("\n").length - 1;

  return {
    path,
    group: getGroup(path),
    language: getLanguage(path),
    bytes: statSync(absolutePath).size,
    lines:
      content.length === 0
        ? 0
        : newlineCount + (content.endsWith("\n") ? 0 : 1),
    sha256: createHash("sha256").update(original).digest("hex"),
    content,
  };
});

const mainSourceFiles = files.filter(
  (file) =>
    file.path.startsWith("src/") ||
    file.path.startsWith("include/") ||
    file.path.startsWith("examples/"),
);

const snapshot = {
  repository: "https://github.com/aoweichenn/luna",
  commit,
  commitDate,
  stats: {
    files: files.length,
    lines: files.reduce((total, file) => total + file.lines, 0),
    bytes: files.reduce((total, file) => total + file.bytes, 0),
    mainSource: {
      files: mainSourceFiles.length,
      lines: mainSourceFiles.reduce((total, file) => total + file.lines, 0),
      bytes: mainSourceFiles.reduce((total, file) => total + file.bytes, 0),
    },
  },
  files,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

console.log(
  `Synced ${snapshot.stats.files} tracked files; main source is ${snapshot.stats.mainSource.files} files and ${snapshot.stats.mainSource.lines} lines`,
);
