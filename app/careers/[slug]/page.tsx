import {indexableJob,jobPath,jobSchema} from '../../../lib/careers-seo';
import {DEFAULT_OPEN_GRAPH,SITE_URL,jsonLd,getBreadcrumbSchema} from '../../../lib/seo';
import {locationName,careersPage} from '../../../lib/careers';
import {getCmsLocations} from '../../../lib/sanity/locations';
import {getSanityContent} from '../../../lib/sanity/server';
import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "../../components";
import { getCareerJobs } from "../../../lib/sanity/server";
import { JobDetails } from "../careers";
import "../careers.css";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = (await getCareerJobs()).find((j) => j.slug?.current === slug);
  const title=job?`${job.title} — ${locationName(job.location)} | Careers`:"Opportunity not found";
  const description=job?`${job.title} at Beckett House ${locationName(job.location)}. ${job.salary}. ${job.summary}`.slice(0,300):undefined;
  return {
    description,alternates:{canonical:job?jobPath(job):`/careers/${encodeURIComponent(slug)}`},
    openGraph:{...DEFAULT_OPEN_GRAPH,title,description,url:job?jobPath(job):"/careers"},
    twitter:{card:"summary_large_image",title,description,images:["/og.png"]},
    title: job ? title : "Opportunity not found",
    robots: { index: Boolean(job && indexableJob(job)), follow: true },
  };
}
export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = (await getCareerJobs()).find((j) => j.slug?.current === slug);
  if (!job) notFound();
  const location=(await getCmsLocations()).find(location=>location.slug===job.location);
  const content=await getSanityContent<typeof careersPage>("careers");
  const posting=location?jobSchema(job,location,content?.safeguarding||careersPage.safeguarding):null;
  const graph={"@context":"https://schema.org","@graph":[...(posting?[posting]:[]),getBreadcrumbSchema([{name:"Home",url:SITE_URL+"/"},{name:"Careers",url:SITE_URL+"/careers"},{name:job.title,url:SITE_URL+jobPath(job)}])]};
  return (
    <>
      <SiteHeader />
      <main className="careers-page">
        <JobDetails job={job} />
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(graph)}}/>
    </>
  );
}
