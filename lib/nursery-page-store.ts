import "server-only";
import { env } from "cloudflare:workers";
import { defaultNurseryPages, validateNurseryPageContent, type NurseryPageContent, type NurseryPageRecord, type NurseryPageSlug } from "./nursery-pages";

const settingKey = (slug: NurseryPageSlug) => `page:${slug}`;
const title = (slug: NurseryPageSlug) => slug === "angel" ? "Angel" : "Abbey Road";
export class NurseryPageConflictError extends Error {}
export class NurseryPageInputError extends Error {}
function defaultRecord(slug: NurseryPageSlug): NurseryPageRecord {
  return { slug, title: title(slug), path: `/${slug}`, draft: null, published: structuredClone(defaultNurseryPages[slug]), draftUpdatedAt: null, publishedAt: null, version: 0 };
}
function decode(raw: string, slug: NurseryPageSlug): NurseryPageRecord {
  const v = JSON.parse(raw);
  if (!v || v.slug !== slug || v.title !== title(slug) || v.path !== `/${slug}` || !Number.isSafeInteger(v.version) || v.version < 1) throw new Error("Invalid saved nursery page record.");
  for (const key of ["draftUpdatedAt", "publishedAt"]) if (v[key] !== null && (typeof v[key] !== "string" || !Number.isFinite(Date.parse(v[key])))) throw new Error("Invalid nursery page timestamp.");
  return { slug, title: title(slug), path: `/${slug}`, draft: v.draft === null ? null : validateNurseryPageContent(v.draft), published: validateNurseryPageContent(v.published), draftUpdatedAt: v.draftUpdatedAt, publishedAt: v.publishedAt, version: v.version };
}
async function read(db: D1Database, slug: NurseryPageSlug) {
  const row = await db.prepare("SELECT value FROM settings WHERE key = ?").bind(settingKey(slug)).first<{ value: string }>();
  return { raw: row?.value ?? null, record: row ? decode(row.value, slug) : defaultRecord(slug) };
}
export async function getNurseryPageRecord(db: D1Database, slug: NurseryPageSlug): Promise<NurseryPageRecord> { return (await read(db, slug)).record; }
export async function getPublishedNurseryPage(slug: NurseryPageSlug, db?: D1Database): Promise<NurseryPageContent> {
  try {
    const database = db ?? (env as { DB?: D1Database }).DB;
    if (database) return (await getNurseryPageRecord(database, slug)).published;
  } catch { /* Public pages remain available when storage is unavailable or corrupt. */ }
  return structuredClone(defaultNurseryPages[slug]);
}
export async function saveNurseryPageDraft(db: D1Database, slug: NurseryPageSlug, content: unknown, version: unknown, email: string) {
  let validated: NurseryPageContent;
  try { validated = validateNurseryPageContent(content); } catch (error) { throw new NurseryPageInputError((error as Error).message); }
  return mutate(db, slug, version, email, validated);
}
export async function publishNurseryPageDraft(db: D1Database, slug: NurseryPageSlug, version: unknown, email: string) { return mutate(db, slug, version, email); }
async function mutate(db: D1Database, slug: NurseryPageSlug, version: unknown, email: string, content?: NurseryPageContent): Promise<NurseryPageRecord> {
  if (typeof version !== "number" || !Number.isSafeInteger(version) || version < 0 || version >= Number.MAX_SAFE_INTEGER) throw new NurseryPageInputError("Supply a valid nursery page version.");
  const { raw, record } = await read(db, slug);
  if (version !== record.version) throw new NurseryPageConflictError("The nursery page has changed. Reload it before saving or publishing.");
  if (!content && !record.draft) throw new NurseryPageInputError("Save a draft before publishing.");
  const now = new Date().toISOString();
  const next: NurseryPageRecord = content
    ? { ...record, draft: content, draftUpdatedAt: now, version: version + 1 }
    : { ...record, published: record.draft!, publishedAt: now, version: version + 1 };
  // D1 batches are transactions. Compare the exact stored value so simultaneous
  // editors cannot overwrite each other, including the first save of an absent row.
  const write = raw === null
    ? db.prepare("INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO NOTHING").bind(settingKey(slug), JSON.stringify(next), now, email)
    : db.prepare("UPDATE settings SET value = ?, updated_at = ?, updated_by = ? WHERE key = ? AND value = ?").bind(JSON.stringify(next), now, email, settingKey(slug), raw);
  const results = await db.batch([write, db.prepare("INSERT INTO activity (at, user, action, summary) SELECT ?, ?, ?, ? WHERE changes() = 1").bind(now, email, content ? "draft" : "publish", content ? `${title(slug)} draft saved` : `${title(slug)} published`)]);
  if (results.some(result => !result.success)) throw new Error("Nursery page storage write failed.");
  if (results[0].meta.changes !== 1) throw new NurseryPageConflictError("The nursery page has changed. Reload it before saving or publishing.");
  return next;
}
