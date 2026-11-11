import "server-only";
import { env } from "cloudflare:workers";
import { defaultAboutContent, validateAboutContent, type AboutContent, type AboutRecord } from "./about-content";

export const ABOUT_SETTING_KEY = "page:about";
export class AboutConflictError extends Error {}
export class AboutInputError extends Error {}
function defaultRecord(): AboutRecord {
  return { slug: "about", title: "About Beckett House", path: "/beckett-house", draft: null, published: structuredClone(defaultAboutContent), draftUpdatedAt: null, publishedAt: null, version: 0 };
}
function decode(raw: string): AboutRecord {
  const v = JSON.parse(raw);
  if (!v || v.slug !== "about" || v.title !== "About Beckett House" || v.path !== "/beckett-house" || !Number.isSafeInteger(v.version) || v.version < 1) throw new Error("Invalid saved ABOUT record.");
  for (const key of ["draftUpdatedAt", "publishedAt"]) if (v[key] !== null && (typeof v[key] !== "string" || !Number.isFinite(Date.parse(v[key])))) throw new Error("Invalid ABOUT timestamp.");
  return { slug: "about", title: "About Beckett House", path: "/beckett-house", draft: v.draft === null ? null : validateAboutContent(v.draft), published: validateAboutContent(v.published), draftUpdatedAt: v.draftUpdatedAt, publishedAt: v.publishedAt, version: v.version };
}
async function read(db: D1Database) {
  const row = await db.prepare("SELECT value FROM settings WHERE key = ?").bind(ABOUT_SETTING_KEY).first<{ value: string }>();
  return { raw: row?.value ?? null, record: row ? decode(row.value) : defaultRecord() };
}
export async function getAboutRecord(db: D1Database): Promise<AboutRecord> { return (await read(db)).record; }
export async function getPublishedAboutContent(db?: D1Database): Promise<AboutContent> {
  try {
    const database = db ?? (env as { DB?: D1Database }).DB;
    if (database) return (await getAboutRecord(database)).published;
  } catch { /* Public pages remain available when storage is unavailable or corrupt. */ }
  return structuredClone(defaultAboutContent);
}
export async function saveAboutDraft(db: D1Database, content: unknown, version: unknown, email: string, summary?: string) {
  let validated: AboutContent;
  try { validated = validateAboutContent(content); } catch (error) { throw new AboutInputError((error as Error).message); }
  return mutate(db, version, email, validated, summary);
}
export async function publishAboutDraft(db: D1Database, version: unknown, email: string) { return mutate(db, version, email); }
async function mutate(db: D1Database, version: unknown, email: string, content?: AboutContent, summary?: string): Promise<AboutRecord> {
  if (typeof version !== "number" || !Number.isSafeInteger(version) || version < 0 || version >= Number.MAX_SAFE_INTEGER) throw new AboutInputError("Supply a valid ABOUT version.");
  const { raw, record } = await read(db);
  if (version !== record.version) throw new AboutConflictError("The ABOUT has changed. Reload it before saving or publishing.");
  if (!content && !record.draft) throw new AboutInputError("Save a draft before publishing.");
  const now = new Date(!content && record.publishedAt ? Math.max(Date.now(), Date.parse(record.publishedAt) + 1) : Date.now()).toISOString();
  const next: AboutRecord = content
    ? { ...record, draft: content, draftUpdatedAt: now, version: version + 1 }
    : { ...record, published: record.draft!, publishedAt: now, version: version + 1 };
  // D1 batches are transactions. Compare the exact stored value so simultaneous
  // editors cannot overwrite each other, including the first save of an absent row.
  const write = raw === null
    ? db.prepare("INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO NOTHING").bind(ABOUT_SETTING_KEY, JSON.stringify(next), now, email)
    : db.prepare("UPDATE settings SET value = ?, updated_at = ?, updated_by = ? WHERE key = ? AND value = ?").bind(JSON.stringify(next), now, email, ABOUT_SETTING_KEY, raw);
  const results = await db.batch([write, db.prepare("INSERT INTO activity (at, user, action, summary) SELECT ?, ?, ?, ? WHERE changes() = 1").bind(now, email, content ? "draft" : "publish", content ? (summary ?? "ABOUT draft saved") : "ABOUT published")]);
  if (results.some(result => !result.success)) throw new Error("ABOUT storage write failed.");
  if (results[0].meta.changes !== 1) throw new AboutConflictError("The ABOUT has changed. Reload it before saving or publishing.");
  return next;
}
