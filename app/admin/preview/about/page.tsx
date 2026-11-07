import type { Metadata } from "next";
import AboutPreview from "./preview";
export const metadata: Metadata = { title: "About draft preview", robots: { index: false, follow: false } };
export default function PreviewPage() { return <AboutPreview />; }
