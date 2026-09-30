import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ladeErfolg, schlagzeile } from "./daten";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = await ladeErfolg((await params).id);
  if (!e) return { title: "Nicht gefunden" };
  const titel = schlagzeile(e);
  return {
    title: titel,
    description: "Mit dem NebenkostenFuchs die eigene Nebenkostenabrechnung kostenlos prüfen und Musterschreiben erstellen.",
    openGraph: { title: titel, description: "Prüf deine Nebenkostenabrechnung auch, kostenlos und ohne Anmeldung." },
    robots: { index: false },
  };
}

export default async function ErfolgSeite({ params }: Props) {
  const { id } = await params;
  const e = await ladeErfolg(id);
  if (!e) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <img src={`/erfolg/${id}/opengraph-image`} alt={schlagzeile(e)} className="mx-auto w-full max-w-2xl rounded-2xl shadow-sm" />
      <h1 className="mt-10 font-serif text-4xl font-semibold">{schlagzeile(e)}</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-tinte/75">
        Fast jede zweite Nebenkostenabrechnung enthält Fehler. Der NebenkostenFuchs prüft deine in unter einer Minute und schreibt dir den Widerspruch.
      </p>
      <Link href="/pruefen" className="btn btn-primaer mt-8 text-lg">Meine Abrechnung prüfen</Link>
    </div>
  );
}
