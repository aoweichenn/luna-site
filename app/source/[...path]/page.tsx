import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLunaFile } from "../../../lib/luna-content";
import { SourcePageContent } from "../source-page";

type SourceFilePageProps = {
  params: Promise<{ path: string[] }>;
};

export async function generateMetadata({
  params,
}: SourceFilePageProps): Promise<Metadata> {
  const { path } = await params;
  const file = getLunaFile(path.join("/"));

  return file
    ? {
        title: file.path,
        description: `完整阅读 Luna 源码文件 ${file.path}，共 ${file.lines} 行。`,
      }
    : {};
}

export default async function SourceFilePage({ params }: SourceFilePageProps) {
  const { path } = await params;
  const file = getLunaFile(path.join("/"));

  if (!file) {
    notFound();
  }

  return <SourcePageContent file={file} />;
}

