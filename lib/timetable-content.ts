export type Activity = {time:string;title:string;note?:string};
export type Term = {title:string;start:string;end:string};
export type TimetableContent = {seoTitle:string;seoDescription:string;heading:string;schedules:Record<string,Activity[]>;terms:Record<"angel"|"abbey-road",Term[]>;holidays:Record<"angel"|"abbey-road",Term[]>;outdoorsTitle:string;outdoorsBody:string};
export type TimetableRecord = {slug:"timetable";title:"Timetable and term dates";path:"/timetable";draft:TimetableContent|null;published:TimetableContent;draftUpdatedAt:string|null;publishedAt:string|null;version:number};
export const defaultTimetableContent:TimetableContent = {
  "seoTitle": "Timetable & Term Dates",
  "seoDescription": "Daily timetable, session times and term dates for Beckett House Montessori nurseries in Angel and Abbey Road.",
  "heading": "Timetable & term dates",
  "schedules": {
    "preschoolMorning": [
      {
        "time": "8:00am",
        "title": "Arrival time for the children"
      },
      {
        "time": "8:00–8:45am",
        "title": "Breakfast time and free play"
      },
      {
        "time": "8:45–9:00am",
        "title": "Welcome circle time"
      },
      {
        "time": "9:00–10:30am",
        "title": "Montessori work cycle"
      },
      {
        "time": "9:30–10:15am",
        "title": "Free-flow snack time"
      },
      {
        "time": "10:00–10:30am",
        "title": "Arts and crafts or messy activities"
      },
      {
        "time": "10:30–11:15am",
        "title": "Outside play with outdoor activities"
      },
      {
        "time": "11:30am–12:00pm",
        "title": "Circle time or group activity",
        "note": "Topical and extra-curricular activities, then handwashing for lunch."
      },
      {
        "time": "12:00–12:30pm",
        "title": "Lunch"
      },
      {
        "time": "12:30–1:30pm",
        "title": "Outside play, activities and rest time for all-day children",
        "note": "The school provides mattresses, pillows and blankets."
      }
    ],
    "preschoolAfternoon": [
      {
        "time": "1:00pm",
        "title": "Collection and arrival time"
      },
      {
        "time": "1:30–1:45pm",
        "title": "Welcome circle time"
      },
      {
        "time": "1:45–3:15pm",
        "title": "Montessori work cycle"
      },
      {
        "time": "2:00–2:30pm",
        "title": "Free-flow snack time"
      },
      {
        "time": "3:15–4:00pm",
        "title": "Outside play with outdoor activities"
      },
      {
        "time": "4:00–4:30pm",
        "title": "Teatime"
      },
      {
        "time": "4:30–5:15pm",
        "title": "Key group time",
        "note": "Activities, outside play or physical activity."
      },
      {
        "time": "5:30–6:00pm",
        "title": "Music & Story Time"
      },
      {
        "time": "6:00pm",
        "title": "Collection time for the children"
      }
    ],
    "angelOpeningHours": [
      {
        "time": "8am–6pm",
        "title": "Monday–Friday"
      },
      {
        "time": "48 weeks",
        "title": "Open 48 weeks a year",
        "note": "Closed for two weeks in August and two weeks at Christmas."
      }
    ],
    "angelSessions": [
      {
        "time": "8am–1pm",
        "title": "Morning"
      },
      {
        "time": "1pm–6pm",
        "title": "Afternoon"
      },
      {
        "time": "8am–6pm",
        "title": "Full day"
      }
    ],
    "abbeyRoadBabyMorning": [
      {
        "time": "8:00–8:45am",
        "title": "Drop-off, bottles and breakfast"
      },
      {
        "time": "8:45–9:15am",
        "title": "Nappy change"
      },
      {
        "time": "9:15–9:30am",
        "title": "Welcome circle time"
      },
      {
        "time": "9:30–10:15am",
        "title": "Outside play with outdoor activities"
      },
      {
        "time": "10:15–10:30am",
        "title": "Bottles and morning snack"
      },
      {
        "time": "10:30–10:45am",
        "title": "Nappy check",
        "note": "Changes where needed. Children with individual nap times follow their own routine."
      },
      {
        "time": "10:45–11:30am",
        "title": "Key groups, messy play or art activities"
      },
      {
        "time": "11:30am–12:00pm",
        "title": "Nappy change"
      },
      {
        "time": "11:30am–12:00pm",
        "title": "Group circle time and action rhymes",
        "note": "Books, songs, puppets and finger plays."
      },
      {
        "time": "12:00–12:30pm",
        "title": "Lunch and bottle time"
      },
      {
        "time": "12:30–2:00pm",
        "title": "Sleep time for all-day children"
      }
    ],
    "abbeyRoadBabyAfternoon": [
      {
        "time": "1:00pm",
        "title": "Collection and arrival time for morning and afternoon children"
      },
      {
        "time": "1:15–2:00pm",
        "title": "Key groups, messy play or art activities"
      },
      {
        "time": "2:00–2:30pm",
        "title": "Bottles and snack"
      },
      {
        "time": "2:30–2:45pm",
        "title": "Nappy change"
      },
      {
        "time": "2:45–3:15pm",
        "title": "Outside play and gross motor activities",
        "note": "Children with individual nap times follow their own routine."
      },
      {
        "time": "3:15–4:00pm",
        "title": "Key groups: sensory or art activities"
      },
      {
        "time": "4:00–4:30pm",
        "title": "Teatime"
      },
      {
        "time": "4:30–5:00pm",
        "title": "Nappy change"
      },
      {
        "time": "5:00–5:30pm",
        "title": "Individual play time"
      },
      {
        "time": "5:40–6:00pm",
        "title": "Circle time, music, action rhymes and story time"
      },
      {
        "time": "6:00pm",
        "title": "All children collected"
      }
    ],
    "abbeyRoadOpeningHours": [
      {
        "time": "8am–6pm",
        "title": "Monday–Friday"
      },
      {
        "time": "50 weeks",
        "title": "Open 50 weeks a year",
        "note": "Closed for two weeks at Christmas."
      }
    ],
    "abbeyRoadSessions": [
      {
        "time": "8am–1pm",
        "title": "Morning"
      },
      {
        "time": "1pm–6pm",
        "title": "Afternoon"
      },
      {
        "time": "8am–6pm",
        "title": "Full day"
      }
    ]
  },
  "terms": {
    "angel": [
      {
        "title": "Autumn term 2026",
        "start": "2026-09-01",
        "end": "2026-12-18"
      },
      {
        "title": "Spring term 2027",
        "start": "2027-01-04",
        "end": "2027-04-23"
      },
      {
        "title": "Summer term 2027",
        "start": "2027-04-26",
        "end": "2027-08-13"
      }
    ],
    "abbey-road": [
      {
        "title": "Autumn term 2026",
        "start": "2026-08-31",
        "end": "2026-12-18"
      },
      {
        "title": "Spring term 2027",
        "start": "2027-01-04",
        "end": "2027-04-23"
      }
    ]
  },
  "holidays": {
    "angel": [],
    "abbey-road": []
  },
  "outdoorsTitle": "Time outdoors",
  "outdoorsBody": "As the school does not have its own playground or large garden, every effort is made to visit the local Islington parks as often as possible, such as Lonsdale Square and Barnard Park. Most of these have play areas that are protected by wardens."
};
function object(value:unknown):Record<string,unknown> {if(!value || typeof value!=="object" || Array.isArray(value))throw new Error("Invalid timetable content.");return value as Record<string,unknown>;}
function text(value:unknown,label:string,max:number,optional=false):string {if(typeof value!=="string" || (!optional && !value.trim()) || value.length>max || /[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value))throw new Error(`${label} must be plain text, up to ${max} characters.`);return value.trim();}
function date(value:unknown):string {if(typeof value!=="string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value<'2000-01-01' || value>'2100-12-31' || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10)!==value)throw new Error("Enter a valid date between 2000 and 2100.");return value;}
function dates(value:unknown,holiday=false):Term[] {
 if(!Array.isArray(value) || value.length<(holiday?0:1) || value.length>30)throw new Error(holiday?"Use up to 30 holiday periods per nursery.":"Use between 1 and 30 terms per nursery.");
 const rows=value.map(raw=>{const v=object(raw),start=date(v.start),end=date(v.end);if(start>end)throw new Error("An end date must be on or after its start date.");return {title:text(v.title,"Date period name",150),start,end};});
 const ordered=[...rows].sort((a,b)=>a.start.localeCompare(b.start));
 if(ordered.some((row,index)=>index>0 && row.start<=ordered[index-1].end))throw new Error(holiday?"Holiday periods must not overlap.":"Term dates must not overlap.");
 return ordered;
}
export function validateTimetableContent(value:unknown):TimetableContent {
 const v=object(value),source=object(v.schedules),schedules:Record<string,Activity[]>={};
 for(const key of Object.keys(defaultTimetableContent.schedules)) {
  const rows=source[key];if(!Array.isArray(rows)||!rows.length||rows.length>30)throw new Error("Each timetable section needs between 1 and 30 activities.");
  schedules[key]=rows.map(raw=>{const row=object(raw);return {time:text(row.time,"Time",100),title:text(row.title,"Activity",250),...(row.note!==undefined?{note:text(row.note,"Activity note",1000,true)}:{})};});
 }
 const terms=object(v.terms),holidays=object(v.holidays);
 const result:TimetableContent={seoTitle:text(v.seoTitle,"Search title",200),seoDescription:text(v.seoDescription,"Search description",500),heading:text(v.heading,"Page heading",300),schedules,terms:{angel:dates(terms.angel),"abbey-road":dates(terms["abbey-road"])},holidays:{angel:dates(holidays.angel,true),"abbey-road":dates(holidays["abbey-road"],true)},outdoorsTitle:text(v.outdoorsTitle,"Outdoors heading",200),outdoorsBody:text(v.outdoorsBody,"Outdoors note",4000)};
 if(JSON.stringify(result).length>180000)throw new Error("The timetable is too long. Shorten the activity notes.");return result;
}
