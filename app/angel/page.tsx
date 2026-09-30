import type { Metadata } from "next";
import { DEFAULT_OPEN_GRAPH } from "../../lib/seo";
export { default } from "../home-content";

export const metadata: Metadata = {
  title: "Angel Nursery",
  alternates: { canonical: "/angel" },
  openGraph: { ...DEFAULT_OPEN_GRAPH, url: "/angel" },
};
