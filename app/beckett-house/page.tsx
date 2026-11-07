import { getBreadcrumbSchema, jsonLd, ORGANISATION_ID, SITE_URL, WEBSITE_ID } from "../../lib/seo";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components";
import { DEFAULT_OPEN_GRAPH } from "../../lib/seo";
import { getPublishedAboutContent } from "../../lib/about-store";
import AboutView from "./about-view";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedAboutContent();
  return {
    title: content.seoTitle, description: content.seoDescription,
    alternates: { canonical: "/beckett-house" },
    openGraph: { ...DEFAULT_OPEN_GRAPH, title: content.seoTitle, description: content.seoDescription, url: "/beckett-house", type: "website", locale: "en_GB" },
    twitter: { card: "summary_large_image", title: content.seoTitle, description: content.seoDescription },
  };
}
export default async function AboutPage() {
  const content = await getPublishedAboutContent();
  const url = `${SITE_URL}/beckett-house`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "AboutPage", "@id": `${url}#webpage`, url, name: content.seoTitle, description: content.seoDescription, inLanguage: "en-GB", isPartOf: { "@id": WEBSITE_ID }, about: { "@id": ORGANISATION_ID } },
      getBreadcrumbSchema([{ name: "Home", url: `${SITE_URL}/` }, { name: "About us", url }]),
    ],
  };

  return <><SiteHeader /><AboutView content={content} /><SiteFooter /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} /></>;
}
