import { notFound, permanentRedirect } from "next/navigation";
import { getLocation } from "../../../lib/content";

export default async function LegacyLocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();
  permanentRedirect(`/${location.slug}`);
}
