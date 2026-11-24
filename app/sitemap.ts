import {getCareerJobs} from '../lib/sanity/server';
import {indexableJob,jobPath} from '../lib/careers-seo';
import type { MetadataRoute } from "next";
import { locations } from "../lib/content";
import { CONTENT_LAST_REVIEWED, SITE_URL } from "../lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date(`${CONTENT_LAST_REVIEWED}T00:00:00Z`);
  const pages = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/find-your-nursery", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/montessori", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/beckett-house", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/history", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/virtual-tour", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/gallery", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/faq", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/timetable", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/opening-hours-fees", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/visit", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/register", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
  ];
  const jobs=await getCareerJobs();
  return [
    {url:SITE_URL+"/careers",changeFrequency:"weekly",priority:0.7},
    ...jobs.filter(indexableJob).map(job=>({url:SITE_URL+jobPath(job),changeFrequency:"weekly" as const,priority:0.6})),
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
