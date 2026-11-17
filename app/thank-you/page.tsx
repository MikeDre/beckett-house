import {getSanityContent as readSeoContent} from "../../lib/sanity/server";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components";
import CardAnimation from "../card-animation";
import ThankYouContent from "./thank-you-content";

const defaultMetadata: Metadata = {
  title: "Thank you",
  description: "Thank you for getting in touch with Beckett House Montessori.",
  alternates: { canonical: "/thank-you" },
  robots: { index: false, follow: true },
};

export default function ThankYouPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ThankYouContent animation={<CardAnimation name="morphball" />} />
      </main>
      <SiteFooter />
    </>
  );
}

export async function generateMetadata():Promise<Metadata> {
 const content=await readSeoContent<{seoTitle?:string;seoDescription?:string}>("thank-you");
 const title=content?.seoTitle || defaultMetadata.title;
 const description=content?.seoDescription || defaultMetadata.description;
 return {...defaultMetadata,title,description,openGraph:{...defaultMetadata.openGraph,title:title as string,description:description || undefined},twitter:{...defaultMetadata.twitter,title:title as string,description:description || undefined}};
}
