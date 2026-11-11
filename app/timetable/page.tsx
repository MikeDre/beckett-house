import { getFeesContent } from "../../lib/site-data";
import { withTimetableHours } from "../../lib/timetable-hours";
import { getBreadcrumbSchema, jsonLd, ORGANISATION_ID, SITE_URL, WEBSITE_ID } from "../../lib/seo";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components";
import { DEFAULT_OPEN_GRAPH } from "../../lib/seo";
import { getPublishedTimetableContent } from "../../lib/timetable-store";
import TimetableView from "./timetable-view";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedTimetableContent();
  return {
    title: content.seoTitle, description: content.seoDescription,
    alternates: { canonical: "/timetable" },
    openGraph: { ...DEFAULT_OPEN_GRAPH, title: content.seoTitle, description: content.seoDescription, url: "/timetable", type: "website", locale: "en_GB" },
    twitter: { card: "summary_large_image", title: content.seoTitle, description: content.seoDescription },
  };
}
export default async function TimetablePage() {
  const [published, fees] = await Promise.all([getPublishedTimetableContent(), getFeesContent()]);
  const content = withTimetableHours(published, fees);
  const url = `${SITE_URL}/timetable`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${url}#webpage`, url, name: content.seoTitle, description: content.seoDescription, inLanguage: "en-GB", isPartOf: { "@id": WEBSITE_ID }, about: { "@id": ORGANISATION_ID } },
      getBreadcrumbSchema([{ name: "Home", url: `${SITE_URL}/` }, { name: "Timetable and term dates", url }]),
    ],
  };

  return <><SiteHeader /><TimetableView content={content} /><SiteFooter /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} /></>;
}
