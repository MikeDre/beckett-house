import assert from "node:assert/strict";
import test from "node:test";
import { register } from "node:module";
import { DatabaseSync } from "node:sqlite";
import { readFile } from "node:fs/promises";

// Execute source modules without bundling server-only imports into client code.
register(`data:text/javascript,${encodeURIComponent(`
  import { readFile } from 'node:fs/promises';
  import ts from ${JSON.stringify(new URL('../node_modules/typescript/lib/typescript.js', import.meta.url).href)};
  export async function resolve(specifier, context, next) {
    if (specifier === 'server-only' || specifier === 'cloudflare:workers') return { url: 'data:text/javascript,export const env = {};', shortCircuit: true };
    if (specifier.startsWith('.') && !/\\.[a-z]+$/.test(specifier)) return next(specifier + '.ts', context);
    return next(specifier, context);
  }
  export async function load(url, context, next) {
    if (url.endsWith('.ts')) return { format: 'module', shortCircuit: true, source: ts.transpileModule(await readFile(new URL(url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText };
    return next(url, context);
  }
`)}`, import.meta.url);
const { defaultTimetableContent, validateTimetableContent } = await import('../lib/timetable-content.ts');
const { getTimetableRecord, getPublishedTimetableContent, TIMETABLE_SETTING_KEY } = await import('../lib/timetable-store.ts');
const { handleAdmin } = await import('../worker/admin.ts');
const schema = await readFile(new URL('../migrations/0001_admin.sql', import.meta.url), 'utf8');
function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(schema);
  const db = {
    prepare(sql) {
      return { bind(...values) { return {
        first: async () => sqlite.prepare(sql).get(...values) ?? null,
        execute: () => ({ success: true, meta: { changes: Number(sqlite.prepare(sql).run(...values).changes) } }),
      }; } };
    },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try { const results = statements.map(s => s.execute()); sqlite.exec('COMMIT'); return results; }
      catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
  return { db, sqlite };
}
function api(db, path = '/pages/timetable', method = 'GET', data) {
  return handleAdmin(new Request(`http://localhost/api/admin${path}`, { method, headers: { Origin: 'http://localhost', 'Content-Type': 'application/json' }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) }), { DB: db }, 'editor@example.invalid');
}


test('timetable defaults are preserved and date validation rejects invalid, reversed and overlapping periods',()=>{
 assert.deepEqual(validateTimetableContent(defaultTimetableContent),defaultTimetableContent);
 for(const mutate of [c=>c.terms.angel[0].start='2026-02-30',c=>c.terms.angel[0].end='2026-01-01',c=>c.terms.angel.push({...c.terms.angel[0]}),c=>c.terms.angel=[],c=>c.schedules.preschoolMorning=[],c=>c.schedules.preschoolMorning[0].title='<script>',c=>c.holidays.angel=[{title:'Closure',start:'2027-01-04',end:''}],c=>c.heading='']) {const c=structuredClone(defaultTimetableContent);mutate(c);assert.throws(()=>validateTimetableContent(c));}
 const c=structuredClone(defaultTimetableContent);c.terms.angel.reverse();assert.equal(validateTimetableContent(c).terms.angel[0].title,'Autumn term 2026');
 c.holidays.angel=[{title:'Christmas closure',start:'2026-12-21',end:'2027-01-01'}];assert.equal(validateTimetableContent(c).holidays.angel.length,1);assert.equal(validateTimetableContent(c).holidays['abbey-road'].length,0);
});
test('timetable edits remain private until published and stale edits conflict',async()=>{
 const {db,sqlite}=database();const c=structuredClone(defaultTimetableContent);c.heading='Our nursery routines';c.terms.angel[0].end='2026-12-17';
 assert.equal((await api(db,'/pages/timetable','PUT',{version:0,content:c})).status,200);
 assert.deepEqual(await getPublishedTimetableContent(db),defaultTimetableContent);
 assert.equal((await api(db,'/pages/timetable','PUT',{version:0,content:c})).status,409);
 assert.equal((await api(db,'/pages/timetable/publish','POST',{version:1})).status,200);
 assert.deepEqual(await getPublishedTimetableContent(db),c);
 assert.equal((await getTimetableRecord(db)).version,2);sqlite.close();
});

test('opening hours and session times come from one shared setting without changing routines or dates',async()=>{
 const {withTimetableHours}=await import('../lib/timetable-hours.ts');const {defaultFees}=await import('../lib/site-data.ts');
 const fees=structuredClone(defaultFees);fees.openingHours={days:'Monday to Thursday',hours:'8:30am–5:30pm'};fees.sessions.angel.morning='8:30am–12:30pm';fees.weeksOpen.angel='46 weeks';
 const before=structuredClone(defaultTimetableContent);const merged=withTimetableHours(before,fees);
 assert.deepEqual(merged.schedules.angelOpeningHours[0],{time:'8:30am–5:30pm',title:'Monday to Thursday'});assert.equal(merged.schedules.angelSessions[0].time,'8:30am–12:30pm');assert.equal(merged.schedules.angelOpeningHours[1].title,'46 weeks');
 assert.equal(merged.schedules.abbeyRoadSessions[0].time,defaultFees.sessions['abbey-road'].morning);assert.deepEqual(merged.terms,before.terms);assert.deepEqual(merged.schedules.preschoolMorning,before.schedules.preschoolMorning);assert.deepEqual(before,defaultTimetableContent);
});
