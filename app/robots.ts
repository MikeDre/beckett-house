import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: ["/admin", "/api/"] },
      { userAgent: "ChatGPT-User", allow: "/", disallow: ["/admin", "/api/"] },
      { userAgent: "Googlebot", allow: "/", disallow: ["/admin", "/api/"] },
      { userAgent: "Bingbot", allow: "/", disallow: ["/admin", "/api/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
