import {getSanityContent as readSeoContent} from "../../lib/sanity/server";

import {CmsText} from "../cms-content";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components";
import { getBreadcrumbSchema, jsonLd, ORGANISATION_ID, SITE_URL, WEBSITE_ID, DEFAULT_OPEN_GRAPH } from "../../lib/seo";
import Gallery from "./gallery";

const title = "Gallery";
const description = "Browse photos of the classrooms and nursery spaces at Beckett House Montessori in Angel and Abbey Road.";

const defaultMetadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/gallery" },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title, description, url: "/gallery", type: "website", locale: "en_GB" },
};

export default function GalleryPage() {
  const url = `${SITE_URL}/gallery`;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "ImageGallery", "@id": `${url}#webpage`, url, name: title, description, inLanguage: "en-GB", isPartOf: { "@id": WEBSITE_ID }, about: { "@id": ORGANISATION_ID } },
    getBreadcrumbSchema([{ name: "Home", url: `${SITE_URL}/` }, { name: title, url }]),
  ] };

  return <>
    <SiteHeader />
    <main className="gallery-page">
      <header className="gallery-heading">
        <h1><CmsText page="gallery" field="copy.gallery" fallback={"Gallery"} /></h1>
        <p><CmsText page="gallery" field="copy.aLookInsideOurNurseriesInAngel" fallback={"A look inside our nurseries in Angel and Abbey Road. For an interactive look around, visit the "} /><Link href="/virtual-tour"><CmsText page="gallery" field="copy.text360VirtualTour" fallback={"360° virtual tour"} /></Link><CmsText page="gallery" field="copy.text" fallback={"."} /></p>
      </header>
      <Gallery />
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
  </>;
}

export async function generateMetadata():Promise<Metadata> {
 const content=await readSeoContent<{seoTitle?:string;seoDescription?:string}>("gallery");
 const title=content?.seoTitle || defaultMetadata.title;
 const description=content?.seoDescription || defaultMetadata.description;
 return {...defaultMetadata,title,description,openGraph:{...defaultMetadata.openGraph,title:title as string,description:description || undefined},twitter:{...defaultMetadata.twitter,title:title as string,description:description || undefined}};
}
