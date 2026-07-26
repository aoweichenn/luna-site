"use client";

import { useEffect, useMemo, useState } from "react";

type TraceTab = "source" | "ir" | "assembly";

type PipelinePhase = {
  id: string;
  number: string;
  label: string;
  title: string;
  summary: string;
  input: string;
  output: string;
  invariant: string;
  evidence: string;
};

type GuideTopic = {
  label: string;
  question: string;
  answer: string;
  footnote: string;
};

const navigation = [
  { id: "pipeline", label: "编译链" },
  { id: "learn", label: "学习路径" },
  { id: "standards", label: "工程规范" },
  { id: "roadmap", label: "当前进度" },
];

const pipeline: PipelinePhase[] = [
  {
    id: "source",
    number: "01",
    label: "SOURCE",
    title: "源码与诊断",
    summary: "不可变源码、精确字节跨度，以及面向人的确定性错误信息。",
    input: ".luna source unit",
    output: "source spans",
    invariant: "每个诊断都能回到原始字节范围；无效输入只报错，不崩溃。",
    evidence: "SourceTest · DiagnosticTest",
  },
  {
    id: "syntax",
    number: "02",
    label: "FRONTEND",
    title: "词法与语法",
    summary: "识别模块、函数、表达式和控制流，AST 节点统一由 arena 管理。",
    input: "source spans",
    output: "syntax tree",
    invariant: "病态嵌套、缺失分隔符与非法字面量均可恢复并给出诊断。",
    evidence: "LexerTest · ParserTest",
  },
  {
    id: "sema",
    number: "03",
    label: "SEMANTICS",
    title: "名称与类型",
    summary: "上下文确定字面量类型，拒绝所有未声明的隐式数值混用。",
    input: "syntax tree",
    output: "checked body",
    invariant: "bool 才能作为条件；跨宽度、跨符号、整数与浮点均须显式转换。",
    evidence: "SemaTest · negative cases",
  },
  {
    id: "ir",
    number: "04",
    label: "MIDDLE END",
    title: "Typed CFG IR",
    summary: "非 SSA 的强类型控制流图，使用虚拟值与显式局部槽位。",
    input: "checked body",
    output: "verified Luna IR",
    invariant: "可达块恰有一个终结指令；操作数、结果、调用签名全部独立验证。",
    evidence: "IrVerifierTest · IR snapshots",
  },
  {
    id: "backend",
    number: "05",
    label: "BACKEND",
    title: "x86-64 选择",
    summary: "直接选择 System V 指令；整数与 SSE 参数寄存器组独立分类。",
    input: "verified Luna IR",
    output: "x86-64 assembly",
    invariant: "当前后端不优化、值均有栈 home，作为未来优化后端的正确性参照。",
    evidence: "X8664BackendTest · LLVM MC",
  },
  {
    id: "execute",
    number: "06",
    label: "EXECUTION",
    title: "链接与验证",
    summary: "汇编为 ELF64，静态链接，从自有 _start 进入并以系统调用退出。",
    input: "assembly",
    output: "observable result",
    invariant: "生成程序不依赖目标 C 运行库；原生或 QEMU 执行结果必须一致。",
    evidence: "integration · differential · fuzz",
  },
];

const traceSnippets: Record<TraceTab, string> = {
  source: `module tests.floating_ir;

fn combine(left: f32, right: f32) -> f32 {
    let negative: f32 = -left;
    return (negative + right) * 2.0 / 4.0;
}

fn less(left: f64, right: f64) -> bool {
    return left < right;
}`,
  ir: `ir luna.v0
target "x86_64-unknown-linux-gnu"

fn @combine($0: f32, $1: f32) -> f32 {
bb0:
  %0 = load.f32 $0
  %1 = neg.f32 %0
  store $2, %1
  %2 = load.f32 $2
  %3 = load.f32 $1
  %4 = add.f32 %2, %3
  %5 = const.f32 0x40000000
  %6 = mul.f32 %4, %5
  %7 = const.f32 0x40800000
  %8 = div.f32 %6, %7
  return %8
}`,
  assembly: `.Lfn0_bb0:
    movl    -8(%rbp), %eax
    movl    %eax, -32(%rbp)
    movl    -32(%rbp), %eax
    xorl    $0x80000000, %eax
    movl    %eax, -40(%rbp)
    movss   -48(%rbp), %xmm0
    addss   -56(%rbp), %xmm0
    movss   %xmm0, -64(%rbp)
    movss   -64(%rbp), %xmm0
    mulss   -72(%rbp), %xmm0
    movss   -80(%rbp), %xmm0
    divss   -88(%rbp), %xmm0
    movss   -96(%rbp), %xmm0
    jmp     .Lfn0_return`,
};

