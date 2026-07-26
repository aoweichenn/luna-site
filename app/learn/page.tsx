import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "../../components/icons";
import { PageHero } from "../../components/page-hero";
import { sourceHref } from "../../lib/luna-content";

export const metadata: Metadata = {
  title: "学习路径",
  description: "从 C23 工程基线到 x86-64 执行验证的 Luna 编译器分阶段学习路径。",
};

const modules = [
  {
    number: "00",
    label: "BASELINE",
    title: "先把工程做对",
    summary:
      "先建立宿主语言、目标平台和质量门禁的边界，再进入编译器实现。你会理解为什么告警策略也是语言正确性的一部分。",
    topics: ["C23 自举边界", "CMake presets", "目标三元组", "warnings-as-errors"],
    outcome: "能够独立构建、测试并解释 Luna 的工程约束。",
    href: "/standards",
    source: sourceHref("CMakeLists.txt"),
  },
  {
    number: "01",
    label: "FRONTEND",
    title: "从字节到语法树",
    summary:
      "沿 Source、Token、Lexer、Parser 追踪一段真实程序，观察 span、arena 和错误恢复如何协作。",
    topics: ["source span", "token model", "lexer", "parser arena"],
    outcome: "能够从诊断位置反向追到产生它的前端代码。",
    href: "/compiler#frontend",
    source: sourceHref("src/frontend/parser/parser.c"),
  },
  {
    number: "02",
    label: "TYPE SYSTEM",
    title: "让类型拥有语义",
    summary:
      "比较 i32、usize、f32 与 bool 的边界，理解上下文字面量、显式转换和“禁止隐式混用”的价值。",
    topics: ["context typing", "no truthiness", "explicit as", "target-sized types"],
    outcome: "能够判断一个表达式为什么被接受或拒绝。",
    href: "/docs/execution-semantics",
    source: sourceHref("src/middleend/sema/sema.c"),
  },
  {
    number: "03",
    label: "MIDDLE END",
    title: "画出控制流",
    summary:
      "阅读 typed CFG、终结指令、局部槽位和 verifier，理解当前为何刻意不提前引入 SSA。",
    topics: ["basic block", "terminator", "typed value", "IR verifier"],
    outcome: "能够读懂一份 Luna IR 并检查关键不变量。",
    href: "/compiler#typed-ir",
    source: sourceHref("src/middleend/ir/ir.c"),
  },
  {
    number: "04",
    label: "BACKEND",
    title: "落到真实机器",
    summary:
      "从强类型 IR 走到 x86-64 System V：栈帧、整数寄存器、XMM 寄存器、汇编与 ELF64。",
    topics: ["System V ABI", "stack homes", "SSE scalar", "freestanding _start"],
    outcome: "能够把一条 IR 指令对应到生成的机器指令序列。",
    href: "/compiler#backend",
    source: sourceHref("src/backend/x86_64/x86_64.c"),
  },
  {
    number: "05",
    label: "VALIDATION",
    title: "用证据封住语义",
    summary:
      "把单元、负例、IR 快照、差分、变异、fuzz 与 sanitizer 组织成可重复的验证矩阵。",
    topics: ["86 CTest", "golden IR", "differential", "libFuzzer"],
    outcome: "能够为下一项语言能力设计完整的纵向测试切片。",
    href: "/roadmap#verification",
    source: sourceHref("tests/integration/run_integration.py"),
  },
];

export default function LearnPage() {
  return (
    <main id="main">
      <PageHero
        eyebrow="LEARNING PATH"
        title={
          <>
            六个单元，
            <br />
            从工程走到机器。
          </>
        }
        description="按依赖关系学习，而不是按文件大小阅读。每一章都给出概念目标、真实源码入口和完成后的能力判断。"
        aside={
          <div className="hero-note">
            <span>RECOMMENDED ORDER</span>
            <strong>00 → 01 → 02 → 03 → 04 → 05</strong>
            <small>建议先通读，再选择一条源码链深入。</small>
          </div>
        }
      />

      <section className="content-section">
        <div className="shell learning-layout">
          <aside className="learning-sidebar">
            <span>HOW TO USE</span>
            <h2>一章一条纵向切片</h2>
            <p>
              不要求一次读完所有源码。先理解每层输入、输出和不变量，再沿页面提供的文件入口验证。
            </p>
            <div className="learning-legend">
              <div><i /> 概念与设计</div>
              <div><i /> 完整源码入口</div>
              <div><i /> 可验证学习结果</div>
            </div>
          </aside>

          <div className="learning-modules">
            {modules.map((module, index) => (
              <article className="learning-module" key={module.number}>
                <div className="module-index">
                  <span>{module.number}</span>
                  {index < modules.length - 1 ? <i aria-hidden="true" /> : null}
                </div>
                <div className="module-content">
                  <span className="module-label">{module.label}</span>
                  <h2>{module.title}</h2>
                  <p>{module.summary}</p>
                  <div className="module-topics">
                    {module.topics.map((topic) => <span key={topic}>{topic}</span>)}
                  </div>
                  <div className="module-outcome">
                    <CheckIcon />
                    <span>
                      <small>完成标准</small>
                      {module.outcome}
                    </span>
                  </div>
                  <div className="module-actions">
                    <Link href={module.href}>
                      打开学习页
                      <ArrowRightIcon />
                    </Link>
                    <Link href={module.source}>
                      阅读对应源码
                      <ArrowRightIcon />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

