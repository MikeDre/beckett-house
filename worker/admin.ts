import type { Env } from "./index";
import { getAllAnnouncements, getFeesContent, getNotificationSettings, emptyNotifications, validateAnnouncements, validateFees, validateNotifications } from "../lib/site-data";

export function adminJson(data: unknown, status = 200) { return Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } }); }
class InputError extends Error { constructor(message: string, public status = 400) { super(message); } }
async function body(request: Request) {
  if (request.headers.get("Origin") !== new URL(request.url).origin) throw new InputError("Origin must match this site.", 403);
  if (request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw new InputError("Send application/json.", 415);
  const reader = request.body?.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  if (reader) while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 200 * 1024) { await reader.cancel(); throw new InputError("Request exceeds 200 KB.", 413); } chunks.push(value); }
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new InputError("Invalid JSON."); }
}
export async function handleAdmin(request: Request, env: Env, email: string) {
  const url = new URL(request.url), path = url.pathname.replace(/\/$/, ""), method = request.method;
  try {
    const data = ["PUT", "PATCH", "DELETE", "POST"].includes(method) ? await body(request) : undefined;
    const activity = (action: string, summary: string) => env.DB.prepare("INSERT INTO activity (at, user, action, summary) VALUES (?, ?, ?, ?)").bind(new Date().toISOString(), email, action, summary);
    if (path === "/api/admin/me" && method === "GET") return adminJson({ email });
    const setting = path.match(/^\/api\/admin\/(announcements|fees|notifications)$/)?.[1];
    if (setting) {
      if (method === "GET") return adminJson(setting === "announcements" ? await getAllAnnouncements(env.DB) : setting === "fees" ? await getFeesContent(env.DB) : await getNotificationSettings(env.DB) ?? { copies: { ...emptyNotifications.copies, all: (env.FORM_BCC ?? "").split(",").map(value => value.trim()).filter(Boolean) } });
      if (method === "PUT") {
        let validated;
        try { validated = setting === "announcements" ? validateAnnouncements(data) : setting === "fees" ? validateFees(data) : validateNotifications(data); } catch (error) { throw new InputError((error as Error).message); }
        await env.DB.batch([env.DB.prepare("INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at, updated_by=excluded.updated_by").bind(setting, JSON.stringify(validated), new Date().toISOString(), email), activity("update", setting)]);
        return adminJson(validated);
      }
    }
    if (path === "/api/admin/activity" && method === "GET") return adminJson((await env.DB.prepare("SELECT * FROM activity ORDER BY id DESC LIMIT 100").all()).results);
    if (path === "/api/admin/submissions" && method === "GET") {
      const clauses: string[] = [], values: (string | number)[] = [];
      for (const [key, allowed] of Object.entries({ kind: ["visit", "register"], nursery: ["angel", "abbey-road"], status: ["new", "contacted", "archived"] })) { const value = url.searchParams.get(key); if (value) { if (!allowed.includes(value)) throw new InputError(`Invalid ${key}.`); clauses.push(`${key} = ?`); values.push(value); } }
      function integer(key: string, fallback: number, max: number) { const raw = url.searchParams.get(key); if (raw === null) return fallback; if (!/^\d+$/.test(raw) || Number(raw) > max) throw new InputError(`Invalid ${key}.`); return Number(raw); }
      const limit = integer("limit", 50, 100), offset = integer("offset", 0, 1000000);
      return adminJson((await env.DB.prepare(`SELECT id, created_at, kind, nursery, name, email, status FROM submissions${clauses.length ? ` WHERE ${clauses.join(" AND ")}` : ""} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`).bind(...values, limit, offset).all()).results);
    }
    const id = path.match(/^\/api\/admin\/submissions\/([1-9]\d*)$/)?.[1];
    if (id) {
      const row = await env.DB.prepare("SELECT * FROM submissions WHERE id = ?").bind(id).first<{ fields: string }>();
      if (!row) return adminJson({ error: "Submission not found." }, 404);
      if (method === "GET") return adminJson({ ...row, fields: JSON.parse(row.fields) });
      if (method === "PATCH") {
        if (!data || !["new", "contacted", "archived"].includes(data.status)) throw new InputError("Choose a valid status.");
        await env.DB.batch([env.DB.prepare("UPDATE submissions SET status = ? WHERE id = ?").bind(data.status, id), activity("status", `Submission ${id}: ${data.status}`)]);
        return adminJson({ ok: true });
      }
      if (method === "DELETE") { await env.DB.batch([env.DB.prepare("DELETE FROM submissions WHERE id = ?").bind(id), activity("delete", `Submission ${id}`)]); return adminJson({ ok: true }); }
    }
    return adminJson({ error: "Route or method not found." }, 404);
  } catch (error) {
    if (error instanceof InputError) return adminJson({ error: error.message }, error.status);
    console.error("Admin database operation failed:", error);
    return adminJson({ error: "Could not access admin storage. Please try again or check the database migration." }, 503);
  }
}
