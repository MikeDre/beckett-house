import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "../components";
import FeeExplorer from "./fee-explorer";
import { getBreadcrumbSchema, jsonLd, SITE_URL } from "../../lib/seo";

const title = "Opening Hours & Fees";
const description = "Beckett House nursery opening hours, flexible sessions, Angel fees, Abbey Road fee plans and 15 or 30 hours funded childcare information.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/opening-hours-fees" }, openGraph: { title, description, url: "/opening-hours-fees", type: "website", locale: "en_GB" } };

export default function FeesPage() {
  return <><SiteHeader /><main className="timetable-page fees-page">
    <header className="timetable-intro"><h1>Opening hours & fees</h1></header>
    <section className="fees-opening" aria-labelledby="opening-title"><h2 id="opening-title">A little flexibility for your family</h2><p>Choose any number and configuration of available morning and afternoon sessions.</p><div className="fees-hours-grid">
      <article><h3>Opening hours</h3><p>Monday–Friday<br /><strong>8am–6pm</strong></p></article>
      <article><h3>Sessions at Angel</h3><p>Morning: 8am–2pm<br />Afternoon: 2pm–6pm<br />Full day: 8am–6pm</p></article>
      <article><h3>Weeks open</h3><p>Angel: 48 weeks a year, closed for two weeks in August and two weeks over Christmas.<br />Abbey Road: 50 weeks a year.</p><a href="/timetable#term-dates">View Angel term dates</a></article>
    </div></section>
    <FeeExplorer />
    <section id="funding" className="fees-funding" aria-labelledby="funding-title"><h2 id="funding-title">15 and 30 hours funding</h2>
      <p>All three- and four-year-olds in England can receive 15 funded hours a week from the term after their third birthday. Eligible working families can receive 30 hours a week from the term after their child turns nine months until school age. Some two-year-olds whose families receive additional support may qualify for 15 hours.</p>
      <p>Entitlements cover 38 weeks a year: 570 annual hours for a 15-hour entitlement, or 1,140 for a 30-hour entitlement. Subject to nursery agreement, funding can be stretched across more weeks with fewer funded hours each week, for example across Angel’s 48 weeks. Funded-only sessions depend on availability; ask your nursery to confirm its attendance and stretching arrangements.</p>
      <p>For the universal three- and four-year-old entitlement, Beckett House arranges the funding. Working-parent entitlements require an application and eligibility code.</p>
      <div className="fees-resource-links"><a href="https://beststartinlife.gov.uk/childcare-early-years-education/15-and-30-hours-support/">Check funding and eligibility</a><a href="https://beststartinlife.gov.uk/">Apply for childcare support</a><a href="https://www.islington.gov.uk/free2">Islington support for two-year-olds</a></div>
    </section>
    <section className="fees-booking" aria-labelledby="booking-title"><h2 id="booking-title">Payments & reserving a place at Angel</h2><p>Invoices are issued monthly. For privately paid places, a £75 registration fee and a deposit equal to four weeks’ fees reserve your place. The registration fee does not apply to funded hours. Registration is not enrolment.</p><p>If you wish to cancel your place, please give one term’s notice.</p><p className="fees-note">Beckett House Limited reserves the right to alter fees, timetable and conditions without notice. Please confirm fees, funding arrangements and deposit terms with the nursery before booking. Contact Abbey Road for its registration and deposit terms.</p></section>
  </main><SiteFooter /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(getBreadcrumbSchema([{ name: "Home", url: SITE_URL }, { name: title, url: `${SITE_URL}/opening-hours-fees` }])) }} /></>;
}
