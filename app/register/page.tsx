import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components";
import {
  CONTENT_LAST_REVIEWED,
  getBreadcrumbSchema,
  jsonLd,
  ORGANISATION_ID,
  SITE_URL,
  WEBSITE_ID, DEFAULT_OPEN_GRAPH } from "../../lib/seo";
import { RegistrationPage } from "./registration-page";
import "./register.css";

const title = "Register Your Child";
const description =
  "Register your child with Beckett House Montessori in Angel or Abbey Road and review the nursery registration terms.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/register" },
  openGraph: { ...DEFAULT_OPEN_GRAPH,
    title: `${title} | Beckett House Montessori`,
    description,
    url: "/register",
    locale: "en_GB",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function RegisterPage() {
  const url = `${SITE_URL}/register`;
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
        dateModified: CONTENT_LAST_REVIEWED,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORGANISATION_ID },
      },
      getBreadcrumbSchema([
        { name: "Home", url: `${SITE_URL}/` },
        { name: "Register", url },
      ]),
    ],
  };

  return (
    <>
      <SiteHeader />
      <main>
        <section className="register-hero">
          <p className="eyebrow">Join Beckett House</p>
          <h1>Register your child.</h1>
          <p>
            Choose your nursery, tell us about your child and the sessions you
            need, then review the registration terms.
          </p>
        </section>
        <RegistrationPage />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
    </>
  );
}
