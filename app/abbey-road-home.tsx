import {getCmsLocations} from "../lib/sanity/locations";
import { getAnnouncements } from "../lib/site-data";
import { getPublishedNurseryPage } from "../lib/nursery-page-store";
import NurseryHomeView from "./nursery-home-view";
export default async function NurseryHome() {
 const [content,announcements,locations] = await Promise.all([getPublishedNurseryPage("abbey-road"),getAnnouncements(),getCmsLocations()]);
 return <NurseryHomeView slug="abbey-road" content={content} locations={locations} announcements={announcements} />;
}
