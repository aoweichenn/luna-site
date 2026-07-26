import type { ReactNode } from "react";
import Link from "next/link";
import { CodeBlock } from "./code-block";

type MarkdownHeading = {
  level: number;
  text: string;
  id: string;
};

function plainText(value: string) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export function slugifyHeading(value: string) {
  return plainText(value)
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getMarkdownHeadings(markdown: string): MarkdownHeading[] {
  const seen = new Map<string, number>();

  return markdown
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .flatMap((line) => {
      const match = line.match(/^(#{2,3})\s+(.+)$/);

      if (!match) {
        return [];
      }

      const text = plainText(match[2]);
      const baseId = slugifyHeading(text);
      const count = seen.get(baseId) ?? 0;
      seen.set(baseId, count + 1);

      return [
        {
          level: match[1].length,
          text,
          id: count === 0 ? baseId : `${baseId}-${count + 1}`,
        },
      ];
    });
}

function resolveDocumentLink(href: string) {
  const clean = href.replace(/^\.\//, "");
  const docsMatch = clean.match(/^(?:docs\/)?(language|architecture|execution-semantics|roadmap)\.md(#[^ ]+)?$/);

  if (docsMatch) {
    return `/docs/${docsMatch[1]}${docsMatch[2] ?? ""}`;
  }

  if (clean === "README.md") {
    return "/docs/readme";
  }

  return href;
}

function renderInline(value: string, keyPrefix: string): ReactNode[] {
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > cursor) {
      nodes.push(value.slice(cursor, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${index}`;

    if (token.startsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={key}>
          {renderInline(token.slice(2, -2), `${key}-strong`)}
        </strong>,
      );
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

      if (link) {
        const href = resolveDocumentLink(link[2]);
        const external = /^https?:\/\//.test(href);
        nodes.push(
          external ? (
            <a href={href} key={key} target="_blank" rel="noreferrer">
              {link[1]}
            </a>
          ) : (
            <Link href={href} key={key}>
              {link[1]}
            </Link>
          ),
        );
      }
    }

    cursor = pattern.lastIndex;
    index += 1;
  }

  if (cursor < value.length) {
    nodes.push(value.slice(cursor));
  }

  return nodes;
}

function isBlockStart(line: string) {
  return (
    /^(#{1,6})\s+/.test(line) ||
    /^```/.test(line) ||
    /^>\s?/.test(line) ||
    /^[-*]\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    /^---+$/.test(line) ||
    /^\|/.test(line)
  );
}

type MarkdownDocumentProps = {
  markdown: string;
  skipFirstHeading?: boolean;
};

export function MarkdownDocument({
  markdown,
  skipFirstHeading = true,
}: MarkdownDocumentProps) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  const headingCounts = new Map<string, number>();
  let skippedFirst = false;
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (line.trim() === "") {
      index += 1;
      continue;
    }

    const fence = line.match(/^```([A-Za-z0-9_-]+)?\s*$/);

    if (fence) {
      const language = fence[1] ?? "text";
      const code: string[] = [];
      index += 1;

      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }

      index += 1;
      blocks.push(
        <CodeBlock
          code={code.join("\n")}
          language={language === "sh" ? "shell" : language}
          ariaLabel={`${language} 代码示例`}
          key={`code-${index}`}
        />,
      );
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);

    if (heading) {
      const level = heading[1].length;
      const value = heading[2];

      if (skipFirstHeading && level === 1 && !skippedFirst) {
        skippedFirst = true;
        index += 1;
        continue;
      }

      const baseId = slugifyHeading(value);
      const count = headingCounts.get(baseId) ?? 0;
      const id = count === 0 ? baseId : `${baseId}-${count + 1}`;
      headingCounts.set(baseId, count + 1);
      const content = renderInline(value, `heading-${index}`);

      if (level === 1) {
        blocks.push(<h1 id={id} key={`heading-${index}`}>{content}</h1>);
      } else if (level === 2) {
        blocks.push(<h2 id={id} key={`heading-${index}`}>{content}</h2>);
      } else if (level === 3) {
        blocks.push(<h3 id={id} key={`heading-${index}`}>{content}</h3>);
      } else {
        blocks.push(<h4 id={id} key={`heading-${index}`}>{content}</h4>);
      }

      index += 1;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={`rule-${index}`} />);
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];

      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push(
        <blockquote key={`quote-${index}`}>
          {renderInline(quote.join(" "), `quote-${index}`)}
        </blockquote>,
      );
      continue;
    }

    const unordered = /^[-*]\s+/.test(line);
    const ordered = /^\d+\.\s+/.test(line);

    if (unordered || ordered) {
      const items: string[] = [];
      const matcher = unordered ? /^[-*]\s+(.+)$/ : /^\d+\.\s+(.+)$/;

      while (index < lines.length) {
        const item = lines[index].match(matcher);

        if (!item) {
          break;
        }

        items.push(item[1]);
        index += 1;

        while (
          index < lines.length &&
          lines[index].trim() !== "" &&
          !matcher.test(lines[index]) &&
          !isBlockStart(lines[index])
        ) {
          items[items.length - 1] += ` ${lines[index].trim()}`;
          index += 1;
        }
      }

      const children = items.map((item, itemIndex) => (
        <li key={`${index}-${itemIndex}`}>
          {renderInline(item, `list-${index}-${itemIndex}`)}
        </li>
      ));

      blocks.push(
        ordered ? (
          <ol key={`list-${index}`}>{children}</ol>
        ) : (
          <ul key={`list-${index}`}>{children}</ul>
        ),
      );
      continue;
    }

    if (
      line.startsWith("|") &&
      index + 1 < lines.length &&
      /^\|?[\s:|-]+\|/.test(lines[index + 1])
    ) {
      const rows: string[][] = [];
      const headers = line
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim());
      index += 2;

      while (index < lines.length && lines[index].startsWith("|")) {
        rows.push(
          lines[index]
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((cell) => cell.trim()),
        );
        index += 1;
      }

      blocks.push(
        <div className="markdown-table-wrap" key={`table-${index}`}>
          <table>
            <thead>
              <tr>
                {headers.map((header, cellIndex) => (
                  <th key={cellIndex}>
                    {renderInline(header, `th-${index}-${cellIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>
                      {renderInline(
                        cell,
                        `td-${index}-${rowIndex}-${cellIndex}`,
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const paragraph: string[] = [line.trim()];
    index += 1;

    while (
      index < lines.length &&
      lines[index].trim() !== "" &&
      !isBlockStart(lines[index])
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }

    blocks.push(
      <p key={`paragraph-${index}`}>
        {renderInline(paragraph.join(" "), `paragraph-${index}`)}
      </p>,
    );
  }

  return <div className="markdown-body">{blocks}</div>;
}
