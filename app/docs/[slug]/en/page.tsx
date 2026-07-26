import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocumentPageView } from "../../../../components/document-page-view";
import {
  documentDescriptors,
  getDocument,
} from "../../../../lib/luna-content";

type EnglishDocumentPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return documentDescriptors.map((document) => ({ slug: document.slug }));
}

export async function generateMetadata({
  params,
}: EnglishDocumentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const document = getDocument(slug);

  return document
    ? {
        title: `${document.descriptor.title}（英文原文）`,
        description: `${document.descriptor.summary} Luna 仓库英文原文。`,
      }
    : {};
}

export default async function EnglishDocumentPage({
  params,
}: EnglishDocumentPageProps) {
  const { slug } = await params;
  const document = getDocument(slug);

  if (!document) {
    notFound();
  }

  return (
    <DocumentPageView
      descriptor={document.descriptor}
      file={document.file}
      markdown={document.file.content}
      language="en"
    />
  );
}

