import { getPublishedHomepageContent } from "../lib/homepage-store";
import type { Metadata } from "next";
import { NurseryChooser } from "./components";
import { locations } from "../lib/content";
import { getLocationSchema, getOrganizationSchema, getWebsiteSchema, jsonLd, SITE_URL, DEFAULT_OPEN_GRAPH } from "../lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedHomepageContent();
  return {
    title: { absolute: content.seoTitle }, description: content.seoDescription,
    alternates: { canonical: "/" },
    openGraph: { ...DEFAULT_OPEN_GRAPH, url: "/", title: content.seoTitle, description: content.seoDescription },
  };
}
export default async function Home() {
  const content = await getPublishedHomepageContent();
  const schema = { "@context": "https://schema.org", "@graph": [
    getOrganizationSchema(locations), getWebsiteSchema(), ...locations.map(getLocationSchema),
    { "@type": "CollectionPage", "@id": `${SITE_URL}/#webpage`, url: `${SITE_URL}/`, name: "Choose your Beckett House Montessori nursery", inLanguage: "en-GB", isPartOf: { "@id": `${SITE_URL}/#website` } },
  ] };
  return <>
    <main className="nursery-chooser-page homepage-map"><NurseryChooser locations={locations} homepage content={content} /></main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
  </>;
}
