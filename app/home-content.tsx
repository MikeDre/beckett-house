import { getAnnouncements } from "../lib/site-data";
import { getPublishedNurseryPage } from "../lib/nursery-page-store";
import NurseryHomeView from "./nursery-home-view";
export default async function NurseryHome() {
 const [content,announcements] = await Promise.all([getPublishedNurseryPage("angel"),getAnnouncements()]);
 return <NurseryHomeView slug="angel" content={content} announcements={announcements} />;
}
