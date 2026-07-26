import snapshotData from "../content/luna-snapshot.json";

export type LunaFile = {
  path: string;
  group: string;
  language: string;
  bytes: number;
  lines: number;
  sha256: string;
  content: string;
};

type LunaSnapshot = {
  repository: string;
  commit: string;
  commitDate: string;
  stats: {
    files: number;
    lines: number;
    bytes: number;
    mainSource: {
      files: number;
      lines: number;
      bytes: number;
    };
  };
  files: LunaFile[];
};

export type DocumentDescriptor = {
  slug: string;
  path: string;
  eyebrow: string;
  title: string;
  summary: string;
  readingMinutes: number;
};

export const lunaSnapshot = snapshotData as LunaSnapshot;
export const lunaFiles = lunaSnapshot.files;

const filesByPath = new Map(lunaFiles.map((file) => [file.path, file]));

export const documentDescriptors: DocumentDescriptor[] = [
  {
    slug: "readme",
    path: "README.md",
    eyebrow: "PROJECT",
    title: "项目总览",
    summary: "构建方式、支持范围、质量门禁与完整编译命令。",
    readingMinutes: 4,
  },
  {
    slug: "language",
    path: "docs/language.md",
    eyebrow: "LANGUAGE",
    title: "Luna 0 语言草案",
    summary: "模块、声明、类型、函数、控制流、表达式与初始化规则。",
    readingMinutes: 12,
  },
  {
    slug: "architecture",
    path: "docs/architecture.md",
    eyebrow: "COMPILER",
    title: "编译器架构",
    summary: "从不可变源码到 typed CFG IR，再到 x86-64 与 ELF64。",
    readingMinutes: 9,
  },
  {
    slug: "execution-semantics",
    path: "docs/execution-semantics.md",
    eyebrow: "SEMANTICS",
    title: "执行语义",
    summary: "求值顺序、整数边界、显式转换与 IEEE-754 浮点约束。",
    readingMinutes: 8,
  },
  {
    slug: "roadmap",
    path: "docs/roadmap.md",
    eyebrow: "ROADMAP",
    title: "实现路线图",
    summary: "M0 到 M4 的已验证能力、待实现工作与明确延期范围。",
    readingMinutes: 5,
  },
];

export function getLunaFile(path: string) {
  return filesByPath.get(path);
}

export function getDocument(slug: string) {
  const descriptor = documentDescriptors.find((document) => document.slug === slug);

  if (!descriptor) {
    return undefined;
  }

  const file = getLunaFile(descriptor.path);

  if (!file) {
    return undefined;
  }

  return { descriptor, file };
}

export function sourceHref(path: string) {
  return `/source/${path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export function getGroupCounts() {
  const counts = new Map<string, number>();

  for (const file of lunaFiles) {
    counts.set(file.group, (counts.get(file.group) ?? 0) + 1);
  }

  return [...counts.entries()].map(([label, count]) => ({ label, count }));
}

const fileDescriptions = new Map<string, string>([
  [
    "src/frontend/compiler/main.c",
    "命令行入口：解析目标与输出选项，调用编译流程并把诊断结果转换为进程退出状态。",
  ],
  [
    "src/frontend/compiler/compiler.c",
    "编译协调层：连接源码加载、语法分析、语义降低、IR 验证与后端输出。",
  ],
  [
    "src/frontend/lexer/lexer.c",
    "词法分析器：从不可变源码跨度识别关键字、标点、整数与浮点字面量。",
  ],
  [
    "src/frontend/parser/parser.c",
    "递归下降语法分析器：在 arena 中构造 AST，并对缺失分隔符和病态嵌套恢复诊断。",
  ],
  [
    "src/middleend/sema/sema.c",
    "语义与类型降低：检查名称、精确类型和控制流，并生成强类型 Luna IR。",
  ],
  [
    "src/middleend/ir/ir.c",
    "Typed CFG IR 的构造、打印与独立验证实现，是前端与后端之间的信任边界。",
  ],
  [
    "src/backend/x86_64/x86_64.c",
    "正确性优先的 x86-64 System V 后端：栈上 home、整数/SSE ABI 与汇编输出。",
  ],
  [
    "src/target/target.c",
    "显式目标模型与数据布局，确保目标尺寸类型不读取宿主机器属性。",
  ],
]);

export function describeLunaFile(file: LunaFile) {
  const exact = fileDescriptions.get(file.path);

  if (exact) {
    return exact;
  }

  if (file.path.startsWith("include/")) {
    return "公共接口头文件：定义对应编译器模块的数据结构、所有权边界与可调用 API。";
  }

  if (file.path.startsWith("tests/unit/")) {
    return "单元测试：用可执行断言固定模块行为、边界条件和内部正确性不变量。";
  }

  if (file.path.startsWith("tests/integration/cases/")) {
    return "Luna 集成用例：用于验证成功执行、诊断失败或特定语言语义的完整输入程序。";
  }

  if (file.path.startsWith("tests/integration/golden/")) {
    return "Golden IR 快照：固定前端与中端输出，使语义变化可以被逐行审阅。";
  }

  if (file.path.startsWith("tests/")) {
    return "验证基础设施：属于完整项目树，但不计入主干源码文件数和源码行数。";
  }

  if (file.path.startsWith("docs/")) {
    return "Luna 权威设计文档英文原文；站内文档区同时提供对应的完整中文译文。";
  }

  if (file.path.startsWith("examples/")) {
    return "最小可运行 Luna 示例，属于主干源码统计。";
  }

  if (file.path.startsWith(".github/")) {
    return "持续集成配置：在远端重复执行构建、测试与质量门禁。";
  }

  return "项目工程文件：用于构建、格式、许可或版本控制，不计入主干源码统计。";
}
