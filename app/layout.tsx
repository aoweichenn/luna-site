import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luna Compiler Lab — 从源码到 x86-64",
  description:
    "Luna 系统语言与 C23 自举编译器的交互式学习站点：语言设计、编译流水线、工程规范、验证体系与实施路线。",
  metadataBase: new URL("https://luna-compiler-lab.aoweichenn.chatgpt.site"),
  openGraph: {
    title: "Luna Compiler Lab",
    description: "读懂一门语言，亲手走完一条编译链。",
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
  themeColor: "#090b0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