const learningModules = [
  {
    number: "00",
    eyebrow: "BASELINE",
    title: "先把工程做对",
    copy: "理解 C23 自举边界、目标三元组、严格告警策略，以及为什么质量门禁属于语言实现的一部分。",
    concepts: ["CMake presets", "warnings-as-errors", "target model"],
    status: "可学习",
  },
  {
    number: "01",
    eyebrow: "FRONTEND",
    title: "从字节到语法树",
    copy: "沿着 Source → Token → AST 追踪一段真实程序，观察 span、arena 与错误恢复如何协作。",
    concepts: ["source span", "lexer", "parser arena"],
    status: "已闭环",
  },
  {
    number: "02",
    eyebrow: "TYPE SYSTEM",
    title: "让类型拥有语义",
    copy: "比较 i32、usize、f32 与 bool 的边界；理解上下文字面量不是隐式类型转换。",
    concepts: ["context typing", "no truthiness", "explicit as"],
    status: "已闭环",
  },
  {
    number: "03",
    eyebrow: "MIDDLE END",
    title: "画出控制流",
    copy: "阅读 typed CFG、终结指令、局部槽位和 verifier，理解为什么当前刻意不使用 SSA。",
    concepts: ["basic block", "terminator", "IR verifier"],
    status: "已闭环",
  },
  {
    number: "04",
    eyebrow: "BACKEND",
    title: "落到真实机器",
    copy: "从强类型 IR 走到 x86-64 System V：栈帧、整数寄存器、XMM 寄存器与 ELF64。",
    concepts: ["SysV ABI", "SSE scalar", "stack homes"],
    status: "已闭环",
  },
  {
    number: "05",
    eyebrow: "VALIDATION",
    title: "用证据封住语义",
    copy: "把单元、负例、快照、差分、变异、fuzz 和 sanitizer 组织为可重复的验证矩阵。",
    concepts: ["86 CTest", "differential", "libFuzzer"],
    status: "持续执行",
  },
];

const standards = [
  {
    marker: "C23",
    title: "语言边界明确",
    copy: "自举编译器使用标准 C23，关闭编译器扩展。Luna 直接降低到自有 typed CFG IR，不经由 C 或 C++ 转译。",
  },
  {
    marker: "80",
    title: "格式可机械执行",
    copy: "4 空格缩进、80 列、右侧指针对齐、同一行左花括号；格式规则写入 .clang-format，而非停留在口头约定。",
  },
  {
    marker: "W!",
    title: "告警就是失败",
    copy: "-Wall、-Wextra、-Wpedantic、-Wconversion、-Wshadow 等全部配合 -Werror，尽早暴露宿主 C 的危险边界。",
  },
  {
    marker: "IR✓",
    title: "信任必须有边界",
    copy: "后端只接收经过 verifier 的 IR。用户错误返回诊断和非零退出码；内部图结构与类型不变量另行验证。",
  },
  {
    marker: "ABI",
    title: "目标不是宿主",
    copy: "目标描述在语义降低前冻结，并随 IR 携带。isize 与 usize 的宽度来自目标数据布局，永远不偷用宿主属性。",
  },
  {
    marker: "DET",
    title: "结果必须可复现",
    copy: "标签、符号、诊断、随机种子和文本 IR 都保持确定性，让回归失败可以定位、复现并审阅。",
  },
];

const completedM1 = [
  "i64 完整垂直切片",
  "10 种整数全部显式互转",
  "u32 / u64 无符号语义",
  "类型导向的通用整数 IR",
  "全部定宽整数",
  "isize / usize 与目标布局",
  "f32 / f64 IEEE-754 路径",
  "显式 x86-64 目标模型",
];

