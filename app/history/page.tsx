import type { Metadata } from "next";
import Image from "next/image";
import { SiteFooter, SiteHeader } from "../components";
import { getBreadcrumbSchema, jsonLd, ORGANISATION_ID, SITE_URL, WEBSITE_ID } from "../../lib/seo";

const title = "Our History";
const description = "The history of Beckett House Montessori in Barnsbury, Islington, from its opening in January 1996 to lasting connections with nursery families.";
export const metadata: Metadata = {
  title, description, alternates: { canonical: "/history" },
  openGraph: { title, description, url: "/history", type: "website", locale: "en_GB" },
};

export default function HistoryPage() {
  const url = `${SITE_URL}/history`;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "AboutPage", "@id": `${url}#webpage`, url, name: title, description, inLanguage: "en-GB", isPartOf: { "@id": WEBSITE_ID }, about: { "@id": ORGANISATION_ID } },
    getBreadcrumbSchema([{ name: "Home", url: `${SITE_URL}/` }, { name: title, url }]),
  ] };
  return <>
    <SiteHeader />
    <main className="about-page">
      <section className="about-beckett-hero" aria-labelledby="history-title">
        <div className="about-history-copy">
          <h1 id="history-title">A Brief History</h1>
          <p className="about-lede">Beckett House is a Montessori Nursery School situated in Barnsbury, in Islington, North London, N1.</p>
          <p>We opened in January 1996 since when we have established ourselves as one of the most popular nursery schools in the area with a somewhat esoteric appeal; with most of our current children being here due to recommendations from previous parents.</p>
          <p>The head teacher and the core members of staff are Montessori qualified and those with other qualifications offer the advantages of their own particular training within the guidance of the head.</p>
        </div>
        <div className="about-beckett-hero-image"><Image src="/images/angel-ofsted-news.jpg" alt="A Beckett House classroom with child-sized tables, chairs and learning materials" width={786} height={523} sizes="(min-width: 900px) 50vw, 100vw" priority unoptimized /></div>
      </section>
      <section className="about-home-from-home section-pad" aria-label="What sets Beckett House apart">
        <p>Parents maintain it is its <strong>‘home from home’</strong> nature that sets Beckett House apart from other nurseries.</p>
      </section>
      <section className="about-history-continuation section-pad" aria-label="Learning, care and lasting connections">
        <p>Learning is a key ingredient in its philosophy but so is care, nurturing, discipline, parental involvement, family values and an encouragement to embrace the world and all its wonders.</p>
        <p>Many children move on to some of the best schools in London and since 2006 some of its first ever children have been coming back for their work experience; tall, clever and just amazing!</p>
      </section>
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
  </>;
}
