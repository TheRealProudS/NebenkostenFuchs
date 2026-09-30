import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Textseite } from "@/components/Textseite";
import { ARTIKEL } from "@/data/ratgeber";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTIKEL.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = ARTIKEL.find((x) => x.slug === slug);
  return a ? { title: a.titel, description: a.beschreibung } : {};
}

export default async function Artikel({ params }: Props) {
  const { slug } = await params;
  const a = ARTIKEL.find((x) => x.slug === slug);
  if (!a) notFound();
  return (
    <Textseite titel={a.titel}>
      <p className="text-lg">{a.beschreibung}</p>
      {a.abschnitte.map((s) => (
        <section key={s.h}>
          <h2>{s.h}</h2>
          {s.p.map((t) => <p key={t}>{t}</p>)}
          {s.liste && <ul>{s.liste.map((l) => <li key={l}>{l}</li>)}</ul>}
        </section>
      ))}
      <div className="not-prose mt-12 border-t-2 border-tinte pt-6">
        <p className="font-serif text-2xl">Lass deine Abrechnung prüfen.</p>
        <p className="mt-1 text-tinte/75">Kostenlos, ohne Anmeldung, mit fertigem Musterschreiben.</p>
        <Link href="/pruefen" className="btn btn-primaer mt-4 !text-white !no-underline">Jetzt prüfen</Link>
      </div>
    </Textseite>
  );
}
