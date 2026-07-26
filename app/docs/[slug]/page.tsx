import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocumentPageView } from "../../../components/document-page-view";
import { getChineseDocument } from "../../../lib/chinese-documents";
import {
  documentDescriptors,
  getDocument,
} from "../../../lib/luna-content";

type DocumentPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return documentDescriptors.map((document) => ({ slug: document.slug }));
}

export async function generateMetadata({
  params,
}: DocumentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const document = getDocument(slug);

  if (!document) {
    return {};
  }

  return {
    title: document.descriptor.title,
    description: document.descriptor.summary,
  };
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { slug } = await params;
  const document = getDocument(slug);

  if (!document) {
    notFound();
  }

  const markdown = getChineseDocument(slug);

  if (!markdown) {
    notFound();
  }

  return (
    <DocumentPageView
      descriptor={document.descriptor}
      file={document.file}
      markdown={markdown}
      language="zh"
    />
  );
}

