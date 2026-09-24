import type { Metadata } from "next";
import Image from "next/image";
import { SiteFooter, SiteHeader } from "../components";
import { getBreadcrumbSchema, jsonLd, SITE_URL, WEBSITE_ID } from "../../lib/seo";
import { montessoriSections } from "../../lib/montessori-content";

const title = "About Montessori";
const description = "Learn about Montessori education, the Prepared Environment, hands-on learning, Control of Error and children's freedom of choice at Beckett House.";
export const metadata: Metadata = {
  title, description, alternates: { canonical: "/montessori" },
  openGraph: { title, description, url: "/montessori", type: "website", locale: "en_GB" },
};

type MontessoriSection = (typeof montessoriSections)[number];

function SectionCopy({ section }: { section: MontessoriSection }) {
  return <div className="montessori-section-copy"><h2 id={`${section.id}-title`}>{section.title}</h2>
    {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
  </div>;
}

function PrinciplePair({ sections }: { sections: MontessoriSection[] }) {
  return <div className={`principles section-pad montessori-principles${sections.length === 1 ? " montessori-principles-single" : ""}`}>
    {sections.map((section, index) => <section className={`principle-card ${index ? "principle-blue" : "principle-sun"}`} key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
      <div className="principle-shape" aria-hidden="true" />
      <SectionCopy section={section} />
    </section>)}
  </div>;
}

export default function MontessoriPage() {
  const url = `${SITE_URL}/montessori`;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "AboutPage", "@id": `${url}#webpage`, url, name: title, description, inLanguage: "en-GB", isPartOf: { "@id": WEBSITE_ID }, about: { "@type": "Thing", name: "Montessori education" } },
    getBreadcrumbSchema([{ name: "Home", url: `${SITE_URL}/` }, { name: title, url }]),
  ] };
  return <>
    <SiteHeader />
    <main className="about-page montessori-page">
      <section className="about-beckett-hero" aria-labelledby="montessori-title">
        <div className="about-history-copy">
          <h1 id="montessori-title">About Montessori</h1>
          <blockquote className="montessori-opening-quote">
            <p>“The Montessori child should be... truthful, courageous, free of fear, confident, attentive, self-disciplined, generous and respectful, with a love for order and the environment, a love of work as a form of self-expression, the love of silence, of working alone, independent and creative with the ability to concentrate and develop intellectually. Overall, the child should be calm and happy.”</p>
            <footer><cite>Maria Montessori: Her Life and Work</cite><br />E M Standing, 1957</footer>
          </blockquote>
        </div>
        <div className="about-beckett-hero-image"><Image src="/images/classroom-detail.webp" alt="Low shelves and child-sized furniture in a prepared Beckett House Montessori classroom" width={1400} height={1050} sizes="(min-width: 900px) 50vw, 100vw" priority unoptimized /></div>
      </section>
      <section className="montessori-freedom-quote section-pad" aria-label="Montessori freedom">
        <blockquote><p>Montessori freedom means the <strong>unlimited freedom to do right</strong></p></blockquote>
      </section>
      <section className="montessori-origin section-pad" id={montessoriSections[0].id} aria-labelledby={`${montessoriSections[0].id}-title`}>
        <SectionCopy section={montessoriSections[0]} />
      </section>
      <section className="montessori-photo-story section-pad" id={montessoriSections[1].id} aria-labelledby={`${montessoriSections[1].id}-title`}>
        <Image src="/images/hero-classroom.webp" alt="A wide view of the prepared Montessori classroom, with accessible shelves and child-sized furniture" width={1800} height={1199} sizes="(min-width: 900px) 45vw, 100vw" loading="lazy" unoptimized />
        <SectionCopy section={montessoriSections[1]} />
      </section>
      <PrinciplePair sections={montessoriSections.slice(2, 4)} />
      <PrinciplePair sections={montessoriSections.slice(4, 5)} />
      <PrinciplePair sections={montessoriSections.slice(5, 7)} />
      <div className="montessori-reading section-pad">
        <section className="montessori-suggested-reading" aria-labelledby="suggested-reading-title">
          <h2 id="suggested-reading-title">Suggested reading</h2>
          <p><cite>A Parent&apos;s Guide to the Montessori Classroom</cite>, by A D Wolf.</p>
          <p>This booklet describes in detail the Montessori programme for children between the ages of three and six. It is designed to help parents understand the long range purpose of Montessori education and to give a description of the equipment which the child will be using for approximately three years.</p>
        </section>
      </div>
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
  </>;
}
