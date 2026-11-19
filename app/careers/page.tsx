import { SiteHeader, SiteFooter } from "../components";
import { getCareerJobs } from "../../lib/sanity/server";
import { CareersListing } from "./careers";
import "./careers.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Work with us | Careers",
  description:
    "Explore careers with Beckett House Montessori in Angel and Abbey Road.",
  robots: { index: false, follow: false },
};
export default async function CareersPage() {
  return (
    <>
      <SiteHeader />
      <main className="careers-page">
        <CareersListing jobs={await getCareerJobs()} />
      </main>
      <SiteFooter />
    </>
  );
}