const pendingM1 = [
  {
    title: "其余标量显式转换",
    note: "下一阶段",
    copy: "补齐 f32 ↔ f64、整数 ↔ 浮点转换；指针转换等待原始指针类型一并闭环。",
  },
  {
    title: "完整运算符与控制流",
    note: "随后",
    copy: "完成剩余运算符以及 do / for / switch，并扩展语义、IR 和执行测试。",
  },
  {
    title: "指针、数组与字符串",
    note: "M1",
    copy: "引入原始指针、定长数组和字符串字面量，明确地址、生命周期与边界语义。",
  },
  {
    title: "外部 C 声明",
    note: "M1 收口",
    copy: "完成 C ABI 边界，让 Luna 可以显式声明和调用外部 C 函数。",
  },
];

const verification = [
  {
    count: "83",
    title: "单元测试",
    copy: "覆盖 arena、源码、诊断、lexer、parser、sema、IR、target 与 x86-64 backend。",
  },
  {
    count: "01",
    title: "端到端集成",
    copy: "真实汇编、静态链接并执行 ELF64；同时验证应当失败的源程序。",
  },
  {
    count: "02",
    title: "随机门禁",
    copy: "变异输入保证干净前端结果总能通过 IR 验证；生成程序执行差分对照。",
  },
  {
    count: "5K",
    title: "Fuzz 运行",
    copy: "Clang/libFuzzer 配合 UBSan 与 ASan，覆盖前端攻击面和宿主未定义行为。",
  },
];

const guideTopics: GuideTopic[] = [
  {
    label: "架构选择",
    question: "为什么 Luna 不先转译成 C？",
    answer:
      "因为编译器要亲自拥有语言语义。若经由 C，求值顺序、整数溢出、类型宽度和 ABI 细节都会被宿主语言重新解释。Luna 选择 Source → Typed CFG IR → x86-64，让每个行为都能在自己的执行契约中验证。",
    footnote: "依据：docs/architecture.md · Non-negotiable boundaries",
  },
  {
    label: "IR 设计",
    question: "为什么当前 IR 不是 SSA？",
    answer:
      "当前目标是建立可证明正确的垂直切片。显式局部槽位让可变变量和控制流降低保持直接，避免过早引入 phi 节点。等机器 IR、活跃性和寄存器分配开始后，再用实际收益决定 SSA 的位置。",
    footnote: "依据：docs/architecture.md · Luna IR",
  },
  {
    label: "当前阶段",
    question: "下一步最合理的实现是什么？",
    answer:
      "先完成剩余标量转换：f32 与 f64 互转、整数与浮点互转，并给每类舍入、范围和边界行为建立执行测试。原始指针尚未落地，因此指针转换应与指针类型阶段一起完成。",
    footnote: "依据：docs/roadmap.md · M1 accepted scalar language",
  },
  {
    label: "浮点语义",
    question: "f32 / f64 现在真的走通了吗？",
    answer:
      "是。当前实现包含上下文字面量与直接目标精度舍入、强类型 IR、IEEE-754 标量算术和有序比较、SSE 指令选择，以及与整数参数组相互独立的 8 个 XMM 参数寄存器。",
    footnote: "证据：SemaTest · IrVerifierTest · X8664BackendTest",
  },
];

