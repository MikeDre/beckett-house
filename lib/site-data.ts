import "server-only";
import { env } from "cloudflare:workers";
import { homeAnnouncements, type Announcement } from "./content";
import { angelFees, abbeyRoadFees } from "./fees";

export type FeesContent = typeof defaultFees;
export type Notifications = { copies: Record<"all" | "angel" | "abbey-road", string[]> };
export const defaultFees = {
  openingHours: { days: "Monday–Friday", hours: "8am–6pm" },
  sessions: { angel: { morning: "8am–1pm", afternoon: "1pm–6pm", fullDay: "8am–6pm" }, "abbey-road": { morning: "8am–1pm", afternoon: "1pm–6pm", fullDay: "8am–6pm" } },
  weeksOpen: { angel: "48 weeks a year, closed for two weeks in August and two weeks over Christmas.", "abbey-road": "50 weeks a year, closed for two weeks at Christmas." },
  registrationFee: 75, angelFees, abbeyRoadFees,
};
export const emptyNotifications: Notifications = { copies: { all: [], angel: [], "abbey-road": [] } };
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected an object.");
  return value as Record<string, unknown>;
}
function text(value: unknown, max = 2000): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error("Please complete text fields within their length limits.");
  return value.trim();
}
function number(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1000000) throw new Error("Enter a number between 0 and 1,000,000.");
  return value;
}
function date(value: unknown): string {
  const result = text(value, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || !Number.isFinite(Date.parse(result)) || new Date(result).toISOString().slice(0, 10) !== result) throw new Error("Enter a valid date.");
  return result;
}
export function validateAnnouncements(value: unknown): Announcement[] {
  if (!Array.isArray(value) || value.length > 100) throw new Error("Use at most 100 announcements.");
  const ids = new Set<string>();
  return value.map(raw => {
    const v = object(raw);
    const item: Announcement = { id: text(v.id, 100), category: text(v.category, 200), title: text(v.title, 300), published: v.published === undefined ? true : v.published as boolean };
    if (typeof item.published !== "boolean" || ids.has(item.id) || !/^[\w-]+$/.test(item.id)) throw new Error("Announcement IDs must be unique letters, numbers or hyphens; published must be a boolean.");
    ids.add(item.id);
    for (const key of ["summary", "dateLabel", "href", "linkLabel"] as const) if (v[key] !== undefined && v[key] !== "") item[key] = text(v[key]);
    if (item.href && !/^(\/(?!\/)|https:\/\/)/.test(item.href)) throw new Error("Links must start with / or https://.");
    for (const key of ["date", "showFrom", "showUntil"] as const) if (v[key] !== undefined && v[key] !== "") item[key] = date(v[key]);
    if (item.showFrom && item.showUntil && item.showFrom > item.showUntil) throw new Error("Show until must follow show from.");
    if (v.image) {
      const image = object(v.image);
      const src = text(image.src);
      if (!/^\/images\/[\w/-]+\.(webp|jpe?g|png|avif)$/i.test(src) || src.includes("..")) throw new Error("Choose an image path under /images/.");
      item.image = { src, alt: text(image.alt, 500), width: number(image.width), height: number(image.height) };
      if (!item.image.width || !item.image.height || !Number.isInteger(item.image.width) || !Number.isInteger(item.image.height)) throw new Error("Image dimensions must be positive whole numbers.");
    }
    return item;
  });
}
export function validateFees(value: unknown): FeesContent {
  const v = object(value), hours = object(v.openingHours), sessions = object(v.sessions), weeks = object(v.weeksOpen);
  function session(slug: string) { const s = object(sessions[slug]); return { morning: text(s.morning, 100), afternoon: text(s.afternoon, 100), fullDay: text(s.fullDay, 100) }; }
  function groups(raw: unknown) {
    if (!Array.isArray(raw) || !raw.length || raw.length > 20) throw new Error("Supply 1–20 fee groups.");
    return raw.map(rawGroup => {
      const g = object(rawGroup);
      function amounts(key: string) { if (!Array.isArray(g[key]) || g[key].length !== 3) throw new Error("Each fee row needs three amounts."); return g[key].map(number); }
      return { age: text(g.age, 100), standard: amounts("standard"), funded30: amounts("funded30"), funded15: g.funded15 === null ? null : amounts("funded15"), extras: amounts("extras") };
    });
  }
  return { openingHours: { days: text(hours.days, 100), hours: text(hours.hours, 100) }, sessions: { angel: session("angel"), "abbey-road": session("abbey-road") }, weeksOpen: { angel: text(weeks.angel), "abbey-road": text(weeks["abbey-road"]) }, registrationFee: number(v.registrationFee), angelFees: groups(v.angelFees), abbeyRoadFees: groups(v.abbeyRoadFees) as typeof abbeyRoadFees };
}
export function validateNotifications(value: unknown): Notifications {
  const copies = object(object(value).copies);
  function list(key: string) {
    const raw = copies[key];
    if (!Array.isArray(raw) || raw.length > 20) throw new Error("Use at most 20 email addresses per list.");
    return [...new Set(raw.map(value => { const email = text(value, 254).toLowerCase(); if (!/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(email)) throw new Error("Enter valid email addresses."); return email; }))];
  }
  return { copies: { all: list("all"), angel: list("angel"), "abbey-road": list("abbey-road") } };
}
export async function readSetting<T>(key: string, validate: (value: unknown) => T, db?: D1Database): Promise<T | null> {
  try { const row = await (db ?? (env as { DB?: D1Database }).DB)?.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first<{ value: string }>(); return row ? validate(JSON.parse(row.value)) : null; } catch { return null; }
}
export async function getAllAnnouncements(db?: D1Database) { return await readSetting("announcements", validateAnnouncements, db) ?? homeAnnouncements; }
export async function getAnnouncements(now = new Date(), db?: D1Database) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return (await getAllAnnouncements(db)).filter(item => item.published !== false && (!item.showFrom || item.showFrom <= today) && (!item.showUntil || item.showUntil >= today));
}
export async function getFeesContent(db?: D1Database) { return await readSetting("fees", validateFees, db) ?? defaultFees; }
export async function getNotificationSettings(db?: D1Database) { return readSetting("notifications", validateNotifications, db); }
