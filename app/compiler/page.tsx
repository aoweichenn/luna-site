import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "../../components/code-block";
import { ArrowRightIcon, CheckIcon } from "../../components/icons";
import { PageHero } from "../../components/page-hero";
import { getLunaFile, sourceHref } from "../../lib/luna-content";

export const metadata: Metadata = {
  title: "编译器流水线",
  description: "逐层理解 Luna 从源码、语义、Typed CFG IR 到 x86-64 ELF64 的完整编译链。",
};

const phases = [
  {
    number: "01",
    id: "source",
    label: "SOURCE",
    title: "源码与诊断",
    description: "不可变源码文件、精确字节跨度，以及对用户稳定且确定的诊断。",
    input: ".luna source unit",
    output: "source spans",
    invariant: "无效输入只产生诊断与非零退出码，不能崩溃或越界读取。",
    evidence: "SourceTest · DiagnosticTest",
    file: "src/frontend/source/source.c",
  },
  {
    number: "02",
    id: "frontend",
    label: "FRONTEND",
    title: "词法与语法",
    description: "Lexer 识别 token，Parser 使用 arena 构造保留源 span 的语法树。",
    input: "source spans",
    output: "syntax tree",
    invariant: "缺失分隔符、病态嵌套和非法字面量均可恢复并报告。",
    evidence: "LexerTest · ParserTest",
    file: "src/frontend/parser/parser.c",
  },
  {
    number: "03",
    id: "semantics",
    label: "SEMANTICS",
    title: "名称与类型",
    description: "上下文确定字面量类型，已类型化的值不发生隐式跨宽度或跨域转换。",
    input: "syntax tree",
    output: "checked body",
    invariant: "条件必须是 bool；整数、浮点和有无符号混用必须显式。",
    evidence: "SemaTest · negative cases",
    file: "src/middleend/sema/sema.c",
  },
  {
    number: "04",
    id: "typed-ir",
    label: "MIDDLE END",
    title: "Typed CFG IR",
    description: "非 SSA 的强类型控制流图，使用虚拟值和显式局部槽位表达计算。",
    input: "checked body",
    output: "verified Luna IR",
    invariant: "可达块恰有一个 terminator；定义、类型、调用签名和前驱独立验证。",
    evidence: "IrVerifierTest · IR snapshots",
    file: "src/middleend/ir/ir.c",
  },
  {
    number: "05",
    id: "backend",
    label: "BACKEND",
    title: "x86-64 指令选择",
    description: "直接选择 System V 指令，整数参数和 SSE 参数使用独立寄存器组。",
    input: "verified Luna IR",
    output: "x86-64 assembly",
    invariant: "当前值均有 stack home，以简单、可追踪的后端作为正确性参照。",
    evidence: "X8664BackendTest · LLVM MC",
    file: "src/backend/x86_64/x86_64.c",
  },
  {
    number: "06",
    id: "execution",
    label: "EXECUTION",
    title: "链接与执行",
    description: "汇编为 ELF64 对象、静态链接，从自有 _start 进入并通过系统调用退出。",
    input: "assembly",
    output: "observable result",
    invariant: "生成程序不依赖目标 C runtime；原生与 QEMU 执行结果必须一致。",
    evidence: "integration · differential · fuzz",
    file: "tests/integration/run_integration.py",
  },
];

export default function CompilerPage() {
  const source = getLunaFile("tests/integration/cases/floating_ir.luna");
  const ir = getLunaFile("tests/integration/golden/floating_ir.lir");

  return (
    <main id="main">
      <PageHero
        eyebrow="COMPILER ARCHITECTURE"
        title={
          <>
            每一层都能解释，
            <br />
            每一步都有证据。
          </>
        }
        description="Luna 不经由 C/C++ 转译。编译器拥有自己的语言语义，并通过强类型 IR、目标模型和测试门禁把行为一直封到可执行文件。"
        aside={
          <div className="target-card">
            <span>BOOTSTRAP TARGET</span>
            <strong>x86_64</strong>
            <p>Linux · System V · ELF64</p>
            <small>direct instruction selection</small>
          </div>
        }
      />

      <section className="content-section">
        <div className="shell compiler-intro">
          <div className="compiler-diagram" aria-label="Luna 编译流程">
            {["SOURCE", "AST", "SEMA", "TYPED IR", "X86-64", "ELF64"].map(
              (item, index) => (
                <div key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item}</strong>
                  {index < 5 ? <i aria-hidden="true" /> : null}
                </div>
              ),
            )}
          </div>
          <p className="compiler-intro-copy">
            Assembly 是后端输出编码，不是中间语言；LLVM 工具目前只负责把已有
            x86-64 汇编编码为对象并链接测试程序。
          </p>
        </div>
      </section>

      <section className="content-section phase-section">
        <div className="shell phase-list">
          {phases.map((phase) => (
            <article className="phase-card" id={phase.id} key={phase.id}>
              <div className="phase-number">
                <span>{phase.number}</span>
                <small>{phase.label}</small>
              </div>
              <div className="phase-main">
                <h2>{phase.title}</h2>
                <p>{phase.description}</p>
                <dl>
                  <div><dt>INPUT</dt><dd>{phase.input}</dd></div>
                  <div><dt>OUTPUT</dt><dd>{phase.output}</dd></div>
                </dl>
              </div>
              <div className="phase-proof">
                <span><CheckIcon /> 必须守住</span>
                <p>{phase.invariant}</p>
                <small>{phase.evidence}</small>
                <Link href={sourceHref(phase.file)}>
                  完整源码
                  <ArrowRightIcon />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section trace-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="section-kicker">A REAL TRACE</span>
              <h2>同一段程序的 Source 与 IR。</h2>
            </div>
            <p>
              下面不是教学伪代码，而是仓库当前回归用例与对应的完整 golden IR。
            </p>
          </div>
          <div className="trace-grid">
            <article className="trace-panel">
              <header><span>LUNA SOURCE</span><strong>{source?.path}</strong></header>
              <CodeBlock code={source?.content ?? ""} language="luna" />
              {source ? <Link href={sourceHref(source.path)}>在源码浏览器打开 <ArrowRightIcon /></Link> : null}
            </article>
            <article className="trace-panel">
              <header><span>VERIFIED IR</span><strong>{ir?.path}</strong></header>
              <CodeBlock code={ir?.content ?? ""} language="lir" />
              {ir ? <Link href={sourceHref(ir.path)}>在源码浏览器打开 <ArrowRightIcon /></Link> : null}
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