const commandItems = [
  {
    label: "编译流水线",
    meta: "页面章节",
    target: "pipeline",
    keywords: "pipeline lexer parser ir backend x86",
  },
  {
    label: "学习路径",
    meta: "页面章节",
    target: "learn",
    keywords: "learn docs guide chapter",
  },
  {
    label: "C23 工程规范",
    meta: "页面章节",
    target: "standards",
    keywords: "c23 clang format warning style",
  },
  {
    label: "M1 当前进度",
    meta: "页面章节",
    target: "roadmap",
    keywords: "m1 progress next conversions",
  },
  {
    label: "验证矩阵",
    meta: "页面章节",
    target: "verification",
    keywords: "test fuzz sanitizer differential",
  },
  {
    label: "语言设计草案",
    meta: "GitHub 文档",
    href: "https://github.com/aoweichenn/luna/blob/main/docs/language.md",
    keywords: "language syntax types",
  },
  {
    label: "编译器架构",
    meta: "GitHub 文档",
    href: "https://github.com/aoweichenn/luna/blob/main/docs/architecture.md",
    keywords: "architecture compiler",
  },
  {
    label: "执行语义",
    meta: "GitHub 文档",
    href: "https://github.com/aoweichenn/luna/blob/main/docs/execution-semantics.md",
    keywords: "semantics ieee integer",
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M7 5H5.8A1.8 1.8 0 0 0 4 6.8v7.4A1.8 1.8 0 0 0 5.8 16h7.4a1.8 1.8 0 0 0 1.8-1.8V13M10 4h6v6M9 11l7-7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m4 10 4 4 8-9" />
    </svg>
  );
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function LabExperience() {
  const [traceTab, setTraceTab] = useState<TraceTab>("source");
  const [activePhase, setActivePhase] = useState(0);
  const [guideTopic, setGuideTopic] = useState(0);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("pipeline");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setCommandOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const sections = navigation
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-28% 0px -58%",
        threshold: [0, 0.2, 0.5],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = commandOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [commandOpen]);

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) {
      return commandItems;
    }

    return commandItems.filter((item) =>
      `${item.label} ${item.meta} ${item.keywords}`
        .toLocaleLowerCase()
        .includes(normalized),
    );
  }, [query]);

  const handleCommand = (item: (typeof commandItems)[number]) => {
    setCommandOpen(false);
    setQuery("");

    if ("href" in item && item.href) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }

    if ("target" in item && item.target) {
      window.setTimeout(() => scrollToSection(item.target), 50);
    }
  };

  const copyBuildCommand = async () => {
    await navigator.clipboard.writeText(
      "cmake --preset debug && cmake --build --preset debug && ctest --preset debug",
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>

      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#top" aria-label="Luna Compiler Lab 首页">
            <span className="brand-mark" aria-hidden="true">
              <span />
            </span>
            <span className="brand-copy">
              <strong>LUNA</strong>
              <small>COMPILER LAB</small>
            </span>
          </a>

          <nav className="desktop-nav" aria-label="主要导航">
            {navigation.map((item) => (
              <a
                className={activeSection === item.id ? "active" : ""}
                href={`#${item.id}`}
                key={item.id}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <button
              className="command-trigger"
              type="button"
              onClick={() => setCommandOpen(true)}
              aria-label="打开页面探索器"
            >
              <span>探索</span>
              <kbd>⌘ K</kbd>
            </button>
            <a
              className="github-link"
              href="https://github.com/aoweichenn/luna"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
              <ExternalIcon />
            </a>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-orbit orbit-one" aria-hidden="true" />
          <div className="hero-orbit orbit-two" aria-hidden="true" />

          <div className="container hero-layout">
            <div className="hero-copy">
              <div className="hero-kicker">
                <span className="status-pulse" />
                C23 BOOTSTRAP · X86-64 SYSTEM V
              </div>
              <h1>
                读懂一门语言，
                <br />
                亲手走完一条
                <span>编译链。</span>
              </h1>
              <p className="hero-lead">
                Luna 是一门小而严格的系统语言，也是一座可以逐层拆开的编译器实验室。
                从源码、类型与 CFG IR，一直抵达真正执行的 ELF64。
              </p>
              <div className="hero-ctas">
                <a className="primary-cta" href="#learn">
                  从学习路径开始
                  <ArrowIcon />
                </a>
                <a className="text-cta" href="#pipeline">
                  打开编译路径
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
              <div className="hero-facts" aria-label="项目数据">
                <div>
                  <strong>86</strong>
                  <span>当前 CTest</span>
                </div>
                <div>
                  <strong>8/12</strong>
                  <span>M1 已完成</span>
                </div>
                <div>
                  <strong>0</strong>
                  <span>转译中间层</span>
                </div>
              </div>
            </div>

            <div className="trace-shell">
              <div className="trace-rail" aria-hidden="true">
                <span>TRACE / 001</span>
                <span>VERIFIED</span>
              </div>
              <div className="trace-window">
                <div className="window-bar">
                  <div className="window-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </div>
                  <span>floating_ir.luna</span>
                  <span className="window-target">x86_64</span>
                </div>
                <div className="trace-tabs" role="tablist" aria-label="编译产物">
                  {(
                    [
                      ["source", "Luna"],
                      ["ir", "Typed IR"],
                      ["assembly", "x86-64"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={traceTab === id}
                      className={traceTab === id ? "active" : ""}
                      key={id}
                      onClick={() => setTraceTab(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <pre className="trace-code" aria-live="polite">
                  <code>{traceSnippets[traceTab]}</code>
                </pre>
                <div className="trace-footer">
                  <span>
                    <i className="ok-dot" /> 来自真实回归用例
                  </span>
                  <span>无优化 · 可追踪</span>
                </div>
              </div>
            </div>
          </div>

          <div className="type-ribbon" aria-label="当前标量类型">
            <div className="type-ribbon-track">
              <span>bool</span>
              <span>i8</span>
              <span>i16</span>
              <span>i32</span>
              <span>i64</span>
              <span>isize</span>
              <span>u8</span>
              <span>u16</span>
              <span>u32</span>
              <span>u64</span>
              <span>usize</span>
              <span>f32</span>
              <span>f64</span>
              <span>void</span>
            </div>
          </div>
        </section>

        <section className="section pipeline-section" id="pipeline">
          <div className="container">
            <div className="section-heading split-heading">
              <div>
                <span className="eyebrow">THE COMPILER PATH</span>
                <h2>每一层都能解释，<br />每一步都有证据。</h2>
              </div>
              <p>
                Luna 不把复杂度藏在黑盒里。选择任一阶段，查看它接收什么、
                产出什么，以及必须守住的正确性边界。
              </p>
            </div>

            <div className="pipeline-map">
              <div className="phase-list" role="tablist" aria-label="编译器阶段">
                {pipeline.map((phase, index) => (
                  <button
                    key={phase.id}
                    type="button"
                    role="tab"
                    aria-selected={activePhase === index}
                    className={activePhase === index ? "phase active" : "phase"}
                    onClick={() => setActivePhase(index)}
                  >
                    <span className="phase-number">{phase.number}</span>
                    <span className="phase-name">
                      <small>{phase.label}</small>
                      <strong>{phase.title}</strong>
                    </span>
                    <span className="phase-arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                ))}
              </div>

              <article className="phase-detail" aria-live="polite">
                <div className="phase-detail-top">
                  <span>
                    STEP {pipeline[activePhase].number} / {pipeline.length
                      .toString()
                      .padStart(2, "0")}
                  </span>
                  <span>ACTIVE LAYER</span>
                </div>
                <h3>{pipeline[activePhase].title}</h3>
                <p className="phase-summary">{pipeline[activePhase].summary}</p>
                <div className="io-flow">
                  <div>
                    <small>INPUT</small>
                    <strong>{pipeline[activePhase].input}</strong>
                  </div>
                  <span aria-hidden="true">
                    <i />
                    <ArrowIcon />
                  </span>
                  <div>
                    <small>OUTPUT</small>
                    <strong>{pipeline[activePhase].output}</strong>
                  </div>
                </div>
                <div className="phase-rule">
                  <span className="rule-icon" aria-hidden="true">
                    !
                  </span>
                  <div>
                    <small>必须保持的不变量</small>
                    <p>{pipeline[activePhase].invariant}</p>
                  </div>
                </div>
                <div className="phase-proof">
                  <span>PROOF</span>
                  <strong>{pipeline[activePhase].evidence}</strong>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section learn-section" id="learn">
          <div className="container">
            <div className="section-heading light-heading split-heading">
              <div>
                <span className="eyebrow">LEARNING ROUTE</span>
                <h2>不是看完文档。<br />是建立一张心智地图。</h2>
              </div>
              <div className="heading-aside">
                <p>
                  参考 x86-64 OS Lab 的阶段化学习方式，把 Luna
                  组织为六个可以独立验证、又首尾相接的学习单元。
                </p>
                <a
                  href="https://github.com/aoweichenn/luna/tree/main/docs"
                  target="_blank"
                  rel="noreferrer"
                >
                  阅读原始文档
                  <ExternalIcon />
                </a>
              </div>
            </div>

            <div className="learning-grid">
              {learningModules.map((module) => (
                <article className="learning-card" key={module.number}>
                  <div className="learning-card-head">
                    <span className="module-number">{module.number}</span>
                    <span className="module-status">{module.status}</span>
                  </div>
                  <small>{module.eyebrow}</small>
                  <h3>{module.title}</h3>
                  <p>{module.copy}</p>
                  <ul>
                    {module.concepts.map((concept) => (
                      <li key={concept}>{concept}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div className="doc-deck">
              <div className="doc-deck-copy">
                <span className="eyebrow">DOCUMENT SYSTEM</span>
                <h3>设计、实现与状态，三者分开记录。</h3>
                <p>
                  语言草案描述“接受的设计”，roadmap 只勾选有可执行测试的功能，
                  execution semantics 冻结当前行为，architecture 解释边界与取舍。
                </p>
              </div>
              <div className="doc-stack" aria-label="核心文档">
                <a
                  href="https://github.com/aoweichenn/luna/blob/main/docs/language.md"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>01</span>
                  <div>
                    <strong>language.md</strong>
                    <small>接受的 Luna 0 设计</small>
                  </div>
                  <ExternalIcon />
                </a>
                <a
                  href="https://github.com/aoweichenn/luna/blob/main/docs/architecture.md"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>02</span>
                  <div>
                    <strong>architecture.md</strong>
                    <small>编译器边界与流水线</small>
                  </div>
                  <ExternalIcon />
                </a>
                <a
                  href="https://github.com/aoweichenn/luna/blob/main/docs/execution-semantics.md"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>03</span>
                  <div>
                    <strong>execution-semantics.md</strong>
                    <small>当前可测试执行契约</small>
                  </div>
                  <ExternalIcon />
                </a>
                <a
                  href="https://github.com/aoweichenn/luna/blob/main/docs/roadmap.md"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>04</span>
                  <div>
                    <strong>roadmap.md</strong>
                    <small>实现状态与后续里程碑</small>
                  </div>
                  <ExternalIcon />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section standards-section" id="standards">
          <div className="container">
            <div className="section-heading split-heading">
              <div>
                <span className="eyebrow">ENGINEERING CONTRACT</span>
                <h2>C 规范不是审美，<br />是可执行的约束。</h2>
              </div>
              <p>
                参考项目用词法门禁和架构决策守住 C++ 规范；Luna
                把同一原则落实到 C23、格式化、严格告警和 IR 验证。
              </p>
            </div>

            <div className="standards-grid">
              {standards.map((standard, index) => (
                <article className="standard-card" key={standard.title}>
                  <div className="standard-index">
                    <span>{standard.marker}</span>
                    <small>{(index + 1).toString().padStart(2, "0")}</small>
                  </div>
                  <h3>{standard.title}</h3>
                  <p>{standard.copy}</p>
                </article>
              ))}
            </div>

            <div className="build-strip">
              <div className="build-strip-label">
                <span className="status-pulse" />
                SHORTEST VERIFIED PATH
              </div>
              <code>
                <span>cmake</span> --preset debug
                <i>&amp;&amp;</i> <span>cmake</span> --build --preset debug
                <i>&amp;&amp;</i> <span>ctest</span> --preset debug
              </code>
              <button type="button" onClick={copyBuildCommand}>
                {copied ? "已复制 ✓" : "复制命令"}
              </button>
            </div>
          </div>
        </section>

        <section className="section guide-section" aria-labelledby="guide-title">
          <div className="container guide-layout">
            <div className="guide-intro">
              <span className="eyebrow">LUNA GUIDE</span>
              <h2 id="guide-title">先问“为什么”，<br />再阅读实现。</h2>
              <p>
                这里不是替代源码的聊天机器人，而是一组由项目文档约束的导览答案。
                它帮助你找到问题对应的架构边界，再回到原文和测试。
              </p>
              <div className="guide-avatar" aria-hidden="true">
                <span className="moon-core" />
                <span className="moon-ring ring-a" />
                <span className="moon-ring ring-b" />
              </div>
            </div>

            <div className="guide-console">
              <div className="guide-console-head">
                <div>
                  <span className="guide-online" />
                  DOC-GROUNDED GUIDE
                </div>
                <span>04 TOPICS</span>
              </div>
              <div className="guide-prompts">
                {guideTopics.map((topic, index) => (
                  <button
                    type="button"
                    key={topic.question}
                    className={guideTopic === index ? "active" : ""}
                    onClick={() => setGuideTopic(index)}
                  >
                    <small>{topic.label}</small>
                    {topic.question}
                  </button>
                ))}
              </div>
              <div className="guide-answer" aria-live="polite">
                <div className="guide-answer-label">
                  <span>L</span>
                  <strong>Luna Guide</strong>
                </div>
                <p>{guideTopics[guideTopic].answer}</p>
                <small>{guideTopics[guideTopic].footnote}</small>
              </div>
            </div>
          </div>
        </section>

        <section className="section roadmap-section" id="roadmap">
          <div className="container">
            <div className="roadmap-top">
              <div className="progress-orbit" aria-label="M1 完成 8/12">
                <div>
                  <strong>8</strong>
                  <span>/ 12</span>
                </div>
                <small>M1 COMPLETE</small>
              </div>
              <div className="roadmap-heading">
                <span className="eyebrow">WHERE WE ARE</span>
                <h2>M0 已闭环。<br />M1 正在越过标量边界。</h2>
                <p>
                  当前提交基线 <code>04e9522</code> 已完整实现 f32 / f64。
                  页面只把带可执行测试的能力计为完成。
                </p>
              </div>
            </div>

            <div className="roadmap-board">
              <div className="done-column">
                <div className="column-head">
                  <span>COMPLETED</span>
                  <strong>8 项</strong>
                </div>
                <ul>
                  {completedM1.map((item) => (
                    <li key={item}>
                      <span className="check">
                        <CheckIcon />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="next-column">
                <div className="column-head">
                  <span>UP NEXT</span>
                  <strong>4 项</strong>
                </div>
                <div className="next-list">
                  {pendingM1.map((item, index) => (
                    <article
                      className={index === 0 ? "next-item highlighted" : "next-item"}
                      key={item.title}
                    >
                      <span>{(index + 9).toString().padStart(2, "0")}</span>
                      <div>
                        <small>{item.note}</small>
                        <h3>{item.title}</h3>
                        <p>{item.copy}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="beyond-m1">
              <span>M2</span>
              <p>聚合类型与模块完成</p>
              <i />
              <span>M3</span>
              <p>生产级 x86-64 后端</p>
              <i />
              <span>M4</span>
              <p>自举与三阶段复现</p>
            </div>
          </div>
        </section>

        <section className="section verification-section" id="verification">
          <div className="container">
            <div className="section-heading split-heading">
              <div>
                <span className="eyebrow">EVIDENCE, NOT CLAIMS</span>
                <h2>每个勾选，<br />都对应可执行证据。</h2>
              </div>
              <p>
                86 项 CTest 是当前可见门禁；Clang / GCC、Debug /
                Release、UBSan、ASan 与覆盖引导 fuzz 共同检查宿主实现。
              </p>
            </div>

            <div className="verification-grid">
              {verification.map((item) => (
                <article key={item.title}>
                  <strong>{item.count}</strong>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="test-flow">
              {["SOURCE", "PARSE", "TYPE", "VERIFY", "ASSEMBLE", "RUN"].map(
                (step, index) => (
                  <div className="test-flow-step" key={step}>
                    <span>{step}</span>
                    {index < 5 && <i aria-hidden="true" />}
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="closing">
          <div className="closing-grid" aria-hidden="true" />
          <div className="container closing-inner">
            <span className="eyebrow">BUILD UNDERSTANDING</span>
            <h2>
              编译器不是魔法。
              <br />
              <span>它是一组可以逐项证明的决定。</span>
            </h2>
            <div className="closing-actions">
              <a
                className="primary-cta"
                href="https://github.com/aoweichenn/luna"
                target="_blank"
                rel="noreferrer"
              >
                在 GitHub 阅读源码
                <ExternalIcon />
              </a>
              <button type="button" onClick={() => setCommandOpen(true)}>
                打开文档探索器
                <span>⌘ K</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <span className="brand-mark" aria-hidden="true">
              <span />
            </span>
            <div>
              <strong>Luna Compiler Lab</strong>
              <small>Source → Semantics → Machine</small>
            </div>
          </div>
          <p>
            内容基线：Luna <code>04e9522</code> · 2026-07-26
          </p>
          <a href="#top">
            回到顶部
            <span aria-hidden="true">↑</span>
          </a>
        </div>
      </footer>

      {commandOpen && (
        <div
          className="command-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setCommandOpen(false);
            }
          }}
        >
          <div
            className="command-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="页面探索器"
          >
            <div className="command-search">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="9" cy="9" r="5.5" />
                <path d="m13.2 13.2 4 4" />
              </svg>
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索章节、文档或主题…"
                aria-label="搜索"
              />
              <kbd>ESC</kbd>
            </div>
            <div className="command-results">
              <small>快速前往</small>
              {filteredCommands.length > 0 ? (
                filteredCommands.map((item) => (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => handleCommand(item)}
                  >
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.meta}</small>
                    </span>
                    <ArrowIcon />
                  </button>
                ))
              ) : (
                <p className="empty-result">没有找到匹配内容。</p>
              )}
            </div>
            <div className="command-hint">
              <span>
                <kbd>↵</kbd> 打开
              </span>
              <span>
                <kbd>esc</kbd> 关闭
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
