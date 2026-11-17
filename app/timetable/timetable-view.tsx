
import {CmsField,CmsRegion} from "../cms-content";
import { NurseryToggle, NurseryView } from "../nursery-toggle";
import { RoutinePicker } from "./routine-picker";
import type { Activity, Term, TimetableContent } from "../../lib/timetable-content";
const termWeekday = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });
const termDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
// "Mon 27 April" / "Fri 14 August 2026": built by hand because en-GB adds a comma after the weekday.
const termDay = (iso: string, withYear = false) => { const date = new Date(iso); if(!Number.isFinite(date.getTime())) return "Date to be confirmed"; return `${termWeekday.format(date)} ${termDate.format(date)}${withYear ? ` ${date.getUTCFullYear()}` : ""}`; };

function TermCard({ term,field }: { term: Term;field:string }) {
  return <CmsRegion as="article" page="timetable" field={field} className="term-card"><h3>{term.title}</h3><p>
    <time dateTime={term.start}>{termDay(term.start)}</time>
    <span className="term-card-arrow" aria-hidden="true"> → </span><span className="visually-hidden"> to </span>
    <time dateTime={term.end}>{termDay(term.end, true)}</time>
  </p></CmsRegion>;
}

function Schedule({ heading, activities, field }: { heading: string; activities: Activity[];field:string }) {
  return <CmsRegion as="section" page="timetable" field={field} className="schedule-card" aria-label={heading}>
    <h4>{heading}</h4>
    <ol className="schedule-list">{activities.map((activity, index) => <li key={`${activity.time}-${index}`}>
      <span className="schedule-time">{activity.time}</span>
      <div><h5>{activity.title}</h5>{activity.note && <p>{activity.note}</p>}</div>
    </li>)}</ol>
  </CmsRegion>;
}

export default function TimetableView({content}:{content:TimetableContent}) {return (
    <main className="timetable-page">
      <header className="timetable-intro"><h1><CmsField page={"timetable"} field="heading">{content.heading}</CmsField></h1>
        <NurseryToggle label="Choose a nursery timetable" />
      </header>
      <NurseryView nursery="angel">
      <section id="angel" className="nursery-schedule" aria-labelledby="angel-title">
        <div className="timetable-nursery-heading"><h2 id="angel-title">Angel</h2><p className="timetable-address">98 Richmond Avenue, Islington</p></div>
        <h3 className="schedule-section-title">Opening hours & sessions</h3>
        <div className="schedule-grid"><Schedule heading="Opening hours" field="schedules.angelOpeningHours" activities={content.schedules.angelOpeningHours} /><Schedule heading="Sessions" field="schedules.angelSessions" activities={content.schedules.angelSessions} /></div>
        <h3 className="schedule-section-title">Daily routine</h3>
        <p className="schedule-group-title">Two years to school age</p>
        <div className="schedule-grid"><Schedule heading="Morning" field="schedules.preschoolMorning" activities={content.schedules.preschoolMorning} /><Schedule heading="Afternoon" field="schedules.preschoolAfternoon" activities={content.schedules.preschoolAfternoon} /></div>
        <aside className="schedule-note"><h3><CmsField page={"timetable"} field="outdoorsTitle">{content.outdoorsTitle}</CmsField></h3><p><CmsField page={"timetable"} field="outdoorsBody">{content.outdoorsBody}</CmsField></p></aside>
        <section id="term-dates" className="term-dates" aria-labelledby="term-title"><h2 id="term-title">Angel term dates</h2><div className="term-grid">{content.terms.angel.map(term => <TermCard key={term.start} field={`terms.angel[${content.terms.angel.indexOf(term)}]`} term={term} />)}</div></section>
        {content.holidays["angel"].length > 0 && <section className="term-dates" aria-label="Holiday closures"><h2>Holiday closures</h2><div className="term-grid">{content.holidays["angel"].map(term => <TermCard key={term.start} field={`holidays.angel[${content.holidays["angel"].indexOf(term)}]`} term={term}/>)}</div></section>}
      </section>
      </NurseryView>
      <NurseryView nursery="abbey-road">
      <section id="abbey-road" className="nursery-schedule" aria-labelledby="abbey-road-title">
        <div className="timetable-nursery-heading"><h2 id="abbey-road-title">Abbey Road</h2><p className="timetable-address">Abbey Hive, 84–86 Abbey Road, London, NW8 0QA</p></div>
        <h3 className="schedule-section-title">Opening hours & sessions</h3>
        <div className="schedule-grid"><Schedule heading="Opening hours" field="schedules.abbeyRoadOpeningHours" activities={content.schedules.abbeyRoadOpeningHours} /><Schedule heading="Sessions" field="schedules.abbeyRoadSessions" activities={content.schedules.abbeyRoadSessions} /></div>
        <h3 className="schedule-section-title">Daily routine</h3>
        <RoutinePicker groups={[
          { label: "From babies to two years (or walking)", content: <div className="schedule-grid"><Schedule heading="Morning" field="schedules.abbeyRoadBabyMorning" activities={content.schedules.abbeyRoadBabyMorning} /><Schedule heading="Afternoon" field="schedules.abbeyRoadBabyAfternoon" activities={content.schedules.abbeyRoadBabyAfternoon} /></div> },
          { label: "Two years to school age", content: <div className="schedule-grid"><Schedule heading="Morning" field="schedules.preschoolMorning" activities={content.schedules.preschoolMorning} /><Schedule heading="Afternoon" field="schedules.preschoolAfternoon" activities={content.schedules.preschoolAfternoon} /></div> },
        ]} />
        <section id="abbey-road-term-dates" className="term-dates" aria-labelledby="abbey-road-term-title"><h2 id="abbey-road-term-title">Abbey Road term dates</h2><div className="term-grid">{content.terms["abbey-road"].map(term => <TermCard key={term.start} field={`terms.abbey-road[${content.terms["abbey-road"].indexOf(term)}]`} term={term} />)}</div></section>
        {content.holidays["abbey-road"].length > 0 && <section className="term-dates" aria-label="Holiday closures"><h2>Holiday closures</h2><div className="term-grid">{content.holidays["abbey-road"].map(term => <TermCard key={term.start} field={`holidays.abbey-road[${content.holidays["abbey-road"].indexOf(term)}]`} term={term}/>)}</div></section>}
      </section>
      </NurseryView>
    </main>

);}
