import type { Metadata } from "next";
import { NurseryChooser } from "./components";
import { locations } from "../lib/content";
import { getLocationSchema, getOrganizationSchema, getWebsiteSchema, jsonLd, SITE_URL, DEFAULT_OPEN_GRAPH } from "../lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Beckett House Montessori | Montessori Nursery in Angel & Abbey Road" },
  description: "Choose your Beckett House Montessori nursery. Find Angel in Islington or Abbey Road in St John's Wood on our interactive location map.",
  alternates: { canonical: "/" }, openGraph: { ...DEFAULT_OPEN_GRAPH, url: "/" },
};
export default function Home() {
  const schema = { "@context": "https://schema.org", "@graph": [
    getOrganizationSchema(locations), getWebsiteSchema(), ...locations.map(getLocationSchema),
    { "@type": "CollectionPage", "@id": `${SITE_URL}/#webpage`, url: `${SITE_URL}/`, name: "Choose your Beckett House Montessori nursery", inLanguage: "en-GB", isPartOf: { "@id": `${SITE_URL}/#website` } },
  ] };
  return <>
    <main className="nursery-chooser-page homepage-map"><NurseryChooser locations={locations} homepage /></main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
  </>;
}
