import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLunaFile } from "../../lib/luna-content";
import { SourcePageContent } from "./source-page";

export const metadata: Metadata = {
  title: "完整源码",
  description: "搜索并阅读 Luna 当前提交的全部 165 个源码、文档、测试与工程文件。",
};

export default function SourceIndexPage() {
  const file = getLunaFile("src/frontend/compiler/main.c");

  if (!file) {
    notFound();
  }

  return <SourcePageContent file={file} />;
}

