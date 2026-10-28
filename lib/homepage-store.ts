import "server-only";
import { env } from "cloudflare:workers";
import { defaultHomepageContent, validateHomepageContent, type HomePageContent, type HomePageRecord } from "./homepage-content";

export const HOMEPAGE_SETTING_KEY = "page:home";
export class HomepageConflictError extends Error {}
export class HomepageInputError extends Error {}
function defaultRecord(): HomePageRecord {
  return { slug: "home", title: "Homepage", path: "/", draft: null, published: structuredClone(defaultHomepageContent), draftUpdatedAt: null, publishedAt: null, version: 0 };
}
function decode(raw: string): HomePageRecord {
  const v = JSON.parse(raw);
  if (!v || v.slug !== "home" || v.title !== "Homepage" || v.path !== "/" || !Number.isSafeInteger(v.version) || v.version < 1) throw new Error("Invalid saved homepage record.");
  for (const key of ["draftUpdatedAt", "publishedAt"]) if (v[key] !== null && (typeof v[key] !== "string" || !Number.isFinite(Date.parse(v[key])))) throw new Error("Invalid homepage timestamp.");
  return { slug: "home", title: "Homepage", path: "/", draft: v.draft === null ? null : validateHomepageContent(v.draft), published: validateHomepageContent(v.published), draftUpdatedAt: v.draftUpdatedAt, publishedAt: v.publishedAt, version: v.version };
}
async function read(db: D1Database) {
  const row = await db.prepare("SELECT value FROM settings WHERE key = ?").bind(HOMEPAGE_SETTING_KEY).first<{ value: string }>();
  return { raw: row?.value ?? null, record: row ? decode(row.value) : defaultRecord() };
}
export async function getHomepageRecord(db: D1Database): Promise<HomePageRecord> { return (await read(db)).record; }
export async function getPublishedHomepageContent(db?: D1Database): Promise<HomePageContent> {
  try {
    const database = db ?? (env as { DB?: D1Database }).DB;
    if (database) return (await getHomepageRecord(database)).published;
  } catch { /* Public pages remain available when storage is unavailable or corrupt. */ }
  return structuredClone(defaultHomepageContent);
}
export async function saveHomepageDraft(db: D1Database, content: unknown, version: unknown, email: string) {
  let validated: HomePageContent;
  try { validated = validateHomepageContent(content); } catch (error) { throw new HomepageInputError((error as Error).message); }
  return mutate(db, version, email, validated);
}
export async function publishHomepageDraft(db: D1Database, version: unknown, email: string) { return mutate(db, version, email); }
async function mutate(db: D1Database, version: unknown, email: string, content?: HomePageContent): Promise<HomePageRecord> {
  if (typeof version !== "number" || !Number.isSafeInteger(version) || version < 0 || version >= Number.MAX_SAFE_INTEGER) throw new HomepageInputError("Supply a valid homepage version.");
  const { raw, record } = await read(db);
  if (version !== record.version) throw new HomepageConflictError("The homepage has changed. Reload it before saving or publishing.");
  if (!content && !record.draft) throw new HomepageInputError("Save a draft before publishing.");
  const now = new Date().toISOString();
  const next: HomePageRecord = content
    ? { ...record, draft: content, draftUpdatedAt: now, version: version + 1 }
    : { ...record, published: record.draft!, publishedAt: now, version: version + 1 };
  // D1 batches are transactions. Compare the exact stored value so simultaneous
  // editors cannot overwrite each other, including the first save of an absent row.
  const write = raw === null
    ? db.prepare("INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO NOTHING").bind(HOMEPAGE_SETTING_KEY, JSON.stringify(next), now, email)
    : db.prepare("UPDATE settings SET value = ?, updated_at = ?, updated_by = ? WHERE key = ? AND value = ?").bind(JSON.stringify(next), now, email, HOMEPAGE_SETTING_KEY, raw);
  const results = await db.batch([write, db.prepare("INSERT INTO activity (at, user, action, summary) SELECT ?, ?, ?, ? WHERE changes() = 1").bind(now, email, content ? "draft" : "publish", content ? "Homepage draft saved" : "Homepage published")]);
  if (results.some(result => !result.success)) throw new Error("Homepage storage write failed.");
  if (results[0].meta.changes !== 1) throw new HomepageConflictError("The homepage has changed. Reload it before saving or publishing.");
  return next;
}
