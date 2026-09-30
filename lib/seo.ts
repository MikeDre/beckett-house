import type { Location } from "./content";

export const SITE_URL = "https://www.beckett-house.co.uk";

// Open Graph fields every page shares. Pages that set their own `openGraph`
// replace the layout's entirely, so they spread these in to keep the image.
export const DEFAULT_OPEN_GRAPH = {
  siteName: "Beckett House Montessori",
  locale: "en_GB",
  type: "website" as const,
  images: [{ url: "/og.png", width: 1731, height: 909, alt: "Beckett House Montessori: Room to grow into themselves." }],
};
export const ORGANISATION_ID = `${SITE_URL}/#organisation`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const CONTENT_LAST_REVIEWED = "2026-09-30";

const weekdayHours = {
  "@type": "OpeningHoursSpecification",
  dayOfWeek: [
    "https://schema.org/Monday",
    "https://schema.org/Tuesday",
    "https://schema.org/Wednesday",
    "https://schema.org/Thursday",
    "https://schema.org/Friday",
  ],
  opens: "08:00",
  closes: "18:00",
};

export function locationUrl(location: Location) {
  return `${SITE_URL}/${location.slug}`;
}

export function locationId(location: Location) {
  return `${locationUrl(location)}#nursery`;
}

export function getOrganizationSchema(locations: Location[]) {
  return {
    "@type": ["Organization", "EducationalOrganization"],
    "@id": ORGANISATION_ID,
    name: "Beckett House Montessori",
    alternateName: "Beckett House",
    url: `${SITE_URL}/`,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/images/beckett-house-logo-dark.svg`,
    },
    image: `${SITE_URL}/images/hero-classroom.webp`,
    description:
      "A second-generation, family-run Montessori nursery with settings in Angel, Islington and Abbey Road, St John's Wood.",
    foundingDate: "1996",
    slogan: "A home from home where your children learn.",
    email: "info@beckett-house.co.uk",
    telephone: "+442072788824",
    areaServed: ["North London", "Islington", "Camden"],
    knowsAbout: [
      "Montessori education",
      "Early Years Foundation Stage",
      "early years childcare",
      "funded childcare",
    ],
    contactPoint: locations.map((location) => ({
      "@type": "ContactPoint",
      contactType: `${location.name} nursery enquiries`,
      telephone: location.phoneHref,
      email: location.email,
      areaServed: "GB",
      availableLanguage: "English",
    })),
    subOrganization: locations.map((location) => ({ "@id": locationId(location) })),
  };
}

export function getWebsiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: "Beckett House Montessori",
    alternateName: "Beckett House",
    description:
      "Montessori nursery care for children from 3 months to 5 years in Angel and Abbey Road, London.",
    inLanguage: "en-GB",
    publisher: { "@id": ORGANISATION_ID },
  };
}

export function getLocationSchema(location: Location) {
  const url = locationUrl(location);
  const googleMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${location.address}, ${location.postcode}`,
  )}`;

  return {
    "@type": "ChildCare",
    "@id": locationId(location),
    name: `Beckett House Montessori ${location.name}`,
    alternateName: `Beckett House ${location.name}`,
    url,
    description: location.ageDetail,
    image: {
      "@type": "ImageObject",
      url: `${SITE_URL}${location.image}`,
    },
    logo: `${SITE_URL}/images/beckett-house-logo-dark.svg`,
    parentOrganization: { "@id": ORGANISATION_ID },
    address: {
      "@type": "PostalAddress",
      streetAddress: location.streetAddress,
      addressLocality: location.addressLocality,
      addressRegion: "London",
      postalCode: location.postcode,
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: location.latitude,
      longitude: location.longitude,
    },
    hasMap: googleMapUrl,
    telephone: location.phoneHref,
    email: location.email,
    openingHours: "Mo-Fr 08:00-18:00",
    openingHoursSpecification: weekdayHours,
    areaServed: location.nearby,
    tourBookingPage: `${SITE_URL}/visit?location=${location.slug}`,
    subjectOf: {
      "@type": "Report",
      name: `Ofsted provider information for Beckett House ${location.name}`,
      url: location.ofstedUrl,
    },
  };
}

export function getFaqSchema(
  items: Array<{ question: string; answer: string }>,
  id: string,
) {
  return {
    "@type": "FAQPage",
    "@id": id,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function getBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
