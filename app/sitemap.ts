import type { MetadataRoute } from "next";
import { locations } from "../lib/content";
import { CONTENT_LAST_REVIEWED, SITE_URL } from "../lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${CONTENT_LAST_REVIEWED}T00:00:00Z`);
  const pages = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/find-your-nursery", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/montessori", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/beckett-house", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/history", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/virtual-tour", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/timetable", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/opening-hours-fees", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/visit", changeFrequency: "monthly" as const, priority: 0.9 },
  ];
  return [
    ...pages.map((page) => ({
      url: `${SITE_URL}${page.path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...locations.map((location) => ({
      url: `${SITE_URL}/${location.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 1,
    })),
  ];
}
