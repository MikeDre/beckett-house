import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components";
import { DEFAULT_OPEN_GRAPH } from "../../lib/seo";
import { getPublishedFaqContent } from "../../lib/faq-store";
import FaqView from "./faq-view";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedFaqContent();
  return {
    title: content.seoTitle, description: content.seoDescription,
    alternates: { canonical: "/faq" },
    openGraph: { ...DEFAULT_OPEN_GRAPH, title: content.seoTitle, description: content.seoDescription, url: "/faq", type: "website", locale: "en_GB" },
    twitter: { card: "summary_large_image", title: content.seoTitle, description: content.seoDescription },
  };
}
export default async function FaqPage() {
  const content = await getPublishedFaqContent();
  return <><SiteHeader /><FaqView content={content} /><SiteFooter /></>;
}
