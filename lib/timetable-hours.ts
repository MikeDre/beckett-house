import type { FeesContent } from "./site-data";
import type { TimetableContent } from "./timetable-content";
// Opening information is shared with the fees page; routines and dates remain page content.
export function withTimetableHours(content:TimetableContent,fees:FeesContent):TimetableContent {
 const schedules={...content.schedules};
 for(const slug of ["angel","abbey-road"] as const) {
  const prefix=slug==="angel"?"angel":"abbeyRoad",sessions=fees.sessions[slug];
  schedules[`${prefix}OpeningHours`]=[{time:fees.openingHours.hours,title:fees.openingHours.days},{time:"Annual opening",title:fees.weeksOpen[slug]}];
  schedules[`${prefix}Sessions`]=[{time:sessions.morning,title:"Morning"},{time:sessions.afternoon,title:"Afternoon"},{time:sessions.fullDay,title:"Full day"}];
 }
 return {...content,schedules};
}
