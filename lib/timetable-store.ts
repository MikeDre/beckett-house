import "server-only";
import { env } from "cloudflare:workers";
import { defaultTimetableContent, validateTimetableContent, type TimetableContent, type TimetableRecord } from "./timetable-content";

export const TIMETABLE_SETTING_KEY = "page:timetable";
export class TimetableConflictError extends Error {}
export class TimetableInputError extends Error {}
function defaultRecord(): TimetableRecord {
  return { slug: "timetable", title: "Timetable and term dates", path: "/timetable", draft: null, published: structuredClone(defaultTimetableContent), draftUpdatedAt: null, publishedAt: null, version: 0 };
}
function decode(raw: string): TimetableRecord {
  const v = JSON.parse(raw);
  if (!v || v.slug !== "timetable" || v.title !== "Timetable and term dates" || v.path !== "/timetable" || !Number.isSafeInteger(v.version) || v.version < 1) throw new Error("Invalid saved TIMETABLE record.");
  for (const key of ["draftUpdatedAt", "publishedAt"]) if (v[key] !== null && (typeof v[key] !== "string" || !Number.isFinite(Date.parse(v[key])))) throw new Error("Invalid TIMETABLE timestamp.");
  return { slug: "timetable", title: "Timetable and term dates", path: "/timetable", draft: v.draft === null ? null : validateTimetableContent(v.draft), published: validateTimetableContent(v.published), draftUpdatedAt: v.draftUpdatedAt, publishedAt: v.publishedAt, version: v.version };
}
async function read(db: D1Database) {
  const row = await db.prepare("SELECT value FROM settings WHERE key = ?").bind(TIMETABLE_SETTING_KEY).first<{ value: string }>();
  return { raw: row?.value ?? null, record: row ? decode(row.value) : defaultRecord() };
}
export async function getTimetableRecord(db: D1Database): Promise<TimetableRecord> { return (await read(db)).record; }
export async function getPublishedTimetableContent(db?: D1Database): Promise<TimetableContent> {
  try {
    const database = db ?? (env as { DB?: D1Database }).DB;
    if (database) return (await getTimetableRecord(database)).published;
  } catch { /* Public pages remain available when storage is unavailable or corrupt. */ }
  return structuredClone(defaultTimetableContent);
}
export async function saveTimetableDraft(db: D1Database, content: unknown, version: unknown, email: string, summary?: string) {
  let validated: TimetableContent;
  try { validated = validateTimetableContent(content); } catch (error) { throw new TimetableInputError((error as Error).message); }
  return mutate(db, version, email, validated, summary);
}
export async function publishTimetableDraft(db: D1Database, version: unknown, email: string) { return mutate(db, version, email); }
async function mutate(db: D1Database, version: unknown, email: string, content?: TimetableContent, summary?: string): Promise<TimetableRecord> {
  if (typeof version !== "number" || !Number.isSafeInteger(version) || version < 0 || version >= Number.MAX_SAFE_INTEGER) throw new TimetableInputError("Supply a valid TIMETABLE version.");
  const { raw, record } = await read(db);
  if (version !== record.version) throw new TimetableConflictError("The TIMETABLE has changed. Reload it before saving or publishing.");
  if (!content && !record.draft) throw new TimetableInputError("Save a draft before publishing.");
  const now = new Date(!content && record.publishedAt ? Math.max(Date.now(), Date.parse(record.publishedAt) + 1) : Date.now()).toISOString();
  const next: TimetableRecord = content
    ? { ...record, draft: content, draftUpdatedAt: now, version: version + 1 }
    : { ...record, published: record.draft!, publishedAt: now, version: version + 1 };
  // D1 batches are transactions. Compare the exact stored value so simultaneous
  // editors cannot overwrite each other, including the first save of an absent row.
  const write = raw === null
    ? db.prepare("INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO NOTHING").bind(TIMETABLE_SETTING_KEY, JSON.stringify(next), now, email)
    : db.prepare("UPDATE settings SET value = ?, updated_at = ?, updated_by = ? WHERE key = ? AND value = ?").bind(JSON.stringify(next), now, email, TIMETABLE_SETTING_KEY, raw);
  const results = await db.batch([write, db.prepare("INSERT INTO activity (at, user, action, summary) SELECT ?, ?, ?, ? WHERE changes() = 1").bind(now, email, content ? "draft" : "publish", content ? (summary ?? "TIMETABLE draft saved") : "TIMETABLE published")]);
  if (results.some(result => !result.success)) throw new Error("TIMETABLE storage write failed.");
  if (results[0].meta.changes !== 1) throw new TimetableConflictError("The TIMETABLE has changed. Reload it before saving or publishing.");
  return next;
}
