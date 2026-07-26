import Link from "next/link";
import { CodeBlock } from "../components/code-block";
import {
  ArrowRightIcon,
  BookIcon,
  CodeIcon,
  CompassIcon,
  GitBranchIcon,
} from "../components/icons";
import {
  formatDate,
  getLunaFile,
  lunaSnapshot,
} from "../lib/luna-content";

const routes = [
  {
    number: "01",
    href: "/learn",
    title: "学习路径",
    description: "按先修关系拆分六个学习单元，不必在一个长页面里迷路。",
    tag: "START HERE",
    icon: CompassIcon,
  },
  {
    number: "02",
    href: "/compiler",
    title: "编译器",
    description: "沿 Source、AST、Sema、Typed IR 与 x86-64 逐层阅读。",
    tag: "6 PHASES",
    icon: GitBranchIcon,
  },
  {
    number: "03",
    href: "/docs",
    title: "完整文档",
    description: "在站内阅读语言、架构、执行语义和路线图原文。",
    tag: "5 DOCUMENTS",
    icon: BookIcon,
  },
  {
    number: "04",
    href: "/source",
    title: "完整源码",
    description: "浏览当前提交的全部受版本控制文件，支持检索、行号与复制。",
    tag: `${lunaSnapshot.stats.mainSource.files} SOURCE FILES`,
    icon: CodeIcon,
  },
  {
    number: "05",
    href: "/standards",
    title: "C23 规范",
    description: "理解格式、告警、所有权、错误处理和可验证边界。",
    tag: "ENGINEERING",
    icon: CodeIcon,
  },
  {
    number: "06",
    href: "/roadmap",
    title: "当前路线",
    description: "区分已设计、已实现和下一步，所有结论都回到测试证据。",
    tag: "M0 → M4",
    icon: CompassIcon,
  },
];

const pipeline = [
  ["01", "Source", "不可变字节与精确 span"],
  ["02", "Frontend", "Token、AST 与错误恢复"],
  ["03", "Sema", "名称、类型与显式转换"],
  ["04", "Typed IR", "非 SSA 控制流图与 verifier"],
  ["05", "x86-64", "System V 指令选择"],
  ["06", "ELF64", "汇编、链接与真实执行"],
];

export default function Home() {
  const example =
    getLunaFile("tests/integration/cases/floating_ir.luna") ??
    getLunaFile("examples/hello.luna");

  return (
    <main id="main">
      <section className="home-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />
        <div className="shell home-hero-layout">
          <div className="home-hero-copy">
            <div className="status-line">
              <span />
              VERIFIED SNAPSHOT · {lunaSnapshot.commit.slice(0, 7)}
            </div>
            <h1>
              读完整文档，
              <br />
              看完整源码，
              <br />
              <em>走完一条编译链。</em>
            </h1>
            <p>
              Luna Compiler Lab
              把系统语言设计、C23 编译器工程和真实源码放进一座可导航的学习站。
              每个主题都有独立页面，也始终能回到原始实现。
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/learn">
                开始学习
                <ArrowRightIcon />
              </Link>
              <Link className="button button-ghost" href="/source">
                浏览全部源码
                <CodeIcon />
              </Link>
            </div>
            <dl className="hero-stats">
              <div>
                <dt>{lunaSnapshot.stats.mainSource.files}</dt>
                <dd>主干源码文件</dd>
              </div>
              <div>
                <dt>
                  {lunaSnapshot.stats.mainSource.lines.toLocaleString("zh-CN")}
                </dt>
                <dd>主干源码行</dd>
              </div>
              <div>
                <dt>86</dt>
                <dd>当前 CTest</dd>
              </div>
            </dl>
          </div>

          <div className="hero-code-card">
            <div className="hero-code-toolbar">
              <div className="window-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <span>{example?.path ?? "examples/hello.luna"}</span>
              <strong>LUNA</strong>
            </div>
            <CodeBlock
              code={example?.content ?? ""}
              language="luna"
              compact
              ariaLabel="真实 Luna 回归用例"
            />
            <div className="hero-code-footer">
              <span>
                <i /> TESTED SOURCE
              </span>
              <span>x86_64 · ELF64</span>
            </div>
          </div>
        </div>
        <div className="snapshot-strip">
          <div className="shell">
            <span>内容基线</span>
            <strong>{lunaSnapshot.commit.slice(0, 12)}</strong>
            <span>{formatDate(lunaSnapshot.commitDate)}</span>
            <span>C23 bootstrap</span>
            <span>Typed CFG IR</span>
            <span>System V ABI</span>
          </div>
        </div>
      </section>

      <section className="home-section route-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="section-kicker">CHOOSE A ROUTE</span>
              <h2>内容拆开，理解连起来。</h2>
            </div>
            <p>
              首页只负责建立坐标。深入内容分别进入自己的页面，文档和源码不再藏在长页面底部。
            </p>
          </div>
          <div className="route-grid">
            {routes.map((route) => {
              const Icon = route.icon;

              return (
                <Link className="route-card" href={route.href} key={route.href}>
                  <div className="route-card-top">
                    <span>{route.number}</span>
                    <Icon />
                  </div>
                  <small>{route.tag}</small>
                  <h3>{route.title}</h3>
                  <p>{route.description}</p>
                  <span className="route-card-link">
                    打开页面
                    <ArrowRightIcon />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-section pipeline-preview">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="section-kicker">THE COMPILER PATH</span>
              <h2>六层边界，一条证据链。</h2>
            </div>
            <Link className="inline-link" href="/compiler">
              深入编译器架构
              <ArrowRightIcon />
            </Link>
          </div>
          <div className="pipeline-rail">
            {pipeline.map(([number, title, detail]) => (
              <Link href="/compiler" key={number}>
                <span>{number}</span>
                <strong>{title}</strong>
                <small>{detail}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section reference-section">
        <div className="shell reference-layout">
          <div className="reference-copy">
            <span className="section-kicker">LIVING REFERENCE</span>
            <h2>不是介绍页，是可以查证的学习资料。</h2>
            <p>
              站内文档来自 Luna 当前提交；源码浏览器覆盖仓库全部受版本控制文件。
              每个文件保留完整内容、行号、大小与内容哈希，并可跳回 GitHub 原文件。
            </p>
            <div className="reference-actions">
              <Link className="button button-light" href="/docs">
                <BookIcon />
                阅读完整文档
              </Link>
              <Link className="button button-outline-light" href="/source">
                <CodeIcon />
                检索 {lunaSnapshot.stats.files} 个文件
              </Link>
            </div>
          </div>
          <div className="reference-index">
            <div>
              <span>DOC / 01</span>
              <strong>语言草案</strong>
              <small>语法与类型边界</small>
            </div>
            <div>
              <span>DOC / 02</span>
              <strong>编译器架构</strong>
              <small>阶段与正确性不变量</small>
            </div>
            <div>
              <span>TREE / {lunaSnapshot.stats.files}</span>
              <strong>完整项目树</strong>
              <small>源码、测试、文档与工程配置</small>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
