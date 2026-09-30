import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

const url = process.env.PUBLIC_URL ?? "https://nebenkostenfuchs.zenkner-technology.de";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: { default: "NebenkostenFuchs - Nebenkostenabrechnung kostenlos prüfen", template: "%s | NebenkostenFuchs" },
  description: "Lade deine Nebenkostenabrechnung hoch und finde unzulässige Posten, Rechenfehler und verpasste Fristen. Mit fertigem Musterschreiben an den Vermieter. Kostenlos, ohne Anmeldung.",
  openGraph: { type: "website", locale: "de_DE", siteName: "NebenkostenFuchs", images: ["/brand/og-default.png"] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#f7f3ec" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${manrope.variable} ${fraunces.variable}`}>
      <body className="min-h-screen">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
