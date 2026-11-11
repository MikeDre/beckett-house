import type { Metadata } from "next";
import HistoryPreview from "./preview";
export const metadata: Metadata = { title: "History draft preview", robots: { index: false, follow: false } };
export default function PreviewPage() { return <HistoryPreview />; }
