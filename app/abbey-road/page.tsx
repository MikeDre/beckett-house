import AbbeyRoadHome from "../abbey-road-home";
import { generateMetadata as nurseryMetadata } from "../nursery-page";

const params = Promise.resolve({ slug: "abbey-road" });

export function generateMetadata() {
  return nurseryMetadata({ params });
}

export default function AbbeyRoadPage() {
  return <AbbeyRoadHome />;
}
