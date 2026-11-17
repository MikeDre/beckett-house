import {getSanityContent as readSeoContent} from "../../lib/sanity/server";
import {getSanityContent} from "../../lib/sanity/server";

import {CmsText, CmsImage, CmsField} from "../cms-content";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components";
import CardAnimation, { type CardAnimationName } from "../card-animation";
import { getBreadcrumbSchema, jsonLd, SITE_URL, WEBSITE_ID, DEFAULT_OPEN_GRAPH } from "../../lib/seo";
import { montessoriSections as defaultSections } from "../../lib/montessori-content";

const title = "About Montessori";
const description = "Learn about Montessori education, the Prepared Environment, hands-on learning, Control of Error and children's freedom of choice at Beckett House.";
const defaultMetadata: Metadata = {
  title, description, alternates: { canonical: "/montessori" },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title, description, url: "/montessori", type: "website", locale: "en_GB" },
};

type MontessoriSection = (typeof defaultSections)[number];

const principleAnimations: Record<string, CardAnimationName> = {
  "control-of-error": "orbital",
  "holistic-learning": "puzzle",
  "language-and-mathematics": "beads",
  "freedom-of-choice": "blob",
  "role-of-staff": "ball",
};

function SectionCopy({ section }: { section: MontessoriSection }) {
  return <div className="montessori-section-copy"><h2 id={`${section.id}-title`}><CmsField page="montessori" field={`sections[${defaultSections.findIndex(item=>item.id===section.id)}].title`}>{section.title}</CmsField></h2>
    {section.paragraphs.map((paragraph, index) => <p key={index}><CmsField page="montessori" field={`sections[${defaultSections.findIndex(item=>item.id===section.id)}].paragraphs[${index}]`}>{paragraph}</CmsField></p>)}
  </div>;
}

function PrinciplePair({ sections }: { sections: MontessoriSection[] }) {
  return <div className={`principles section-pad montessori-principles${sections.length === 1 ? " montessori-principles-single" : ""}`}>
    {sections.map((section, index) => <section className={`principle-card ${index ? "principle-blue" : "principle-sun"}`} key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
      <CardAnimation name={principleAnimations[section.id]} />
      <SectionCopy section={section} />
    </section>)}
  </div>;
}

export default async function MontessoriPage() {
  const savedSections=(await getSanityContent<{sections:MontessoriSection[]}>("montessori"))?.sections;
  const montessoriSections=savedSections && savedSections.length>=2 ? savedSections : defaultSections;
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
          <h1 id="montessori-title"><CmsText page="montessori" field="copy.aboutMontessori" fallback={"About Montessori"} /></h1>
          <blockquote className="montessori-opening-quote">
            <p><CmsText page="montessori" field="copy.theMontessoriChildShouldBeTruthfulCourageous" fallback={"“The Montessori child should be... truthful, courageous, free of fear, confident, attentive, self-disciplined, generous and respectful, with a love for order and the environment, a love of work as a form of self-expression, the love of silence, of working alone, independent and creative with the ability to concentrate and develop intellectually. Overall, the child should be calm and happy.”"} /></p>
            <footer><cite><CmsText page="montessori" field="copy.mariaMontessoriHerLifeAndWork" fallback={"Maria Montessori: Her Life and Work"} /></cite><br /><CmsText page="montessori" field="copy.eMStanding1957" fallback={"E M Standing, 1957"} /></footer>
          </blockquote>
        </div>
        <div className="about-beckett-hero-image"><CmsImage page="montessori" field="photos.photo1" src="/images/angel/montessori-nursery-angel-sensorial-corner.webp" alt="Montessori materials on low shelves around a green table in the Angel classroom" width={2000} height={1333} sizes="(min-width: 900px) 50vw, 100vw" priority /></div>
      </section>
      <section className="montessori-freedom-quote section-pad" aria-label="Montessori freedom">
        <span className="quote-shape" aria-hidden="true" />
        <blockquote><p><CmsText page="montessori" field="copy.montessoriFreedomMeansThe" fallback={"Montessori freedom means the "} /><strong><CmsText page="montessori" field="copy.unlimitedFreedomToDoRight" fallback={"unlimited freedom to do right"} /></strong></p></blockquote>
      </section>
      <section className="montessori-origin section-pad" id={montessoriSections[0].id} aria-labelledby={`${montessoriSections[0].id}-title`}>
        <SectionCopy section={montessoriSections[0]} />
      </section>
      <section className="montessori-photo-story section-pad" id={montessoriSections[1].id} aria-labelledby={`${montessoriSections[1].id}-title`}>
        <CmsImage page="montessori" field="photos.photo2" src="/images/angel/montessori-nursery-angel-practical-life-dressing-frames.webp" alt="Montessori dressing frames and learning materials laid out in the Angel classroom" width={2000} height={1333} sizes="(min-width: 900px) 45vw, 100vw" loading="lazy" />
        <SectionCopy section={montessoriSections[1]} />
      </section>
      <PrinciplePair sections={montessoriSections.slice(2, 4)} />
      <PrinciplePair sections={montessoriSections.slice(4, 5)} />
      <PrinciplePair sections={montessoriSections.slice(5, 7)} />
      <div className="montessori-reading section-pad">
        <section className="montessori-suggested-reading" aria-labelledby="suggested-reading-title">
          <h2 id="suggested-reading-title"><CmsText page="montessori" field="copy.suggestedReading" fallback={"Suggested reading"} /></h2>
          <p><cite><CmsText page="montessori" field="copy.aParentsGuideToTheMontessoriClassroom" fallback={"A Parent's Guide to the Montessori Classroom"} /></cite><CmsText page="montessori" field="copy.byADWolf" fallback={", by A D Wolf."} /></p>
          <p><CmsText page="montessori" field="copy.thisBookletDescribesInDetailTheMontessori" fallback={"This booklet describes in detail the Montessori programme for children between the ages of three and six. It is designed to help parents understand the long range purpose of Montessori education and to give a description of the equipment which the child will be using for approximately three years."} /></p>
        </section>
      </div>
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
  </>;
}

export async function generateMetadata():Promise<Metadata> {
 const content=await readSeoContent<{seoTitle?:string;seoDescription?:string}>("montessori");
 const title=content?.seoTitle || defaultMetadata.title;
 const description=content?.seoDescription || defaultMetadata.description;
 return {...defaultMetadata,title,description,openGraph:{...defaultMetadata.openGraph,title:title as string,description:description || undefined},twitter:{...defaultMetadata.twitter,title:title as string,description:description || undefined}};
}
