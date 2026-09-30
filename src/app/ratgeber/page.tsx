import type { Metadata } from "next";
import Link from "next/link";
import { ARTIKEL } from "@/data/ratgeber";

export const metadata: Metadata = { title: "Ratgeber Nebenkosten", description: "Fristen, nicht umlagefähige Kosten, Belegeinsicht und Heizkosten verständlich erklärt." };

export default function Ratgeber() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-serif text-4xl font-semibold">Ratgeber Nebenkosten</h1>
      <p className="mt-3 text-lg text-tinte/75">Was du über deine Betriebskostenabrechnung wissen solltest.</p>
      <ul className="mt-10 divide-y divide-linie border-y border-linie">
        {ARTIKEL.map((a) => (
          <li key={a.slug} className="py-6">
            <Link href={`/ratgeber/${a.slug}`} className="group block">
              <h2 className="font-serif text-2xl font-semibold group-hover:text-fuchs">{a.titel}</h2>
              <p className="mt-1 text-tinte/75">{a.beschreibung}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
