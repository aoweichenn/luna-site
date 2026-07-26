import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "../../components/code-block";
import { ArrowRightIcon, CheckIcon } from "../../components/icons";
import { PageHero } from "../../components/page-hero";
import { getLunaFile, sourceHref } from "../../lib/luna-content";

export const metadata: Metadata = {
  title: "C23 工程规范",
  description: "Luna 自举编译器使用的 C23 编程、格式、告警、所有权和错误处理规范。",
};

const rules = [
  {
    marker: "C23",
    title: "语言边界明确",
    description:
      "自举编译器使用标准 C23 并关闭编译器扩展。Luna 直接降低到自有 IR，不借宿主语言重新解释语义。",
  },
  {
    marker: "80",
    title: "格式可机械执行",
    description:
      "4 空格缩进、80 列、右侧指针对齐、同一行左花括号。规则写进 .clang-format，不依赖口头习惯。",
  },
  {
    marker: "W!",
    title: "告警就是失败",
    description:
      "-Wall、-Wextra、-Wpedantic、-Wconversion、-Wshadow 等配合 -Werror，尽早暴露宿主 C 风险。",
  },
  {
    marker: "OWN",
    title: "所有权能从 API 看见",
    description:
      "Source 持有字节，arena 统一持有 AST，Buffer 明确管理可增长内存；调用者不猜测释放责任。",
  },
  {
    marker: "ERR",
    title: "用户错误不是内部失败",
    description:
      "病态输入必须转化为稳定诊断。断言与 verifier 负责内部不变量，I/O 和分配失败显式传播。",
  },
  {
    marker: "DET",
    title: "输出保持确定",
    description:
      "标签、符号、诊断、随机种子与文本 IR 可复现，让失败能够比较、审阅和最小化。",
  },
];

const reviewChecklist = [
  "新增 API 是否写清所有权、生命周期与失败结果？",
  "整数宽度来自目标模型，还是误用了宿主 sizeof？",
  "用户输入能否触发 assert、越界、未初始化或无限循环？",
  "新增 IR 是否由 verifier 独立检查操作数、结果与控制流？",
  "新增行为是否同时拥有成功、失败、边界与执行测试？",
  "格式、告警、UBSan 与随机门禁是否仍然通过？",
];

export default function StandardsPage() {
  const clangFormat = getLunaFile(".clang-format");
  const cmake = getLunaFile("CMakeLists.txt");
  const warningLines =
    cmake?.content
      .split("\n")
      .slice(48, 64)
      .join("\n") ?? "";

  return (
    <main id="main">
      <PageHero
        eyebrow="C23 ENGINEERING"
        title={
          <>
            规范不是审美，
            <br />
            是正确性的第一层。
          </>
        }
        description="Luna 的 C 规范围绕一个目标组织：让宿主实现的边界明确、失败可见、行为可复现，并能被工具机械检查。"
        aside={
          <div className="standard-seal">
            <span>HOST STANDARD</span>
            <strong>ISO C23</strong>
            <small>extensions off · warnings fatal</small>
          </div>
        }
      />

      <section className="content-section">
        <div className="shell standards-grid">
          {rules.map((rule) => (
            <article className="standard-card" key={rule.marker}>
              <span>{rule.marker}</span>
              <div>
                <h2>{rule.title}</h2>
                <p>{rule.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section standards-code-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="section-kicker">RULES AS CODE</span>
              <h2>直接阅读工程里的真实配置。</h2>
            </div>
            <p>网页解释规则，配置文件负责执行规则。两者必须始终一致。</p>
          </div>
          <div className="standards-code-grid">
            <article className="config-panel">
              <header>
                <div><span>FORMAT</span><strong>.clang-format</strong></div>
                <Link href={sourceHref(".clang-format")}>查看完整文件 <ArrowRightIcon /></Link>
              </header>
              <CodeBlock code={clangFormat?.content ?? ""} language="config" />
            </article>
            <article className="config-panel">
              <header>
                <div><span>COMPILER GATE</span><strong>CMakeLists.txt</strong></div>
                <Link href={sourceHref("CMakeLists.txt")}>查看完整文件 <ArrowRightIcon /></Link>
              </header>
              <CodeBlock code={warningLines} language="cmake" />
            </article>
          </div>
        </div>
      </section>

      <section className="review-section">
        <div className="shell review-layout">
          <div>
            <span className="section-kicker">REVIEW CHECKLIST</span>
            <h2>提交 C 代码前，逐项回答。</h2>
            <p>这份清单把风格问题和语义风险放在一次评审里。</p>
          </div>
          <ol>
            {reviewChecklist.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <CheckIcon />
                <p>{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
