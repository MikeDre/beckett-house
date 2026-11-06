import "server-only";
import { env } from "cloudflare:workers";
import { defaultFaqContent, validateFaqContent, type FaqContent, type FaqRecord } from "./faq-content";

export const FAQ_SETTING_KEY = "page:faq";
export class FaqConflictError extends Error {}
export class FaqInputError extends Error {}
function defaultRecord(): FaqRecord {
  return { slug: "faq", title: "Frequently asked questions", path: "/faq", draft: null, published: structuredClone(defaultFaqContent), draftUpdatedAt: null, publishedAt: null, version: 0 };
}
function decode(raw: string): FaqRecord {
  const v = JSON.parse(raw);
  if (!v || v.slug !== "faq" || v.title !== "Frequently asked questions" || v.path !== "/faq" || !Number.isSafeInteger(v.version) || v.version < 1) throw new Error("Invalid saved FAQ record.");
  for (const key of ["draftUpdatedAt", "publishedAt"]) if (v[key] !== null && (typeof v[key] !== "string" || !Number.isFinite(Date.parse(v[key])))) throw new Error("Invalid FAQ timestamp.");
  return { slug: "faq", title: "Frequently asked questions", path: "/faq", draft: v.draft === null ? null : validateFaqContent(v.draft), published: validateFaqContent(v.published), draftUpdatedAt: v.draftUpdatedAt, publishedAt: v.publishedAt, version: v.version };
}
async function read(db: D1Database) {
  const row = await db.prepare("SELECT value FROM settings WHERE key = ?").bind(FAQ_SETTING_KEY).first<{ value: string }>();
  return { raw: row?.value ?? null, record: row ? decode(row.value) : defaultRecord() };
}
export async function getFaqRecord(db: D1Database): Promise<FaqRecord> { return (await read(db)).record; }
export async function getPublishedFaqContent(db?: D1Database): Promise<FaqContent> {
  try {
    const database = db ?? (env as { DB?: D1Database }).DB;
    if (database) return (await getFaqRecord(database)).published;
  } catch { /* Public pages remain available when storage is unavailable or corrupt. */ }
  return structuredClone(defaultFaqContent);
}
export async function saveFaqDraft(db: D1Database, content: unknown, version: unknown, email: string) {
  let validated: FaqContent;
  try { validated = validateFaqContent(content); } catch (error) { throw new FaqInputError((error as Error).message); }
  return mutate(db, version, email, validated);
}
export async function publishFaqDraft(db: D1Database, version: unknown, email: string) { return mutate(db, version, email); }
async function mutate(db: D1Database, version: unknown, email: string, content?: FaqContent): Promise<FaqRecord> {
  if (typeof version !== "number" || !Number.isSafeInteger(version) || version < 0 || version >= Number.MAX_SAFE_INTEGER) throw new FaqInputError("Supply a valid FAQ version.");
  const { raw, record } = await read(db);
  if (version !== record.version) throw new FaqConflictError("The FAQ has changed. Reload it before saving or publishing.");
  if (!content && !record.draft) throw new FaqInputError("Save a draft before publishing.");
  const now = new Date().toISOString();
  const next: FaqRecord = content
    ? { ...record, draft: content, draftUpdatedAt: now, version: version + 1 }
    : { ...record, published: record.draft!, publishedAt: now, version: version + 1 };
  // D1 batches are transactions. Compare the exact stored value so simultaneous
  // editors cannot overwrite each other, including the first save of an absent row.
  const write = raw === null
    ? db.prepare("INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO NOTHING").bind(FAQ_SETTING_KEY, JSON.stringify(next), now, email)
    : db.prepare("UPDATE settings SET value = ?, updated_at = ?, updated_by = ? WHERE key = ? AND value = ?").bind(JSON.stringify(next), now, email, FAQ_SETTING_KEY, raw);
  const results = await db.batch([write, db.prepare("INSERT INTO activity (at, user, action, summary) SELECT ?, ?, ?, ? WHERE changes() = 1").bind(now, email, content ? "draft" : "publish", content ? "FAQ draft saved" : "FAQ published")]);
  if (results.some(result => !result.success)) throw new Error("FAQ storage write failed.");
  if (results[0].meta.changes !== 1) throw new FaqConflictError("The FAQ has changed. Reload it before saving or publishing.");
  return next;
}
