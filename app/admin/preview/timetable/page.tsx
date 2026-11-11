import type { Metadata } from "next";
import TimetablePreview from "./preview";
export const metadata: Metadata = { title: "Timetable draft preview", robots: { index: false, follow: false } };
export default function PreviewPage() { return <TimetablePreview />; }
