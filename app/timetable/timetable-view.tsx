import { NurseryToggle, NurseryView } from "../nursery-toggle";
import { RoutinePicker } from "./routine-picker";
import type { Activity, Term, TimetableContent } from "../../lib/timetable-content";
const termWeekday = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });
const termDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
// "Mon 27 April" / "Fri 14 August 2026": built by hand because en-GB adds a comma after the weekday.
const termDay = (iso: string, withYear = false) => { const date = new Date(iso); return `${termWeekday.format(date)} ${termDate.format(date)}${withYear ? ` ${date.getUTCFullYear()}` : ""}`; };

function TermCard({ term }: { term: Term }) {
  return <article className="term-card"><h3>{term.title}</h3><p>
    <time dateTime={term.start}>{termDay(term.start)}</time>
    <span className="term-card-arrow" aria-hidden="true"> → </span><span className="visually-hidden"> to </span>
    <time dateTime={term.end}>{termDay(term.end, true)}</time>
  </p></article>;
}

function Schedule({ heading, activities }: { heading: string; activities: Activity[] }) {
  return <section className="schedule-card" aria-label={heading}>
    <h4>{heading}</h4>
    <ol className="schedule-list">{activities.map((activity, index) => <li key={`${activity.time}-${index}`}>
      <span className="schedule-time">{activity.time}</span>
      <div><h5>{activity.title}</h5>{activity.note && <p>{activity.note}</p>}</div>
    </li>)}</ol>
  </section>;
}

export default function TimetableView({content}:{content:TimetableContent}) {return (
    <main className="timetable-page">
      <header className="timetable-intro"><h1>{content.heading}</h1>
        <NurseryToggle label="Choose a nursery timetable" />
      </header>
      <NurseryView nursery="angel">
      <section id="angel" className="nursery-schedule" aria-labelledby="angel-title">
        <div className="timetable-nursery-heading"><h2 id="angel-title">Angel</h2><p className="timetable-address">98 Richmond Avenue, Islington</p></div>
        <h3 className="schedule-section-title">Opening hours & sessions</h3>
        <div className="schedule-grid"><Schedule heading="Opening hours" activities={content.schedules.angelOpeningHours} /><Schedule heading="Sessions" activities={content.schedules.angelSessions} /></div>
        <h3 className="schedule-section-title">Daily routine</h3>
        <p className="schedule-group-title">Two years to school age</p>
        <div className="schedule-grid"><Schedule heading="Morning" activities={content.schedules.preschoolMorning} /><Schedule heading="Afternoon" activities={content.schedules.preschoolAfternoon} /></div>
        <aside className="schedule-note"><h3>{content.outdoorsTitle}</h3><p>{content.outdoorsBody}</p></aside>
        <section id="term-dates" className="term-dates" aria-labelledby="term-title"><h2 id="term-title">Angel term dates</h2><div className="term-grid">{content.terms.angel.map(term => <TermCard key={term.start} term={term} />)}</div></section>
        {content.holidays["angel"].length > 0 && <section className="term-dates" aria-label="Holiday closures"><h2>Holiday closures</h2><div className="term-grid">{content.holidays["angel"].map(term => <TermCard key={term.start} term={term}/>)}</div></section>}
      </section>
      </NurseryView>
      <NurseryView nursery="abbey-road">
      <section id="abbey-road" className="nursery-schedule" aria-labelledby="abbey-road-title">
        <div className="timetable-nursery-heading"><h2 id="abbey-road-title">Abbey Road</h2><p className="timetable-address">Abbey Hive, 84–86 Abbey Road, London, NW8 0QA</p></div>
        <h3 className="schedule-section-title">Opening hours & sessions</h3>
        <div className="schedule-grid"><Schedule heading="Opening hours" activities={content.schedules.abbeyRoadOpeningHours} /><Schedule heading="Sessions" activities={content.schedules.abbeyRoadSessions} /></div>
        <h3 className="schedule-section-title">Daily routine</h3>
        <RoutinePicker groups={[
          { label: "From babies to two years (or walking)", content: <div className="schedule-grid"><Schedule heading="Morning" activities={content.schedules.abbeyRoadBabyMorning} /><Schedule heading="Afternoon" activities={content.schedules.abbeyRoadBabyAfternoon} /></div> },
          { label: "Two years to school age", content: <div className="schedule-grid"><Schedule heading="Morning" activities={content.schedules.preschoolMorning} /><Schedule heading="Afternoon" activities={content.schedules.preschoolAfternoon} /></div> },
        ]} />
        <section id="abbey-road-term-dates" className="term-dates" aria-labelledby="abbey-road-term-title"><h2 id="abbey-road-term-title">Abbey Road term dates</h2><div className="term-grid">{content.terms["abbey-road"].map(term => <TermCard key={term.start} term={term} />)}</div></section>
        {content.holidays["abbey-road"].length > 0 && <section className="term-dates" aria-label="Holiday closures"><h2>Holiday closures</h2><div className="term-grid">{content.holidays["abbey-road"].map(term => <TermCard key={term.start} term={term}/>)}</div></section>}
      </section>
      </NurseryView>
    </main>

);}
