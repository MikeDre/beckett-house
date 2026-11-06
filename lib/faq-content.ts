import { faqGroups } from "../app/faq/faq-content";

export type FaqQuestion = { id: string; question: string; answer: string };
export type FaqTopic = { id: string; heading: string; items: FaqQuestion[] };
export type FaqContent = { seoTitle: string; seoDescription: string; heading: string; introduction: string; groups: FaqTopic[] };
export type FaqRecord = {
  slug: "faq"; title: "Frequently asked questions"; path: "/faq";
  draft: FaqContent | null; published: FaqContent;
  draftUpdatedAt: string | null; publishedAt: string | null; version: number;
};
export const defaultFaqContent: FaqContent = {
  seoTitle: "Frequently Asked Questions",
  seoDescription: "Answers about places, sessions, fees, funding and nursery life at Beckett House Montessori in Angel and Abbey Road.",
  heading: "Frequently Asked Questions",
  introduction: "Practical answers for families considering Beckett House Montessori in Angel or Abbey Road.",
  groups: faqGroups.map(group => ({ id: group.id, heading: group.heading, items: group.items.map((item, index) => ({ id: `${group.id}-q-${index + 1}`, question: item.question, answer: item.answer })) })),
};
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected FAQ content objects.");
  return value as Record<string, unknown>;
}
function text(value: unknown, label: string, max: number) {
  if (typeof value !== "string" || !value.trim() || value.length > max || /[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) throw new Error(`${label} must be plain text between 1 and ${max} characters.`);
  return value.trim();
}
export function validateFaqContent(value: unknown): FaqContent {
  const v = object(value), ids = new Set<string>(), questionIds = new Set<string>();
  if (!Array.isArray(v.groups) || v.groups.length < 1 || v.groups.length > 20) throw new Error("Use between 1 and 20 FAQ topics.");
  let count = 0;
  const groups = v.groups.map(raw => {
    const group = object(raw), id = text(group.id, "Topic identifier", 80);
    if (!/^[a-z][a-z0-9-]*$/.test(id) || id.startsWith("faq-page-") || ids.has(id) || ids.has(`${id}-heading`)) throw new Error("FAQ topics need unique valid identifiers.");
    ids.add(id); ids.add(`${id}-heading`);
    if (!Array.isArray(group.items) || !group.items.length || group.items.length > 30) throw new Error("Each topic needs between 1 and 30 questions.");
    count += group.items.length;
    if (count > 200) throw new Error("Use at most 200 FAQ questions.");
    return { id, heading: text(group.heading, "Topic heading", 200), items: group.items.map(rawItem => {
      const item = object(rawItem), itemId = text(item.id, "Question identifier", 120);
      if (!/^[a-z][a-z0-9-]*$/.test(itemId) || questionIds.has(itemId)) throw new Error("FAQ questions need unique valid identifiers.");
      questionIds.add(itemId);
      return { id: itemId, question: text(item.question, "Question", 500), answer: text(item.answer, "Answer", 4000) };
    }) };
  });
  return { seoTitle: text(v.seoTitle, "Search title", 200), seoDescription: text(v.seoDescription, "Search description", 500), heading: text(v.heading, "Page heading", 300), introduction: text(v.introduction, "Introduction", 4000), groups };
}
