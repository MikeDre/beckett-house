import {careersListingSchema} from '../../lib/careers-seo';
import {DEFAULT_OPEN_GRAPH,jsonLd} from '../../lib/seo';
import { SiteHeader, SiteFooter } from "../components";
import { getCareerJobs } from "../../lib/sanity/server";
import { CareersListing } from "./careers";
import "./careers.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Work with us | Careers",
  description:
    "Explore careers with Beckett House Montessori in Angel and Abbey Road.",
  alternates:{canonical:"/careers"},
  openGraph:{...DEFAULT_OPEN_GRAPH,title:"Work with us | Careers",description:"Explore nursery careers in Angel and Abbey Road, London.",url:"/careers"},
  twitter:{card:"summary_large_image",title:"Work with us | Careers",description:"Explore nursery careers in Angel and Abbey Road, London.",images:["/og.png"]},
  robots: { index: true, follow: true },
};
export default async function CareersPage() {
 const jobs=await getCareerJobs();
  return (
    <>
      <SiteHeader />
      <main className="careers-page">
        <CareersListing jobs={jobs} />
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(careersListingSchema(jobs))}}/>
    </>
  );
}
