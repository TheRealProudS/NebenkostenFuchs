import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NebenkostenFuchs",
    short_name: "NK-Fuchs",
    description: "Nebenkostenabrechnung kostenlos prüfen",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3ec",
    theme_color: "#e8702a",
    lang: "de",
    icons: [
      { src: "/brand/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
