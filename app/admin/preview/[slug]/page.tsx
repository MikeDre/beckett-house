import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAnnouncements } from "../../../../lib/site-data";
import NurseryPreview from "./preview";

export const metadata: Metadata = { title: "Nursery homepage draft preview", robots: { index: false, follow: false } };
export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== "angel" && slug !== "abbey-road") notFound();
  return <NurseryPreview slug={slug} announcements={await getAnnouncements()}/>;
}
