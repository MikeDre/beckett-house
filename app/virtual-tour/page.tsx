import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components";
import { getBreadcrumbSchema, jsonLd, ORGANISATION_ID, SITE_URL, WEBSITE_ID, DEFAULT_OPEN_GRAPH } from "../../lib/seo";
import VirtualTour from "./tour";

const title = "Virtual Tour";
const description = "Explore Beckett House Montessori in Angel and Abbey Road through interactive 360° nursery panoramas. Look around classrooms and choose the spaces you want to see.";
export const metadata: Metadata = {
  title, description, alternates: { canonical: "/virtual-tour" },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title, description, url: "/virtual-tour", type: "website", locale: "en_GB" },
};

export default function VirtualTourPage() {
  const url = `${SITE_URL}/virtual-tour`;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", "@id": `${url}#webpage`, url, name: title, description, inLanguage: "en-GB", isPartOf: { "@id": WEBSITE_ID }, about: { "@id": ORGANISATION_ID } },
    getBreadcrumbSchema([{ name: "Home", url: `${SITE_URL}/` }, { name: title, url }]),
  ] };
  return <>
    <SiteHeader />
    <main className="virtual-tour-page">
      <header className="virtual-tour-heading"><h1>Virtual Tour</h1><p>A little look inside our world. Choose a nursery and explore at your own pace.</p></header>
      <VirtualTour />
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
  </>;
}
