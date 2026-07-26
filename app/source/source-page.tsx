import { PageHero } from "../../components/page-hero";
import { SourceBrowser } from "../../components/source-browser";
import {
  formatBytes,
  lunaSnapshot,
  type LunaFile,
} from "../../lib/luna-content";

type SourcePageContentProps = {
  file: LunaFile;
};

export function SourcePageContent({ file }: SourcePageContentProps) {
  return (
    <main id="main">
      <PageHero
        eyebrow="SOURCE EXPLORER"
        title={
          <>
            不是片段，
            <br />
            是完整项目源码。
          </>
        }
        description="当前提交的全部受 Git 管理文件都在这里：实现、头文件、测试、Luna 用例、IR 快照、文档、构建配置与 CI。"
        aside={
          <dl className="source-stats">
            <div>
              <dt>{lunaSnapshot.stats.mainSource.files}</dt>
              <dd>主干文件</dd>
            </div>
            <div>
              <dt>
                {lunaSnapshot.stats.mainSource.lines.toLocaleString("zh-CN")}
              </dt>
              <dd>主干行数</dd>
            </div>
            <div>
              <dt>{formatBytes(lunaSnapshot.stats.mainSource.bytes)}</dt>
              <dd>主干文本</dd>
            </div>
          </dl>
        }
      />
      <section className="source-section">
        <div className="shell shell-wide">
          <SourceBrowser file={file} />
        </div>
      </section>
    </main>
  );
}
