import {getSanityContent as readSeoContent} from "../../lib/sanity/server";

import {CmsText} from "../cms-content";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components";
import { getBreadcrumbSchema, jsonLd, ORGANISATION_ID, SITE_URL, WEBSITE_ID, DEFAULT_OPEN_GRAPH } from "../../lib/seo";
import VirtualTour from "./tour";

const title = "Virtual Tour";
const description = "Explore Beckett House Montessori in Angel and Abbey Road through interactive 360° panoramas. Look around the classrooms before you visit.";
const defaultMetadata: Metadata = {
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
      <header className="virtual-tour-heading"><h1><CmsText page="virtual-tour" field="copy.virtualTour" fallback={"Virtual Tour"} /></h1><p><CmsText page="virtual-tour" field="copy.aLittleLookInsideOurWorldChoose" fallback={"A little look inside our world. Choose a nursery and explore at your own pace."} /></p></header>
      <VirtualTour />
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
  </>;
}

export async function generateMetadata():Promise<Metadata> {
 const content=await readSeoContent<{seoTitle?:string;seoDescription?:string}>("virtual-tour");
 const title=content?.seoTitle || defaultMetadata.title;
 const description=content?.seoDescription || defaultMetadata.description;
 return {...defaultMetadata,title,description,openGraph:{...defaultMetadata.openGraph,title:title as string,description:description || undefined},twitter:{...defaultMetadata.twitter,title:title as string,description:description || undefined}};
}
