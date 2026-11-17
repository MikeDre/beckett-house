import "server-only";
import { locations as defaults, type Location } from "../content";
import { getSanityContent } from "./server";
export async function getCmsLocations(): Promise<Location[]> {
  const data = await getSanityContent<{
    locations: (Partial<Location> & {
      panoramaLabels?: { name: string; description: string }[];
    })[];
  }>("site");
  return defaults.map((location) => {
    const saved = data?.locations.find((item) => item.slug === location.slug);
    return {
      ...location,
      ...saved,
      panoramas: location.panoramas.map((scene, index) => ({
        ...scene,
        ...saved?.panoramaLabels?.[index],
      })),
    };
  });
}
