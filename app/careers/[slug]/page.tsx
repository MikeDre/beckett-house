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
  return {
    title: job ? `${job.title} | Careers` : "Opportunity not found",
    robots: { index: false, follow: false },
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
  return (
    <>
      <SiteHeader />
      <main className="careers-page">
        <JobDetails job={job} />
      </main>
      <SiteFooter />
    </>
  );
}
