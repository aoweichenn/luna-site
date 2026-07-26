import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "../../components/icons";
import { PageHero } from "../../components/page-hero";
import { sourceHref } from "../../lib/luna-content";

export const metadata: Metadata = {
  title: "实现路线图",
  description: "Luna M0 至 M4 的当前实现进度、下一阶段工作与测试证据。",
};

const completed = [
  "i64 完整垂直切片",
  "10 种整数全部显式互转",
  "u32 / u64 无符号语义",
  "类型导向的通用整数 IR",
  "全部定宽整数类型",
  "isize / usize 与目标布局",
  "f32 / f64 IEEE-754 路径",
  "显式 x86-64 目标模型",
];

const nextWork = [
  {
    order: "NEXT",
    title: "补齐剩余标量显式转换",
    description:
      "实现 f32 ↔ f64、整数 ↔ 浮点转换，并为舍入、边界与失败行为建立端到端测试。",
  },
  {
    order: "THEN",
    title: "完整运算符与控制流",
    description:
      "完成剩余运算符以及 do、for、switch，扩展语义、IR 和执行覆盖。",
  },
  {
    order: "M1",
    title: "指针、数组与字符串",
    description:
      "引入原始指针、定长数组和字符串字面量，明确地址、生命周期与边界语义。",
  },
  {
    order: "CLOSE",
    title: "外部 C 声明",
    description: "完成 C ABI 边界，让 Luna 可以显式声明和调用外部 C 函数。",
  },
];

const milestones = [
  ["M0", "Direct codegen", "完成", "前端、Typed CFG IR、x86-64 与执行测试的首条闭环。"],
  ["M1", "Scalar language", "进行中", "标量类型、转换、控制流、指针与 C ABI。"],
  ["M2", "Aggregates & modules", "待开始", "结构、联合、枚举、聚合初始化与模块元数据。"],
  ["M3", "Production backend", "待开始", "机器 IR、活跃性、寄存器分配与 ELF64 writer。"],
  ["M4", "Self-hosting", "待开始", "以 Luna 重写编译器并完成多阶段可复现比较。"],
];

const verification = [
  ["83", "单元测试", "utilities、frontend、sema、IR、target 与 backend"],
  ["01", "端到端集成", "真实汇编、静态链接、执行与负例诊断"],
  ["02", "随机门禁", "变异前端与生成程序差分执行"],
  ["5K", "Fuzz 运行", "libFuzzer 配合 UBSan / ASan"],
];

export default function RoadmapPage() {
  return (
    <main id="main">
      <PageHero
        eyebrow="IMPLEMENTATION ROADMAP"
        title={
          <>
            当前在 M1，
            <br />
            标量语言闭环阶段。
          </>
        }
        description="路线图严格区分“设计已接受”和“实现已验证”。勾选项必须拥有可执行测试，网页不会把计划写成完成。"
        aside={
          <div className="progress-ring-card">
            <div><strong>8</strong><span>/ 12</span></div>
            <p>M1 已验证能力</p>
            <small>下一项：剩余标量显式转换</small>
          </div>
        }
      />

      <section className="content-section">
        <div className="shell milestone-list">
          {milestones.map(([id, title, status, description]) => (
            <article className={status === "完成" ? "complete" : status === "进行中" ? "current" : ""} key={id}>
              <span>{id}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
              <small>{status}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section m1-section">
        <div className="shell m1-layout">
          <div className="m1-complete">
            <span className="section-kicker">M1 / COMPLETED</span>
            <h2>已经闭环的标量能力</h2>
            <div>
              {completed.map((item, index) => (
                <p key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <CheckIcon />
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div className="m1-next">
            <span className="section-kicker">M1 / REMAINING</span>
            <h2>接下来按依赖顺序实现</h2>
            <div>
              {nextWork.map((item) => (
                <article key={item.order}>
                  <span>{item.order}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="verification-section" id="verification">
        <div className="shell">
          <div className="section-heading section-heading-light">
            <div>
              <span className="section-kicker">VERIFICATION MATRIX</span>
              <h2>完成状态由证据定义。</h2>
            </div>
            <Link
              className="inline-link inline-link-light"
              href={sourceHref("tests/integration/run_integration.py")}
            >
              浏览测试源码
              <ArrowRightIcon />
            </Link>
          </div>
          <div className="verification-grid">
            {verification.map(([count, title, detail]) => (
              <article key={title}>
                <strong>{count}</strong>
                <h3>{title}</h3>
                <p>{detail}</p>
              </article>
            ))}
          </div>
          <div className="verification-command">
            <code>cmake --preset debug &amp;&amp; cmake --build --preset debug &amp;&amp; ctest --preset debug</code>
            <span>86 / 86 tests</span>
          </div>
        </div>
      </section>
    </main>
  );
}
