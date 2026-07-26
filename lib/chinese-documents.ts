import documentsData from "../content/docs-zh.json";

const documents = documentsData as Record<string, string>;

export function getChineseDocument(slug: string) {
  return documents[slug];
}

