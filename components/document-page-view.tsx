import Link from "next/link";
import {
  getMarkdownHeadings,
  MarkdownDocument,
} from "./markdown-document";
import { ArrowRightIcon, ArrowUpRightIcon } from "./icons";
import { PageHero } from "./page-hero";
import {
  documentDescriptors,
  lunaSnapshot,
  sourceHref,
  type DocumentDescriptor,
  type LunaFile,
} from "../lib/luna-content";

type DocumentPageViewProps = {
  descriptor: DocumentDescriptor;
  file: LunaFile;
  markdown: string;
  language: "zh" | "en";
};

export function DocumentPageView({
  descriptor,
  file,
  markdown,
  language,
}: DocumentPageViewProps) {
  const headings = getMarkdownHeadings(markdown);
  const documentIndex = documentDescriptors.findIndex(
    (item) => item.slug === descriptor.slug,
  );
  const previous = documentDescriptors[documentIndex - 1];
  const next = documentDescriptors[documentIndex + 1];
  const githubUrl = `${lunaSnapshot.repository}/blob/${lunaSnapshot.commit}/${file.path}`;
  const pageHref = (slug: string) =>
    language === "zh" ? `/docs/${slug}` : `/docs/${slug}/en`;

  return (
    <main id="main">
      <PageHero
        eyebrow={`DOC / ${descriptor.eyebrow}`}
        title={descriptor.title}
        description={
          language === "zh"
            ? `${descriptor.summary} 当前显示完整中文译文。`
            : `${descriptor.summary} 当前显示仓库英文原文。`
        }
        aside={
          <div className="document-meta-card">
            <div><span>PATH</span><strong>{file.path}</strong></div>
            <div><span>VERSION</span><strong>{language === "zh" ? "中文译文" : "English original"}</strong></div>
            <div><span>LENGTH</span><strong>{file.lines} source lines</strong></div>
          </div>
        }
      />

      <section className="content-section">
        <div className="shell document-layout">
          <aside className="document-toc">
            <div className="language-switch" aria-label="文档语言">
              <Link
                className={language === "zh" ? "active" : ""}
                href={`/docs/${descriptor.slug}`}
              >
                中文
              </Link>
              <Link
                className={language === "en" ? "active" : ""}
                href={`/docs/${descriptor.slug}/en`}
              >
                EN
              </Link>
            </div>
            <span>{language === "zh" ? "本页目录" : "ON THIS PAGE"}</span>
            <nav aria-label="文档章节">
              {headings.map((heading) => (
                <a
                  className={heading.level === 3 ? "nested" : ""}
                  href={`#${heading.id}`}
                  key={heading.id}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
            <div className="toc-source">
              <span>权威原始文件</span>
              <a href={githubUrl} target="_blank" rel="noreferrer">
                GitHub
                <ArrowUpRightIcon />
              </a>
              <Link href={sourceHref(file.path)}>
                源码视图
                <ArrowRightIcon />
              </Link>
            </div>
          </aside>

          <article className="document-reader">
            <div className={`translation-note translation-note-${language}`}>
              <span>{language === "zh" ? "中文完整译文" : "ENGLISH ORIGINAL"}</span>
              <p>
                {language === "zh"
                  ? "译文与当前 Luna 提交绑定；代码、类型名、ABI 名称和关键术语保持原样。英文原文仍是权威来源。"
                  : "This is the unmodified document from the Luna source snapshot. Switch to 中文 for the complete Chinese translation."}
              </p>
            </div>
            <MarkdownDocument markdown={markdown} />
            <footer className="document-pagination">
              {previous ? (
                <Link href={pageHref(previous.slug)}>
                  <span>上一篇</span>
                  <strong>{previous.title}</strong>
                </Link>
              ) : <span />}
              {next ? (
                <Link href={pageHref(next.slug)}>
                  <span>下一篇</span>
                  <strong>{next.title}</strong>
                </Link>
              ) : null}
            </footer>
          </article>
        </div>
      </section>
    </main>
  );
}

