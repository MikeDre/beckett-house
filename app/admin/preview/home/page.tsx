import type { Metadata } from "next";
import HomepagePreview from "./preview";
export const metadata: Metadata = { title: "Homepage draft preview", robots: { index: false, follow: false } };
export default function PreviewPage() { return <HomepagePreview />; }
