"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SearchIcon } from "./icons";

type SourceNavigationFile = {
  path: string;
  group: string;
  language: string;
  lines: number;
  href: string;
};

type SourceNavigatorProps = {
  files: SourceNavigationFile[];
  activePath: string;
};

const groupOrder = [
  "编译器实现",
  "公共头文件",
  "设计文档",
  "示例程序",
  "测试与验证",
  "工程配置",
  "持续集成",
];

export function SourceNavigator({
  files,
  activePath,
}: SourceNavigatorProps) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filtered = normalizedQuery
      ? files.filter((file) =>
          `${file.path} ${file.group} ${file.language}`
            .toLocaleLowerCase()
            .includes(normalizedQuery),
        )
      : files;
    const grouped = new Map<string, SourceNavigationFile[]>();

    for (const file of filtered) {
      const group = grouped.get(file.group) ?? [];
      group.push(file);
      grouped.set(file.group, group);
    }

    return groupOrder
      .filter((group) => grouped.has(group))
      .map((group) => ({
        label: group,
        files: grouped.get(group) ?? [],
      }));
  }, [files, query]);

  return (
    <aside className="source-navigator">
      <div className="source-navigator-heading">
        <span>完整项目树</span>
        <strong>{files.length} 个文件</strong>
      </div>
      <label className="source-search">
        <SearchIcon />
        <span className="sr-only">搜索文件</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索路径或类型…"
        />
        {query ? <kbd>{groups.reduce((sum, group) => sum + group.files.length, 0)}</kbd> : null}
      </label>
      <nav className="source-tree" aria-label="Luna 源码文件">
        {groups.length === 0 ? (
          <p className="source-empty">没有匹配的文件。</p>
        ) : (
          groups.map((group) => (
            <details open key={group.label}>
              <summary>
                <span>{group.label}</span>
                <small>{group.files.length}</small>
              </summary>
              <div>
                {group.files.map((file) => (
                  <Link
                    className={file.path === activePath ? "active" : ""}
                    href={file.href}
                    key={file.path}
                    title={file.path}
                  >
                    <span>{file.path.split("/").at(-1)}</span>
                    <small>{file.lines}</small>
                  </Link>
                ))}
              </div>
            </details>
          ))
        )}
      </nav>
    </aside>
  );
}
