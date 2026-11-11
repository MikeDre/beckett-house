import "server-only";
import { getHomepageRecord, saveHomepageDraft } from "./homepage-store";
import { getNurseryPageRecord, saveNurseryPageDraft } from "./nursery-page-store";
import { getFaqRecord, saveFaqDraft } from "./faq-store";
import { getAboutRecord, saveAboutDraft } from "./about-store";
export const historyPages = ["home","angel","abbey-road","faq","about"] as const;
export type HistoryPage = typeof historyPages[number];
export function getHistoryPage(db:D1Database,slug:HistoryPage) {
 return slug === "home" ? getHomepageRecord(db) : slug === "faq" ? getFaqRecord(db) : slug === "about" ? getAboutRecord(db) : getNurseryPageRecord(db,slug);
}
export async function getRevision(db:D1Database,slug:HistoryPage,version:number) {
 const row = await db.prepare("SELECT version, content, published_at, published_by FROM page_revisions WHERE page = ? AND version = ?").bind(slug,version).first<{version:number;content:string;published_at:string|null;published_by:string|null}>();
 if (row) return {...row,content:JSON.parse(row.content)};
 const record = await getHistoryPage(db,slug);
 if (record.version===0 && version===0) return {version:0,content:record.published,published_at:null,published_by:null};
 return null;
}
export function restoreRevision(db:D1Database,slug:HistoryPage,content:unknown,version:unknown,email:string,revision:number) {
 return slug === "home" ? saveHomepageDraft(db,content,version,email,`Restored ${slug} version ${revision} as a draft`) : slug === "faq" ? saveFaqDraft(db,content,version,email,`Restored ${slug} version ${revision} as a draft`) : slug === "about" ? saveAboutDraft(db,content,version,email,`Restored ${slug} version ${revision} as a draft`) : saveNurseryPageDraft(db,slug,content,version,email,`Restored ${slug} version ${revision} as a draft`);
}
