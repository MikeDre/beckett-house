import {writeFile} from 'node:fs/promises';
import {defaultHomepageContent} from '../../lib/homepage-content.ts';
import {defaultNurseryPages} from '../../lib/nursery-pages.ts';
import {defaultFaqContent} from '../../lib/faq-content.ts';
import {defaultAboutContent} from '../../lib/about-content.ts';
import {defaultHistoryContent} from '../../lib/history-content.ts';
import {defaultTimetableContent} from '../../lib/timetable-content.ts';
import {defaultFees} from '../../lib/site-data.ts';
import {homeAnnouncements} from '../../lib/content.ts';
const pages=[
 ['home','Homepage','/',defaultHomepageContent],
 ['angel','Angel','/angel',defaultNurseryPages.angel],
 ['abbey-road','Abbey Road','/abbey-road',defaultNurseryPages['abbey-road']],
 ['faq','Frequently asked questions','/faq',defaultFaqContent],
 ['about','About Beckett House','/beckett-house',defaultAboutContent],
 ['history','Our history','/history',defaultHistoryContent],
 ['timetable','Timetable and term dates','/timetable',defaultTimetableContent],
 ['fees','Fees and opening hours','/opening-hours-fees',defaultFees],
 ['announcements','Nursery announcements','/angel',{items:homeAnnouncements}],
];
await writeFile('lib/sanity/content-model.json',JSON.stringify(pages.map(([slug,title,path,content])=>({slug,title,path,content})),null,2)+'\n');
console.log(`Inventoried ${pages.length} content documents.`);
