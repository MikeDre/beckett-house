"use client";

import { useState } from "react";
import { useNurseryChoice } from "../nursery-choice";
import { abbeyRoadFees, extraDescriptions, money } from "../../lib/fees";

type Plan = "standard" | "funded15" | "funded30";

export default function FeeExplorer() {
  const [nursery, setNursery] = useNurseryChoice();
  const [age, setAge] = useState(2);
  const [plan, setPlan] = useState<Plan>("standard");
  const group = abbeyRoadFees[age];
  const rows = group[plan];
  return <section className="fee-explorer" aria-labelledby="explorer-title">
    <h2 id="explorer-title">Find your fees</h2>
    <div className="fee-switch" role="group" aria-label="Choose nursery">
      {([['angel', 'Angel'], ['abbey-road', 'Abbey Road']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={nursery === value} onClick={() => setNursery(value)}>{label}</button>)}
    </div>
    {nursery === "angel" ? <div className="nursery-fade">
      <h3>Angel session fees</h3>
      <table className="fee-table"><caption>Standard all-inclusive rates</caption><thead><tr><th scope="col">Session</th><th scope="col">Fee</th></tr></thead><tbody>
        <tr><th scope="row">Full-time week <span>Monday–Friday, 8am–6pm</span></th><td>£500 / week</td></tr>
        <tr><th scope="row">Full day <span>8am–6pm</span></th><td>£100 / day</td></tr>
        <tr><th scope="row">Morning <span>8am–2pm</span></th><td>£60 / session</td></tr>
        <tr><th scope="row">Afternoon <span>2pm–6pm</span></th><td>£40 / session</td></tr>
      </tbody></table>
      <h3>Optional extras for funded days</h3>
      <Extras amounts={[8.10, 3, 20]} />
      <p>Charges apply only to the funded part of your place and are itemised on invoices. Private days use the standard all-inclusive rate. Contact Angel for a personalised funded-hours fee breakdown.</p>
    </div> : <div className="nursery-fade">
      <h3>Abbey Road plans</h3>
      <div className="fee-controls"><label>Child’s age<select value={age} onChange={event => { const next = Number(event.target.value); setAge(next); if (next !== 2 && plan === "funded15") setPlan("standard"); }}>{abbeyRoadFees.map((entry, index) => <option key={entry.age} value={index}>{entry.age}</option>)}</select></label></div>
      <div className="fee-switch" role="group" aria-label="Choose fee plan">
        <button type="button" aria-pressed={plan === "standard"} onClick={() => setPlan("standard")}>Standard fees</button>
        {group.funded15 && <button type="button" aria-pressed={plan === "funded15"} onClick={() => setPlan("funded15")}>15 funded hours</button>}
        <button type="button" aria-pressed={plan === "funded30"} onClick={() => setPlan("funded30")}>30 funded hours</button>
      </div>
      <div aria-live="polite" aria-atomic="true">
        <table className="fee-table"><caption>{group.age} · {plan === "standard" ? "Standard fees" : plan === "funded15" ? "15 funded hours applied" : "30 funded hours applied"}</caption><thead><tr><th scope="col">Attendance per week</th><th scope="col">Monthly fee</th></tr></thead><tbody>{rows?.map((value, index) => <tr key={index}><th scope="row">{["3 days", "4 days", "Full time (5 days)"][index]}</th><td>{money(value)}</td></tr>)}</tbody></table>
        {plan !== "standard" && <><h3>Optional extras included in the funded fees above</h3><Extras amounts={group.extras} /></>}
      </div>
      <p className="fees-note">Monthly fees shown are the supplied published plan figures, not a personalised quote. Funding eligibility and attendance arrangements must be confirmed with the nursery. A 15-hour example was supplied only for ages 3 years+; contact the nursery for other eligible age groups.</p>
    </div>}
    <div className="fees-opt-out"><h3>Your choice on extras</h3><p>Optional meals, consumables and extra-curricular activities are not a condition of accessing funded childcare. You may provide a packed lunch, nappies and wipes. Children who do not join optional extra-curricular activities receive alternative enriched activities with nursery staff. Speak with the Nursery Manager to arrange an alternative.</p></div>
  </section>;
}

function Extras({ amounts }: { amounts: number[] }) {
  return <table className="fee-table"><caption>Additional charges per funded day</caption><thead><tr><th scope="col">Optional extra</th><th scope="col">Per funded day</th></tr></thead><tbody>{extraDescriptions.map((extra, index) => <tr key={extra.title}><th scope="row">{extra.title}<span>{extra.description}</span></th><td>{money(amounts[index])}</td></tr>)}</tbody></table>;
}
