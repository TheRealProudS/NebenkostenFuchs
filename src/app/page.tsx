import Link from "next/link";
import { store } from "@/lib/db";

export const revalidate = 300;

const euro = (n: number) => n.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " €";

const PRUEFUNGEN = [
  ["Fristen", "Kam die Abrechnung mehr als zwölf Monate nach Ende des Zeitraums, musst du nichts nachzahlen."],
  ["Nicht umlagefähige Posten", "Verwaltung, Reparaturen, Rücklagen, Bankgebühren, Notdienstpauschalen und weitere Kosten, die der Vermieter selbst tragen muss."],
  ["Rechenfehler", "Anteil aus Gesamtkosten und Verteilerschlüssel, Summen, Abzug deiner Vorauszahlungen."],
  ["Heizkostenverordnung", "Wird nicht zu 50 bis 70 Prozent nach Verbrauch abgerechnet, darfst du 15 Prozent kürzen."],
  ["Formelle Mängel", "Fehlende Gesamtkosten, unklarer Verteilerschlüssel, Zeitraum länger als ein Jahr."],
  ["Auffällige Kosten", "Vergleich mit bundesweiten Richtwerten je Quadratmeter, damit du weißt, wo eine Belegeinsicht lohnt."],
];

const FAQ = [
  ["Kostet das etwas?", "Nein. Prüfung und Musterschreiben sind kostenlos, ohne Anmeldung und ohne Abo."],
  ["Was passiert mit meiner Abrechnung?", "Sie wird nur im Arbeitsspeicher verarbeitet und danach verworfen. Namen, Adressen und Kontodaten werden vor der KI-Auswertung automatisch unkenntlich gemacht. Gespeichert wird nur eine anonyme Zählung."],
  ["Ist das eine Rechtsberatung?", "Nein. Der Fuchs prüft automatisiert anhand fester Regeln aus BGB, Betriebskostenverordnung und Heizkostenverordnung. Bei höheren Beträgen oder Streit helfen Mieterverein oder Fachanwalt."],
  ["Wie lange habe ich Zeit für einen Widerspruch?", "Einwendungen musst du spätestens zwölf Monate nach Zugang der Abrechnung erheben (§ 556 Abs. 3 BGB). Der Fuchs rechnet dir das Datum aus."],
];

export default async function Start() {
  const k = await store.kennzahlen().catch(() => ({ analysen: 0, gefunden: 0, zurueckgeholt: 0 }));
  return (
    <>
      <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 pt-14 pb-16 md:grid-cols-[1.3fr_1fr] md:pt-20">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-fuchs">Kostenlos, ohne Anmeldung</p>
          <h1 className="mt-4 font-serif text-4xl leading-[1.08] font-semibold sm:text-6xl">
            Zahlst du zu viel Nebenkosten?
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-tinte/80">
            Lade deine Abrechnung hoch. Der Fuchs findet unzulässige Posten, Rechenfehler und verpasste Fristen und schreibt dir den passenden Widerspruch an die Hausverwaltung.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/pruefen" className="btn btn-primaer text-lg">Abrechnung prüfen</Link>
            <Link href="/ratgeber/nicht-umlagefaehige-nebenkosten" className="btn btn-sekundaer">Was nicht umlagefähig ist</Link>
          </div>
          {k.analysen > 20 && (
            <p className="mt-8 text-sm text-tinte/70">
              Bisher <b className="text-tinte">{k.analysen.toLocaleString("de-DE")} Abrechnungen</b> geprüft, dabei <b className="text-tinte">{euro(k.gefunden)}</b> an strittigen Posten gefunden.
            </p>
          )}
        </div>
        <img src="/brand/logo-mark.svg" alt="" className="mx-auto hidden w-72 md:block" />
      </section>

      <section className="border-y border-linie bg-white/50">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="font-serif text-3xl font-semibold">So funktioniert es</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {[
              ["Hochladen", "PDF oder Foto der Abrechnung, optional den Mietvertrag. Am Handy direkt mit der Kamera."],
              ["Prüfen lassen", "In unter einer Minute siehst du jeden Posten als grün, gelb oder rot, mit Begründung und Paragraf."],
              ["Widersprechen", "Musterschreiben mit deinen Befunden als PDF oder Word. Deine Adresse trägst du nur im Browser ein."],
            ].map(([t, d], i) => (
              <li key={t} className="border-t-2 border-tinte pt-4">
                <span className="font-serif text-4xl text-fuchs">{i + 1}</span>
                <h3 className="mt-2 text-lg font-bold">{t}</h3>
                <p className="mt-1 text-tinte/75">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="font-serif text-3xl font-semibold">Was der Fuchs prüft</h2>
            <p className="mt-4 text-tinte/75">
              Die Bewertung macht kein Sprachmodell, sondern ein fester Regelkatalog auf Basis von BGB, Betriebskostenverordnung und Heizkostenverordnung. Die KI liest nur die Zahlen aus.
            </p>
          </div>
          <dl className="divide-y divide-linie border-y border-linie">
            {PRUEFUNGEN.map(([t, d]) => (
              <div key={t} className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr]">
                <dt className="font-bold">{t}</dt>
                <dd className="text-tinte/75">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-tinte text-papier">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <p className="font-serif text-3xl leading-snug sm:text-4xl">
            „Fast jede zweite Nebenkostenabrechnung ist fehlerhaft.“
          </p>
          <p className="mt-4 max-w-2xl text-papier/75">
            Das schätzt der Deutsche Mieterbund seit Jahren. Die häufigsten Fehler sind Verwaltungs- und Reparaturkosten, falsche Flächen und verspätete Abrechnungen. Genau danach sucht der Fuchs.
          </p>
          <Link href="/pruefen" className="btn btn-primaer mt-8">Meine Abrechnung prüfen</Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="font-serif text-3xl font-semibold">Häufige Fragen</h2>
        <div className="mt-6 divide-y divide-linie border-y border-linie">
          {FAQ.map(([f, a]) => (
            <details key={f} className="group py-4">
              <summary className="cursor-pointer list-none font-bold marker:hidden">
                <span className="mr-2 inline-block text-fuchs transition group-open:rotate-45">+</span>
                {f}
              </summary>
              <p className="mt-2 pl-5 text-tinte/75">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
