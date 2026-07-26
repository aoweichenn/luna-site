import Link from "next/link";
import { ArrowRightIcon } from "../components/icons";

export default function NotFound() {
  return (
    <main className="not-found" id="main">
      <div>
        <span>404 / NOT FOUND</span>
        <h1>这条路径不在当前快照里。</h1>
        <p>文件可能不存在，或者文档地址已经变化。请回到站点索引重新选择。</p>
        <div>
          <Link className="button button-primary" href="/">
            返回首页
            <ArrowRightIcon />
          </Link>
          <Link className="button button-ghost" href="/source">
            打开源码浏览器
          </Link>
        </div>
      </div>
    </main>
  );
}

