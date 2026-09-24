import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components";
import { getBreadcrumbSchema, jsonLd, SITE_URL, WEBSITE_ID } from "../../lib/seo";

const title = "Timetable & Term Dates";
const description = "Angel nursery's daily Montessori timetable, morning and afternoon sessions, and term dates.";
export const metadata: Metadata = {
  title, description, alternates: { canonical: "/timetable" },
  openGraph: { title, description, url: "/timetable", type: "website", locale: "en_GB" },
};

type Activity = { time: string; title: string; note?: string };
const morning: Activity[] = [
  { time: "8:00am", title: "Arrival time for all-day children" },
  { time: "8:00–11:30am", title: "Montessori and Circle Time" },
  { time: "8:30–11:30am", title: "Free-flow snack time" },
  { time: "11:30am", title: "Circle time or group activity", note: "Topical (seasonal or project work). Extra-curricular classes: dance, music, drama, yoga or sport." },
  { time: "12:30pm", title: "Lunch" },
  { time: "1:15–2:00pm", title: "Rest time for all-day children", note: "The school provides mattresses, pillows and blankets." },
  { time: "2:00pm", title: "Collection time for morning children" },
];
const afternoon: Activity[] = [
  { time: "2:00pm", title: "Arrival time for afternoon children" },
  { time: "2:15–4:00pm", title: "Montessori and Circle Time" },
  { time: "2:15–4:30pm", title: "Free-flow snack time" },
  { time: "4:30pm", title: "Music & Story Time" },
  { time: "4:30pm", title: "Physical activity", note: "Music & Movement, Song & Dance or Climbing Frame." },
  { time: "6:00pm", title: "Collection time for afternoon children" },
  { time: "6:00pm", title: "Collection time for all-day children" },
];
const terms = [
  { title: "Summer term 2026", start: "2026-04-27", end: "2026-08-14", from: "Monday 27 April", to: "Friday 14 August 2026" },
  { title: "Autumn term 2026", start: "2026-09-01", end: "2026-12-18", from: "Tuesday 1 September", to: "Friday 18 December 2026" },
  { title: "January–April 2027", start: "2027-01-04", end: "2027-04-23", from: "Monday 4 January", to: "Friday 23 April 2027" },
];

function Schedule({ heading, activities }: { heading: string; activities: Activity[] }) {
  return <section className="schedule-card" aria-label={heading}>
    <h3>{heading}</h3>
    <ol className="schedule-list">{activities.map((activity, index) => <li key={`${activity.time}-${index}`}>
      <span className="schedule-time">{activity.time}</span>
      <div><h4>{activity.title}</h4>{activity.note && <p>{activity.note}</p>}</div>
    </li>)}</ol>
  </section>;
}

export default function TimetablePage() {
  const url = `${SITE_URL}/timetable`;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", "@id": `${url}#webpage`, url, name: title, description, inLanguage: "en-GB", dateModified: "2026-09-16", isPartOf: { "@id": WEBSITE_ID } },
    getBreadcrumbSchema([{ name: "Home", url: `${SITE_URL}/` }, { name: title, url }]),
  ] };
  return <>
    <SiteHeader />
    <main className="timetable-page">
      <header className="timetable-intro"><h1>Timetable & term dates</h1>
      </header>
      <section id="angel" className="nursery-schedule" aria-labelledby="angel-title">
        <div className="timetable-nursery-heading"><h2 id="angel-title">Angel</h2><p className="timetable-address">98 Richmond Avenue, Islington</p><p>Morning, afternoon and all-day sessions.</p></div>
        <div className="schedule-grid"><Schedule heading="Morning" activities={morning} /><Schedule heading="Afternoon" activities={afternoon} /></div>
        <aside className="schedule-note"><h3>Time outdoors</h3><p>As the school does not have its own playground or large garden, every effort is made to visit the local Islington parks as often as possible, such as Lonsdale Square and Barnard Park. Most of these have play areas that are protected by wardens.</p></aside>
        <p className="schedule-disclaimer">Beckett House reserves the right to alter timetables without notice.</p>
        <section id="term-dates" className="term-dates" aria-labelledby="term-title"><h2 id="term-title">Angel term dates</h2><div className="term-grid">{terms.map(term => <article className="term-card" key={term.start}><h3>{term.title}</h3><p><time dateTime={term.start}>{term.from}</time><span>to</span><time dateTime={term.end}>{term.to}</time></p></article>)}</div></section>
      </section>
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
  </>;
}
