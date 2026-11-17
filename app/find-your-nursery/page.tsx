import {getSanityContent as readSeoContent} from "../../lib/sanity/server";
import {getCmsLocations} from "../../lib/sanity/locations";
import type { Metadata } from "next";
import { NurseryChooser, SiteFooter, SiteHeader } from "../components";

import {
  CONTENT_LAST_REVIEWED,
  getBreadcrumbSchema,
  getLocationSchema,
  jsonLd,
  locationId,
  locationUrl,
  SITE_URL,
  WEBSITE_ID, DEFAULT_OPEN_GRAPH } from "../../lib/seo";

const title = "Find a Montessori Nursery in North London";
const description =
  "Compare Beckett House Montessori nurseries in Angel, Islington and Abbey Road, St John's Wood by age range, location and opening hours.";

const defaultMetadata: Metadata = {
  title: { absolute: `${title} | Beckett House` },
  description,
  alternates: { canonical: "/find-your-nursery" },
  openGraph: { ...DEFAULT_OPEN_GRAPH,
    title: `${title} | Beckett House Montessori`,
    description,
    url: "/find-your-nursery",
    locale: "en_GB",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default async function FindYourNurseryPage() {
 const locations=await getCmsLocations();
  const url = `${SITE_URL}/find-your-nursery`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: "en-GB",
        dateModified: CONTENT_LAST_REVIEWED,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: locations.map((location, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: locationUrl(location),
            item: { "@id": locationId(location) },
          })),
        },
      },
      ...locations.map(getLocationSchema),
      getBreadcrumbSchema([
        { name: "Home", url: `${SITE_URL}/` },
        { name: "Find your nursery", url },
      ]),
    ],
  };

  return (
    <>
      <SiteHeader />
      <main className="nursery-chooser-page">
        <NurseryChooser locations={locations} />
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
 const content=await readSeoContent<{seoTitle?:string;seoDescription?:string}>("find-your-nursery");
 const title=content?.seoTitle || defaultMetadata.title;
 const description=content?.seoDescription || defaultMetadata.description;
 return {...defaultMetadata,title,description,openGraph:{...defaultMetadata.openGraph,title:title as string,description:description || undefined},twitter:{...defaultMetadata.twitter,title:title as string,description:description || undefined}};
}
