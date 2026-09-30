import type { Metadata } from "next";
import { Textseite } from "@/components/Textseite";

export const metadata: Metadata = { title: "Impressum" };

export default function Impressum() {
  return (
    <Textseite titel="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>Cyrill-Pascal Zenkner<br />Zenkner Technology<br />Lessingstraße 46c<br />09599 Freiberg<br />Deutschland</p>
      <h2>Kontakt</h2>
      <p>E-Mail: <a href="mailto:cyrill-pascal.zenkner@zenkner-technology.de">cyrill-pascal.zenkner@zenkner-technology.de</a><br />Website: <a href="https://zenkner-technology.de">zenkner-technology.de</a></p>
      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>Cyrill-Pascal Zenkner, Anschrift wie oben</p>
      <h2>Keine Rechtsberatung</h2>
      <p>NebenkostenFuchs ist ein kostenloses Softwarewerkzeug zur automatisierten Prüfung von Betriebskostenabrechnungen anhand allgemeiner gesetzlicher Regeln. Es erbringt keine Rechtsdienstleistung im Einzelfall im Sinne des Rechtsdienstleistungsgesetzes und ersetzt keine Beratung durch einen Mieterverein oder eine Rechtsanwältin bzw. einen Rechtsanwalt.</p>
      <h2>Verbraucherstreitbeilegung</h2>
      <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
    </Textseite>
  );
}
