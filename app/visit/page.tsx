import {getSanityContent as readSeoContent} from "../../lib/sanity/server";
import {getCmsLocations} from "../../lib/sanity/locations";

import {CmsText} from "../cms-content";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader, VisitForm } from "../components";
import CardAnimation from "../card-animation";

import {
  CONTENT_LAST_REVIEWED,
  getBreadcrumbSchema,
  jsonLd,
  ORGANISATION_ID,
  SITE_URL,
  WEBSITE_ID, DEFAULT_OPEN_GRAPH } from "../../lib/seo";

const title = "Book a Montessori Nursery Visit";
const description =
  "Arrange a visit to Beckett House Montessori in Angel or Abbey Road. Meet the team, explore the rooms, and discuss sessions, fees and funded childcare.";

const defaultMetadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/visit" },
  openGraph: { ...DEFAULT_OPEN_GRAPH,
    title: `${title} | Beckett House Montessori`,
    description,
    url: "/visit",
    locale: "en_GB",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default async function VisitPage() {
 const locations=await getCmsLocations();
  const url = `${SITE_URL}/visit`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: "en-GB",
        dateModified: CONTENT_LAST_REVIEWED,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORGANISATION_ID },
        mainEntity: { "@id": ORGANISATION_ID },
      },
      getBreadcrumbSchema([
        { name: "Home", url: `${SITE_URL}/` },
        { name: "Book a visit", url },
      ]),
    ],
  };

  return (
    <>
      <SiteHeader />
      <main>
        <section className="visit-hero">
          <CardAnimation name="morphball" />
          <div>
            <p className="eyebrow"><CmsText page="visit" field="copy.comeAndMeetUs" fallback={"Come and meet us"} /></p>
            <h1><CmsText page="visit" field="copy.letsFindTheRightFitTogether" fallback={"Let's find the right fit, together."} /></h1>
          </div>
          <p>
            <CmsText page="visit" field="copy.tellUsALittleAboutYourFamily" fallback={"Tell us a little about your family and preferred location. We'll get back to arrange a relaxed visit with the nursery team."} /></p>
        </section>
        <section className="visit-layout section-pad">
          <VisitForm />
          <aside className="visit-aside">
            <p className="eyebrow"><CmsText page="visit" field="copy.preferToTalk" fallback={"Prefer to talk?"} /></p>
            {locations.map((location) => (
              <div className={`visit-location visit-${location.colour}`} key={location.slug}>
                <span>{location.area}</span>
                <h2>{location.name}</h2>
                <p>
                  {location.address}<CmsText page="visit" field="copy.text" fallback={", "} />{location.postcode}
                </p>
                <a href={`tel:${location.phoneHref}`}>{location.phone}</a>
                <a href={`mailto:${location.email}`}>{location.email}</a>
              </div>
            ))}
            <div className="visit-expect">
              <strong><CmsText page="visit" field="copy.whatToExpect" fallback={"What to expect"} /></strong>
              <ol>
                <li><CmsText page="visit" field="copy.aShortConversationAboutYourChild" fallback={"A short conversation about your child"} /></li>
                <li><CmsText page="visit" field="copy.aTourAtTheirLevel" fallback={"A tour at their level"} /></li>
                <li><CmsText page="visit" field="copy.clearAnswersOnSessionsFeesAndFunding" fallback={"Clear answers on sessions, fees and funding"} /></li>
              </ol>
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
    </>
  );
}

export async function generateMetadata():Promise<Metadata> {
 const content=await readSeoContent<{seoTitle?:string;seoDescription?:string}>("visit");
 const title=content?.seoTitle || defaultMetadata.title;
 const description=content?.seoDescription || defaultMetadata.description;
 return {...defaultMetadata,title,description,openGraph:{...defaultMetadata.openGraph,title:title as string,description:description || undefined},twitter:{...defaultMetadata.twitter,title:title as string,description:description || undefined}};
}
