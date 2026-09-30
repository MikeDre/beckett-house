import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components";
import { getBreadcrumbSchema, jsonLd, ORGANISATION_ID, SITE_URL, WEBSITE_ID } from "../../lib/seo";
import Gallery from "./gallery";

const title = "Gallery";
const description = "Browse photos of the classrooms and nursery spaces at Beckett House Montessori in Angel and Abbey Road.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/gallery" },
  openGraph: { title, description, url: "/gallery", type: "website", locale: "en_GB" },
};

export default function GalleryPage() {
  const url = `${SITE_URL}/gallery`;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", "@id": `${url}#webpage`, url, name: title, description, inLanguage: "en-GB", isPartOf: { "@id": WEBSITE_ID }, about: { "@id": ORGANISATION_ID } },
    getBreadcrumbSchema([{ name: "Home", url: `${SITE_URL}/` }, { name: title, url }]),
  ] };

  return <>
    <SiteHeader />
    <main className="gallery-page">
      <header className="gallery-heading">
        <h1>Gallery</h1>
        <p>A look inside our nurseries in Angel and Abbey Road. For an interactive look around, visit the <Link href="/virtual-tour">360° virtual tour</Link>.</p>
      </header>
      <Gallery />
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
  </>;
}
