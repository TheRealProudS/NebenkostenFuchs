import type { Metadata } from "next";
import { NICHT_UMLAGEFAEHIG } from "@/data/katalog";
import { Textseite } from "@/components/Textseite";

export const metadata: Metadata = { title: "So prüft der Fuchs", description: "Welche Regeln der NebenkostenFuchs prüft und wo seine Grenzen liegen." };

const REGELN = [
  ["Abrechnungsfrist", "§ 556 Abs. 3 Satz 2 BGB"],
  ["Abrechnungszeitraum höchstens 12 Monate", "§ 556 Abs. 3 Satz 1 BGB"],
  ["Nicht umlagefähige Kosten", "§ 1 Abs. 2 BetrKV, § 556 Abs. 1 BGB"],
  ["Anteil, Summen und Saldo", "§§ 259, 556a BGB"],
  ["Verbrauchsabhängige Heizkosten", "§§ 7, 12 HeizkostenV"],
  ["Gesamtkosten und Verteilerschlüssel angegeben", "BGH VIII ZR 93/15"],
  ["Sonstige Betriebskosten im Vertrag benannt", "§ 2 Nr. 17 BetrKV"],
  ["Pauschale statt Vorauszahlung", "§ 556 Abs. 2 BGB"],
  ["Auffällig hohe Kosten", "Wirtschaftlichkeitsgebot, Vergleich mit bundesweiten Richtwerten"],
];

export default function Hinweise() {
  return (
    <Textseite titel="So prüft der Fuchs">
      <p>Der NebenkostenFuchs trennt zwei Aufgaben strikt: Ein Sprachmodell liest die Zahlen aus deiner Abrechnung aus. Ob etwas zulässig ist, entscheidet danach ein fester, nachvollziehbarer Regelkatalog. So gibt es keine erfundenen Befunde.</p>
      <h2>Geprüfte Regeln</h2>
      <table><tbody>{REGELN.map(([r, g]) => <tr key={r}><td>{r}</td><td>{g}</td></tr>)}</tbody></table>
      <h2>Als nicht umlagefähig erkannt</h2>
      <ul>{NICHT_UMLAGEFAEHIG.map((u) => <li key={u.id}><b>{u.name}:</b> {u.grund}</li>)}</ul>
      <h2>Grenzen</h2>
      <ul>
        <li>Die Texterkennung kann Zahlen falsch lesen. Vergleiche die Tabelle im Ergebnis mit deiner Abrechnung.</li>
        <li>Mischposten wie „Hausmeister inkl. Reparaturen“ erkennt der Fuchs nur, wenn die Bezeichnung es verrät. Hier hilft die Belegeinsicht.</li>
        <li>Gewerbemietverträge, geförderter Wohnraum mit Sonderregeln und Wohnungseigentum werden nicht gesondert berücksichtigt.</li>
        <li>Richtwerte sind Durchschnittswerte. Höhere Kosten sind nicht automatisch falsch.</li>
      </ul>
      <h2>Keine Rechtsberatung</h2>
      <p>Das Ergebnis ist eine automatisierte Prüfung anhand allgemeiner Regeln und keine Rechtsberatung im Einzelfall. Bei Streit, hohen Beträgen oder drohender Kündigung wende dich an den örtlichen Mieterverein oder eine Fachanwältin bzw. einen Fachanwalt für Mietrecht.</p>
    </Textseite>
  );
}
