import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components";
import { NurseryToggle, NurseryView } from "../nursery-toggle";
import { CONTENT_LAST_REVIEWED, getBreadcrumbSchema, jsonLd, SITE_URL, WEBSITE_ID, DEFAULT_OPEN_GRAPH } from "../../lib/seo";

const title = "Timetable & Term Dates";
const description = "Daily timetable, session times and term dates for Beckett House Montessori nurseries in Angel and Abbey Road.";
export const metadata: Metadata = {
  title, description, alternates: { canonical: "/timetable" },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title, description, url: "/timetable", type: "website", locale: "en_GB" },
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
const angelOpeningHours: Activity[] = [
  { time: "8am–6pm", title: "Monday–Friday" },
];
const angelSessions: Activity[] = [
  { time: "8am–6pm", title: "Full-day care" },
  { time: "8am–2pm", title: "Morning session" },
  { time: "2pm–6pm", title: "Afternoon session" },
];
const abbeyRoadBabyMorning: Activity[] = [
  { time: "8:00–9:00am", title: "Drop-off, bottles and breakfast" },
  { time: "9:00–9:30am", title: "Nappies" },
  { time: "9:30–10:00am", title: "Circle time", note: "Books, songs, puppets and finger plays." },
  { time: "10:00–10:15am", title: "Bottles and morning snack" },
  { time: "10:15–10:30am", title: "Nappies and clean-up" },
  { time: "10:30–11:30am", title: "Nap time" },
  { time: "11:30am–12:00pm", title: "Bottles and lunch" },
];
const abbeyRoadBabyAfternoon: Activity[] = [
  { time: "12:00–12:30pm", title: "Story time", note: "Books and songs." },
  { time: "12:30–1:30pm", title: "Outside play and gross motor activities" },
  { time: "1:30–2:30pm", title: "Nap time" },
  { time: "2:00pm", title: "Arrival time for afternoon children" },
  { time: "2:30–3:00pm", title: "Bottles and snack" },
  { time: "3:00–4:00pm", title: "Sensory or art activity" },
  { time: "4:00–5:00pm", title: "Individual play time" },
];
const abbeyRoadMorning: Activity[] = [
  { time: "8:00am", title: "Arrival time for the children" },
  { time: "8:30–11:30am", title: "Montessori work cycle" },
  { time: "8:30–11:30am", title: "Free-flow snack time" },
  { time: "11:30am", title: "Circle time or group activity", note: "Topical, and extra-curricular activities." },
  { time: "12:30pm", title: "Lunch" },
  { time: "1:15–2:00pm", title: "Rest time for all-day children" },
  { time: "2:00pm", title: "Collection time for morning children" },
];
const abbeyRoadAfternoon: Activity[] = [
  { time: "2:00pm", title: "Arrival time for afternoon children" },
  { time: "2:15–4:00pm", title: "Montessori and Circle Time" },
  { time: "2:15–4:30pm", title: "Free-flow snack time" },
  { time: "4:30pm", title: "Music & Story Time" },
  { time: "4:30–5:30pm", title: "Physical activity", note: "Music & Movement, Song & Dance." },
  { time: "6:00pm", title: "Collection time for the children" },
];
const abbeyRoadOpeningHours: Activity[] = [
  { time: "8am–6pm", title: "Monday–Friday" },
];
const abbeyRoadSessions: Activity[] = [
  { time: "8am–6pm", title: "Full-day care" },
  { time: "8am–1pm", title: "Morning session" },
  { time: "1pm–6pm", title: "Afternoon session" },
];
const terms = [
  { title: "Summer term 2026", start: "2026-04-27", end: "2026-08-14", from: "Monday 27 April", to: "Friday 14 August 2026" },
  { title: "Autumn term 2026", start: "2026-09-01", end: "2026-12-18", from: "Tuesday 1 September", to: "Friday 18 December 2026" },
  { title: "January–April 2027", start: "2027-01-04", end: "2027-04-23", from: "Monday 4 January", to: "Friday 23 April 2027" },
];
const abbeyRoadTerms = [
  { title: "Summer term 2026", start: "2026-05-18", end: "2026-08-28", from: "Monday 18 May", to: "Friday 28 August 2026" },
  { title: "Autumn term 2026", start: "2026-08-31", end: "2026-12-18", from: "Monday 31 August", to: "Friday 18 December 2026" },
  { title: "Spring term 2027", start: "2027-01-04", end: "2027-04-23", from: "Monday 4 January", to: "Friday 23 April 2027" },
];

