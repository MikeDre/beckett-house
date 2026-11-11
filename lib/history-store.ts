import "server-only";
import { env } from "cloudflare:workers";
import { defaultHistoryContent, validateHistoryContent, type HistoryContent, type HistoryRecord } from "./history-content";

export const HISTORY_SETTING_KEY = "page:history";
export class HistoryConflictError extends Error {}
export class HistoryInputError extends Error {}
function defaultRecord(): HistoryRecord {
  return { slug: "history", title: "Our history", path: "/history", draft: null, published: structuredClone(defaultHistoryContent), draftUpdatedAt: null, publishedAt: null, version: 0 };
}
function decode(raw: string): HistoryRecord {
  const v = JSON.parse(raw);
  if (!v || v.slug !== "history" || v.title !== "Our history" || v.path !== "/history" || !Number.isSafeInteger(v.version) || v.version < 1) throw new Error("Invalid saved HISTORY record.");
  for (const key of ["draftUpdatedAt", "publishedAt"]) if (v[key] !== null && (typeof v[key] !== "string" || !Number.isFinite(Date.parse(v[key])))) throw new Error("Invalid HISTORY timestamp.");
  return { slug: "history", title: "Our history", path: "/history", draft: v.draft === null ? null : validateHistoryContent(v.draft), published: validateHistoryContent(v.published), draftUpdatedAt: v.draftUpdatedAt, publishedAt: v.publishedAt, version: v.version };
}
async function read(db: D1Database) {
  const row = await db.prepare("SELECT value FROM settings WHERE key = ?").bind(HISTORY_SETTING_KEY).first<{ value: string }>();
  return { raw: row?.value ?? null, record: row ? decode(row.value) : defaultRecord() };
}
export async function getHistoryRecord(db: D1Database): Promise<HistoryRecord> { return (await read(db)).record; }
export async function getPublishedHistoryContent(db?: D1Database): Promise<HistoryContent> {
  try {
    const database = db ?? (env as { DB?: D1Database }).DB;
    if (database) return (await getHistoryRecord(database)).published;
  } catch { /* Public pages remain available when storage is unavailable or corrupt. */ }
  return structuredClone(defaultHistoryContent);
}
export async function saveHistoryDraft(db: D1Database, content: unknown, version: unknown, email: string, summary?: string) {
  let validated: HistoryContent;
  try { validated = validateHistoryContent(content); } catch (error) { throw new HistoryInputError((error as Error).message); }
  return mutate(db, version, email, validated, summary);
}
export async function publishHistoryDraft(db: D1Database, version: unknown, email: string) { return mutate(db, version, email); }
async function mutate(db: D1Database, version: unknown, email: string, content?: HistoryContent, summary?: string): Promise<HistoryRecord> {
  if (typeof version !== "number" || !Number.isSafeInteger(version) || version < 0 || version >= Number.MAX_SAFE_INTEGER) throw new HistoryInputError("Supply a valid HISTORY version.");
  const { raw, record } = await read(db);
  if (version !== record.version) throw new HistoryConflictError("The HISTORY has changed. Reload it before saving or publishing.");
  if (!content && !record.draft) throw new HistoryInputError("Save a draft before publishing.");
  const now = new Date(!content && record.publishedAt ? Math.max(Date.now(), Date.parse(record.publishedAt) + 1) : Date.now()).toISOString();
  const next: HistoryRecord = content
    ? { ...record, draft: content, draftUpdatedAt: now, version: version + 1 }
    : { ...record, published: record.draft!, publishedAt: now, version: version + 1 };
  // D1 batches are transactions. Compare the exact stored value so simultaneous
  // editors cannot overwrite each other, including the first save of an absent row.
  const write = raw === null
    ? db.prepare("INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO NOTHING").bind(HISTORY_SETTING_KEY, JSON.stringify(next), now, email)
    : db.prepare("UPDATE settings SET value = ?, updated_at = ?, updated_by = ? WHERE key = ? AND value = ?").bind(JSON.stringify(next), now, email, HISTORY_SETTING_KEY, raw);
  const results = await db.batch([write, db.prepare("INSERT INTO activity (at, user, action, summary) SELECT ?, ?, ?, ? WHERE changes() = 1").bind(now, email, content ? "draft" : "publish", content ? (summary ?? "HISTORY draft saved") : "HISTORY published")]);
  if (results.some(result => !result.success)) throw new Error("HISTORY storage write failed.");
  if (results[0].meta.changes !== 1) throw new HistoryConflictError("The HISTORY has changed. Reload it before saving or publishing.");
  return next;
}
