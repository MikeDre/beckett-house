import { locations } from "./content";

export type HomePageContent = {
  seoTitle: string;
  seoDescription: string;
  heading: string;
  introduction: string;
  nurseryLabels: Record<"angel" | "abbey-road", string>;
  nurseryCards: Record<"angel" | "abbey-road", { imageSrc: string; imageAlt: string; summary: string; buttonLabel: string }>;
};
export type HomePageRecord = {
  slug: "home"; title: "Homepage"; path: "/";
  draft: HomePageContent | null; published: HomePageContent;
  draftUpdatedAt: string | null; publishedAt: string | null; version: number;
};
export const defaultHomepageContent: HomePageContent = {
  seoTitle: "Montessori Nursery in Angel & Abbey Road | Beckett House",
  seoDescription: "Choose your Beckett House Montessori nursery. Find Angel in Islington or Abbey Road in St John's Wood on our interactive location map.",
  heading: "Beckett House Montessori nurseries in Angel and Abbey Road",
  introduction: "Beckett House is a family-run Montessori nursery with warm, welcoming spaces in Angel and Abbey Road, where children can learn, explore and grow in confidence.",
  nurseryLabels: { angel: "Angel", "abbey-road": "Abbey Road" },
  nurseryCards: Object.fromEntries(locations.map(location => [location.slug, { imageSrc: location.image, imageAlt: location.imageAlt, summary: location.strapline, buttonLabel: `Choose ${location.name}` }])) as HomePageContent["nurseryCards"],
};
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected homepage content objects.");
  return value as Record<string, unknown>;
}
function text(value: unknown, field: string, max: number): string {
  if (typeof value !== "string" || !value.trim() || value.length > max || /[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) throw new Error(`${field} must be plain text between 1 and ${max} characters.`);
  return value.trim();
}
export function validateHomepageContent(value: unknown): HomePageContent {
  const v = object(value), labels = object(v.nurseryLabels), cards = object(v.nurseryCards);
  function card(slug: "angel" | "abbey-road") {
    const c = object(cards[slug]), imageSrc = text(c.imageSrc, `${slug} image`, 500);
    if (!/^\/images\/(?:[\w-]+\/)*[\w-]+\.(webp|jpe?g|png|avif)$/i.test(imageSrc)) throw new Error("Choose a local image path under /images/ with no traversal, query or fragment.");
    return { imageSrc, imageAlt: text(c.imageAlt, `${slug} image description`, 500), summary: text(c.summary, `${slug} summary`, 2000), buttonLabel: text(c.buttonLabel, `${slug} button label`, 100) };
  }
  return { seoTitle: text(v.seoTitle, "SEO title", 200), seoDescription: text(v.seoDescription, "SEO description", 500), heading: text(v.heading, "Heading", 300), introduction: text(v.introduction, "Introduction", 4000), nurseryLabels: { angel: text(labels.angel, "Angel label", 100), "abbey-road": text(labels["abbey-road"], "Abbey Road label", 100) }, nurseryCards: { angel: card("angel"), "abbey-road": card("abbey-road") } };
}
