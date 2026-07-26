import {
  describeLunaFile,
  formatBytes,
  lunaFiles,
  lunaSnapshot,
  sourceHref,
  type LunaFile,
} from "../lib/luna-content";
import { CodeBlock } from "./code-block";
import { CopyButton } from "./copy-button";
import { ArrowUpRightIcon, GitBranchIcon } from "./icons";
import { SourceNavigator } from "./source-navigator";

type SourceBrowserProps = {
  file: LunaFile;
};

export function SourceBrowser({ file }: SourceBrowserProps) {
  const navigationFiles = lunaFiles.map((item) => ({
    path: item.path,
    group: item.group,
    language: item.language,
    lines: item.lines,
    href: sourceHref(item.path),
  }));
  const githubUrl = `${lunaSnapshot.repository}/blob/${lunaSnapshot.commit}/${file.path}`;

  return (
    <div className="source-browser">
      <SourceNavigator files={navigationFiles} activePath={file.path} />
      <article className="source-file">
        <header className="source-file-header">
          <div className="source-file-path">
            <span className="source-language">{file.language}</span>
            <div>
              <p>{file.path}</p>
              <span>
                {file.lines.toLocaleString("zh-CN")} 行 · {formatBytes(file.bytes)} ·
                SHA-256 {file.sha256.slice(0, 10)}
              </span>
            </div>
          </div>
          <div className="source-file-actions">
            <CopyButton value={file.content} label="复制全文" />
            <a href={githubUrl} target="_blank" rel="noreferrer">
              <GitBranchIcon />
              GitHub
              <ArrowUpRightIcon />
            </a>
          </div>
        </header>
        <div className="source-file-context">
          <span>{file.group}</span>
          <p>{describeLunaFile(file)}</p>
        </div>
        <CodeBlock
          code={file.content}
          language={file.language}
          anchorLines
          ariaLabel={`${file.path} 完整源码`}
        />
      </article>
    </div>
  );
}
