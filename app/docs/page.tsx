import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, BookIcon } from "../../components/icons";
import { PageHero } from "../../components/page-hero";
import {
  documentDescriptors,
  lunaSnapshot,
} from "../../lib/luna-content";

export const metadata: Metadata = {
  title: "完整文档",
  description: "在站内阅读 Luna 项目总览、语言草案、编译器架构、执行语义与实现路线图。",
};

export default function DocsPage() {
  return (
    <main id="main">
      <PageHero
        eyebrow="DOCUMENTATION"
        title={
          <>
            原始文档，
            <br />
            重新排版后完整呈现。
          </>
        }
        description="五篇核心文档均提供完整中文译文并默认显示，同时保留逐篇英文原文；规则、边界与代码示例不会删减。"
        aside={
          <div className="hero-note">
            <span>CONTENT SNAPSHOT</span>
            <strong>{lunaSnapshot.commit.slice(0, 12)}</strong>
            <small>{documentDescriptors.length} 篇中文全文 · 英文原文可切换</small>
          </div>
        }
      />

      <section className="content-section">
        <div className="shell docs-grid">
          {documentDescriptors.map((document, index) => (
            <Link
              className={`doc-card ${index === 1 ? "doc-card-featured" : ""}`}
              href={`/docs/${document.slug}`}
              key={document.slug}
            >
              <div className="doc-card-top">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <BookIcon />
              </div>
              <small>{document.eyebrow}</small>
              <h2>{document.title}</h2>
              <p>{document.summary}</p>
              <div>
                <span>中文 · 约 {document.readingMinutes} 分钟</span>
                <span>
                  阅读全文
                  <ArrowRightIcon />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="docs-principle">
        <div className="shell docs-principle-layout">
          <span>DOCUMENTATION PRINCIPLE</span>
          <blockquote>
            “已接受”不等于“已实现”。只有拥有可执行测试的能力，才能在路线图中被标记为完成。
          </blockquote>
          <Link href="/roadmap">
            查看状态与证据
            <ArrowRightIcon />
          </Link>
        </div>
      </section>
    </main>
  );
}
