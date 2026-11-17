import {env} from "cloudflare:workers";
import SubmissionsPanel from "./submissions-panel";
import type { Metadata } from "next";
import AdminPanel from "./panel";
export const metadata: Metadata = { title: "Staff admin", robots: { index: false, follow: false } };
export default function AdminPage() { return (env as {SANITY_CONTENT_ENABLED?:string}).SANITY_CONTENT_ENABLED==="true" ? <SubmissionsPanel/> : <AdminPanel />; }
