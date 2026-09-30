import type { Metadata } from "next";
import { Ergebnis } from "./Ergebnis";

export const metadata: Metadata = { title: "Prüfergebnis", robots: { index: false } };

export default function ErgebnisSeite() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Ergebnis />
    </div>
  );
}
