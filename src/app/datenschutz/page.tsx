import type { Metadata } from "next";
import { Textseite } from "@/components/Textseite";

export const metadata: Metadata = { title: "Datenschutz" };

export default function Datenschutz() {
  return (
    <Textseite titel="Datenschutzerklärung" stand="September 2026">
      <h2>Kurz gesagt</h2>
      <ul>
        <li>Kein Konto, keine Werbe- oder Analyse-Cookies, kein Tracking.</li>
        <li>Hochgeladene Dokumente werden nur im Arbeitsspeicher verarbeitet und nicht gespeichert.</li>
        <li>Namen, Adressen, Kontodaten und Kundennummern werden vor der KI-Auswertung automatisch entfernt.</li>
        <li>Der anonymisierte Text wird an Google (Gemini API) übermittelt. Das ist der einzige externe Empfänger.</li>
        <li>Deine Adressen für das Musterschreiben bleiben in deinem Browser.</li>
      </ul>

      <h2>Verantwortlicher</h2>
      <p>Cyrill-Pascal Zenkner, Lessingstraße 46c, 09599 Freiberg, <a href="mailto:cyrill-pascal.zenkner@zenkner-technology.de">cyrill-pascal.zenkner@zenkner-technology.de</a></p>

      <h2>Hosting und Server-Logs</h2>
      <p>Die Anwendung läuft auf einem eigenen Server in Deutschland. Beim Aufruf verarbeitet der Webserver technisch notwendige Daten (IP-Adresse, Zeitpunkt, aufgerufene Seite, Browserkennung) zur Auslieferung und Absicherung des Dienstes. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Die Logs werden nach spätestens 14 Tagen gelöscht.</p>

      <h2>Prüfung deiner Abrechnung</h2>
      <table>
        <tbody>
          <tr><td>1. Texterkennung</td><td>Der Text wird auf unserem Server aus PDF oder Foto ausgelesen.</td></tr>
          <tr><td>2. Anonymisierung</td><td>Namen, Anschriften, E-Mail-Adressen, Telefonnummern, IBAN/BIC sowie Kunden- und Vertragsnummern werden durch Platzhalter ersetzt. Findet die Kontrolle danach noch Kontodaten oder Namen, wird die Übermittlung abgebrochen.</td></tr>
          <tr><td>3. Auslesen der Zahlen</td><td>Der anonymisierte Text wird an die Gemini API von Google übermittelt, die Kostenpositionen und Beträge als strukturierte Daten zurückgibt.</td></tr>
          <tr><td>4. Prüfung</td><td>Die Bewertung erfolgt auf unserem Server durch einen festen Regelkatalog.</td></tr>
          <tr><td>5. Löschung</td><td>Datei und Text werden nach der Antwort verworfen. Das Ergebnis wird nur in deinem Browser-Tab (sessionStorage) gehalten.</td></tr>
        </tbody>
      </table>
      <p>Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die du vor dem Hochladen erteilst und jederzeit mit Wirkung für die Zukunft widerrufen kannst.</p>

      <h2>Google Gemini API</h2>
      <p>Empfänger ist Google LLC bzw. Google Ireland Ltd. Eine Übermittlung in die USA ist möglich, Google ist unter dem EU-US Data Privacy Framework zertifiziert (Art. 45 DSGVO). Wir nutzen den kostenlosen Zugang der Gemini API. Nach den Bedingungen von Google können Eingaben in diesem Zugang zur Verbesserung der Google-Dienste verwendet und von Menschen geprüft werden. Deshalb übermitteln wir ausschließlich den automatisch anonymisierten Text. Eine vollständige Anonymisierung kann technisch nicht garantiert werden. Wenn du ganz sicher gehen willst, schwärze Namen und Anschrift vor dem Hochladen. Weitere Informationen: <a href="https://ai.google.dev/gemini-api/terms">Gemini API Terms</a>, <a href="https://policies.google.com/privacy">Google Datenschutzerklärung</a>.</p>

      <h2>Missbrauchsschutz</h2>
      <p>Um die Zahl der Prüfungen pro Tag zu begrenzen, speichern wir einen täglich wechselnden, nicht umkehrbaren Hashwert deiner IP-Adresse mit einem Zähler. Diese Einträge werden nach zwei Tagen gelöscht. Sofern aktiviert, nutzen wir Cloudflare Turnstile zur Bot-Abwehr (Cloudflare Inc., USA, DPF-zertifiziert). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.</p>

      <h2>Statistik und Teilen-Karten</h2>
      <p>Pro Prüfung speichern wir nur die Anzahl der Befunde und den gefundenen Gesamtbetrag, ohne Bezug zu dir. Wenn du eine Teilen-Karte erstellst, speichern wir den angegebenen Betrag und optional die Stadt, damit die Karte unter ihrem Link abrufbar ist.</p>

      <h2>Lokale Speicherung im Browser</h2>
      <p>Das Prüfergebnis liegt im sessionStorage deines Browsers und verschwindet mit dem Tab. Wenn du „Adressen auf diesem Gerät merken“ wählst, werden die Adressen im localStorage abgelegt. Beides wird nicht an uns übertragen.</p>

      <h2>Deine Rechte</h2>
      <p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht auf Beschwerde bei einer Aufsichtsbehörde, etwa beim Sächsischen Datenschutz- und Transparenzbeauftragten.</p>
    </Textseite>
  );
}
