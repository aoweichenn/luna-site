import Link from "next/link";
import { ArrowUpRightIcon } from "./icons";

const navigation = [
  { href: "/", label: "首页" },
  { href: "/learn", label: "学习路径" },
  { href: "/compiler", label: "编译器" },
  { href: "/docs", label: "文档" },
  { href: "/source", label: "源码" },
  { href: "/standards", label: "C 规范" },
  { href: "/roadmap", label: "路线图" },
];

function Brand() {
  return (
    <Link className="site-brand" href="/" aria-label="Luna Compiler Lab 首页">
      <span className="site-brand-mark" aria-hidden="true">
        <span />
      </span>
      <span>
        <strong>LUNA</strong>
        <small>COMPILER LAB</small>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-shell">
        <Brand />
        <nav className="desktop-navigation" aria-label="主要导航">
          {navigation.slice(1).map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          className="header-github"
          href="https://github.com/aoweichenn/luna"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
          <ArrowUpRightIcon />
        </a>
        <details className="mobile-navigation">
          <summary>目录</summary>
          <nav aria-label="移动端导航">
            {navigation.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <a
              href="https://github.com/aoweichenn/luna"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
              <ArrowUpRightIcon />
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Brand />
          <p>把语言规范、编译器实现和可执行证据放在同一个学习坐标系里。</p>
        </div>
        <div className="footer-links">
          <span>学习</span>
          <Link href="/learn">学习路径</Link>
          <Link href="/compiler">编译器流水线</Link>
          <Link href="/standards">C23 工程规范</Link>
        </div>
        <div className="footer-links">
          <span>参考</span>
          <Link href="/docs">完整文档</Link>
          <Link href="/source">完整源码</Link>
          <Link href="/roadmap">实现路线图</Link>
        </div>
        <div className="footer-meta">
          <span>BOOTSTRAP TARGET</span>
          <strong>x86_64-unknown-linux-gnu</strong>
          <small>C23 · Typed CFG IR · System V · ELF64</small>
        </div>
      </div>
    </footer>
  );
}