function Schedule({ heading, activities }: { heading: string; activities: Activity[] }) {
  return <section className="schedule-card" aria-label={heading}>
    <h4>{heading}</h4>
    <ol className="schedule-list">{activities.map((activity, index) => <li key={`${activity.time}-${index}`}>
      <span className="schedule-time">{activity.time}</span>
      <div><h5>{activity.title}</h5>{activity.note && <p>{activity.note}</p>}</div>
    </li>)}</ol>
  </section>;
}

export default function TimetablePage() {
  const url = `${SITE_URL}/timetable`;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", "@id": `${url}#webpage`, url, name: title, description, inLanguage: "en-GB", dateModified: CONTENT_LAST_REVIEWED, isPartOf: { "@id": WEBSITE_ID } },
    getBreadcrumbSchema([{ name: "Home", url: `${SITE_URL}/` }, { name: title, url }]),
  ] };
  return <>
    <SiteHeader />
    <main className="timetable-page">
      <header className="timetable-intro"><h1>Timetable & term dates</h1>
        <NurseryToggle label="Choose a nursery timetable" />
      </header>
      <NurseryView nursery="angel">
      <section id="angel" className="nursery-schedule" aria-labelledby="angel-title">
        <div className="timetable-nursery-heading"><h2 id="angel-title">Angel</h2><p className="timetable-address">98 Richmond Avenue, Islington</p></div>
        <h3 className="schedule-section-title">Opening hours & sessions</h3>
        <div className="schedule-grid"><Schedule heading="Opening hours" activities={angelOpeningHours} /><Schedule heading="Sessions" activities={angelSessions} /></div>
        <h3 className="schedule-section-title">Daily routine</h3>
        <p className="schedule-group-title">Two years to school age</p>
        <div className="schedule-grid"><Schedule heading="Morning" activities={morning} /><Schedule heading="Afternoon" activities={afternoon} /></div>
        <aside className="schedule-note"><h3>Time outdoors</h3><p>As the school does not have its own playground or large garden, every effort is made to visit the local Islington parks as often as possible, such as Lonsdale Square and Barnard Park. Most of these have play areas that are protected by wardens.</p></aside>
        <p className="schedule-disclaimer">Beckett House reserves the right to alter timetables without notice.</p>
        <section id="term-dates" className="term-dates" aria-labelledby="term-title"><h2 id="term-title">Angel term dates</h2><div className="term-grid">{terms.map(term => <article className="term-card" key={term.start}><h3>{term.title}</h3><p><time dateTime={term.start}>{term.from}</time><span>to</span><time dateTime={term.end}>{term.to}</time></p></article>)}</div></section>
      </section>
      </NurseryView>
      <NurseryView nursery="abbey-road">
      <section id="abbey-road" className="nursery-schedule" aria-labelledby="abbey-road-title">
        <div className="timetable-nursery-heading"><h2 id="abbey-road-title">Abbey Road</h2><p className="timetable-address">Abbey Hive, 84–86 Abbey Road, London, NW8 0QA</p></div>
        <h3 className="schedule-section-title">Opening hours & sessions</h3>
        <div className="schedule-grid"><Schedule heading="Opening hours" activities={abbeyRoadOpeningHours} /><Schedule heading="Sessions" activities={abbeyRoadSessions} /></div>
        <h3 className="schedule-section-title">Daily routine</h3>
        <p className="schedule-group-title">From babies to two years (or walking)</p>
        <div className="schedule-grid"><Schedule heading="Morning" activities={abbeyRoadBabyMorning} /><Schedule heading="Afternoon" activities={abbeyRoadBabyAfternoon} /></div>
        <p className="schedule-group-title">Two years to school age</p>
        <div className="schedule-grid"><Schedule heading="Morning" activities={abbeyRoadMorning} /><Schedule heading="Afternoon" activities={abbeyRoadAfternoon} /></div>
        <p className="schedule-disclaimer">Beckett House reserves the right to alter timetables without notice.</p>
        <section id="abbey-road-term-dates" className="term-dates" aria-labelledby="abbey-road-term-title"><h2 id="abbey-road-term-title">Abbey Road term dates</h2><div className="term-grid">{abbeyRoadTerms.map(term => <article className="term-card" key={term.start}><h3>{term.title}</h3><p><time dateTime={term.start}>{term.from}</time><span>to</span><time dateTime={term.end}>{term.to}</time></p></article>)}</div></section>
      </section>
      </NurseryView>
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
  </>;
}
