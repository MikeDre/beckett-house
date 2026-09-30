import type { Metadata } from "next";
import { SiteFooter, SiteHeader, VisitForm } from "../components";
import CardAnimation from "../card-animation";
import { locations } from "../../lib/content";
import {
  CONTENT_LAST_REVIEWED,
  getBreadcrumbSchema,
  jsonLd,
  ORGANISATION_ID,
  SITE_URL,
  WEBSITE_ID,
} from "../../lib/seo";

const title = "Book a Montessori Nursery Visit";
const description =
  "Arrange a visit to Beckett House Montessori in Angel or Abbey Road. Meet the team, explore the rooms, and discuss sessions, fees and funded childcare.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/visit" },
  openGraph: {
    title: `${title} | Beckett House Montessori`,
    description,
    url: "/visit",
    locale: "en_GB",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function VisitPage() {
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
            <p className="eyebrow">Come and meet us</p>
            <h1>Let&apos;s find the right fit, together.</h1>
          </div>
          <p>
            Tell us a little about your family and preferred location. We&apos;ll
            get back to arrange a relaxed visit with the nursery team.
          </p>
        </section>
        <section className="visit-layout section-pad">
          <VisitForm />
          <aside className="visit-aside">
            <p className="eyebrow">Prefer to talk?</p>
            {locations.map((location) => (
              <div className={`visit-location visit-${location.colour}`} key={location.slug}>
                <span>{location.area}</span>
                <h2>{location.name}</h2>
                <p>
                  {location.address}, {location.postcode}
                </p>
                <a href={`tel:${location.phoneHref}`}>{location.phone}</a>
                <a href={`mailto:${location.email}`}>{location.email}</a>
              </div>
            ))}
            <div className="visit-expect">
              <strong>What to expect</strong>
              <ol>
                <li>A short conversation about your child</li>
                <li>A tour at their level</li>
                <li>Clear answers on sessions, fees and funding</li>
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
