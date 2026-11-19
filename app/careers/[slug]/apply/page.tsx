import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "../../../components";
import { getCareerJobs } from "../../../../lib/sanity/server";
import ApplicationForm from "../../application-form";
import "../../careers.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Apply | Beckett House careers",
  robots: { index: false, follow: false },
};
export default async function ApplyPage({
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
        <ApplicationForm job={job} />
      </main>
      <SiteFooter />
    </>
  );
}
