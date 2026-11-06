import type { Metadata } from "next";
import FaqPreview from "./preview";
export const metadata: Metadata = { title: "FAQ draft preview", robots: { index: false, follow: false } };
export default function PreviewPage() { return <FaqPreview />; }
