import type { MetadataRoute } from "next";
import { ARTIKEL } from "@/data/ratgeber";

const basis = process.env.PUBLIC_URL ?? "https://nebenkostenfuchs.zenkner-technology.de";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${basis}/`, priority: 1 },
    { url: `${basis}/pruefen`, priority: 0.9 },
    { url: `${basis}/ratgeber`, priority: 0.7 },
    ...ARTIKEL.map((a) => ({ url: `${basis}/ratgeber/${a.slug}`, priority: 0.7 })),
    { url: `${basis}/hinweise`, priority: 0.4 },
    { url: `${basis}/impressum`, priority: 0.1 },
    { url: `${basis}/datenschutz`, priority: 0.1 },
  ];
}
