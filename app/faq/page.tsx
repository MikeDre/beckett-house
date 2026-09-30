import type { Metadata } from "next";
import Link from "next/link";
import { FAQList, SiteFooter, SiteHeader } from "../components";
import CardAnimation from "../card-animation";
import {
  getBreadcrumbSchema,
  getFaqSchema,
  jsonLd,
  ORGANISATION_ID,
  SITE_URL,
  WEBSITE_ID, DEFAULT_OPEN_GRAPH } from "../../lib/seo";
import { faqGroups, faqItems } from "./faq-content";
import "./faq.css";

const title = "Frequently Asked Questions";
const description =
  "Answers about places, sessions, fees, funding and nursery life at Beckett House Montessori in Angel and Abbey Road.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/faq" },
  openGraph: { ...DEFAULT_OPEN_GRAPH,
    title,
    description,
    url: "/faq",
    type: "website",
    locale: "en_GB",
  },
};

export default function FaqPage() {
  const url = `${SITE_URL}/faq`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: "en-GB",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORGANISATION_ID },
      },
      getBreadcrumbSchema([
        { name: "Home", url: `${SITE_URL}/` },
        { name: title, url },
      ]),
      getFaqSchema(faqItems, `${url}#faq`),
    ],
  };

  return (
    <>
      <SiteHeader />
      <main className="faq-page-main">
        <header className="faq-page-hero">
          <p className="faq-page-eyebrow">Good to know</p>
          <h1>Frequently Asked Questions</h1>
          <p className="faq-page-intro">
            Practical answers for families considering Beckett House Montessori
            in Angel or Abbey Road.
          </p>
        </header>

        <div className="faq-page-layout">
          <nav className="faq-page-index" aria-label="Frequently asked question topics">
            <p>On this page</p>
            <ol>
              {faqGroups.map((group) => (
                <li key={group.id}>
                  <a href={`#${group.id}`}>{group.heading}</a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="faq-page-groups">
            {faqGroups.map((group) => (
              <section
                className="faq-page-section"
                id={group.id}
                aria-labelledby={`${group.id}-heading`}
                key={group.id}
              >
                <h2 id={`${group.id}-heading`}>{group.heading}</h2>
                <FAQList items={group.items} />
              </section>
            ))}
          </div>
        </div>

        <section className="faq-page-contact" aria-labelledby="faq-page-contact-heading">
          <div className="faq-page-contact-copy">
            <CardAnimation name="morphball-light" />
            <p className="faq-page-eyebrow">Still have a question?</p>
            <h2 id="faq-page-contact-heading">Talk to the nursery team.</h2>
            <p>
              Arrange a visit to meet us, or send your registration when you are
              ready.
            </p>
            <div className="faq-page-actions">
              <Link className="faq-page-primary-link" href="/visit">
                Arrange a visit
              </Link>
              <Link className="faq-page-secondary-link" href="/register">
                Register your child
              </Link>
            </div>
          </div>
          <div className="faq-page-contact-details">
            <article>
              <h3>Angel</h3>
              <a href="mailto:info@beckett-house.co.uk">info@beckett-house.co.uk</a>
              <a href="tel:+442072788824">020 7278 8824</a>
            </article>
            <article>
              <h3>Abbey Road</h3>
              <a href="mailto:abbeyroad@beckett-house.co.uk">
                abbeyroad@beckett-house.co.uk
              </a>
              <a href="tel:+442045687042">020 4568 7042</a>
            </article>
          </div>
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
