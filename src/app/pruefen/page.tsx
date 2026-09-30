import type { Metadata } from "next";
import { Formular } from "./Formular";

export const metadata: Metadata = {
  title: "Abrechnung prüfen",
  description: "Nebenkostenabrechnung hochladen und in unter einer Minute unzulässige Posten und Fehler finden.",
};

export const dynamic = "force-dynamic";

export default function Pruefen() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl font-semibold">Abrechnung prüfen</h1>
      <p className="mt-3 text-lg text-tinte/75">
        Deine Dokumente werden nicht gespeichert. Namen, Adressen und Kontodaten werden vor der Auswertung automatisch entfernt.
      </p>
      <div className="mt-10">
        <Formular turnstileKey={process.env.TURNSTILE_SITE_KEY || null} />
      </div>
    </div>
  );
}
