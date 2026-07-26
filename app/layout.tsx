import type { Metadata, Viewport } from "next";
import { SiteFooter, SiteHeader } from "../components/site-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Luna Compiler Lab — 从源码到 x86-64",
    template: "%s · Luna Compiler Lab",
  },
  description:
    "Luna 系统语言与 C23 自举编译器的多页面学习站：完整语言文档、编译流水线、C 工程规范、实现路线与全量源码浏览。",
  metadataBase: new URL("https://luna-compiler-lab.aoweichenn.chatgpt.site"),
  openGraph: {
    title: "Luna Compiler Lab",
    description: "读完整文档，看完整源码，亲手走完一条编译链。",
    type: "website",
    locale: "zh_CN",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/luna-mark.svg",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#07100f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <a className="skip-link" href="#main">
          跳到主要内容
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
