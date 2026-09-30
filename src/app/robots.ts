import type { MetadataRoute } from "next";

const basis = process.env.PUBLIC_URL ?? "https://nebenkostenfuchs.zenkner-technology.de";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/ergebnis", "/erfolg/"] }], sitemap: `${basis}/sitemap.xml` };
}
