import type { Befund } from "@/lib/types";

export type Brieftyp = "einwendung" | "belegeinsicht" | "rueckforderung";

export interface Adresse {
  name: string;
  strasse: string;
  ort: string;
}

export interface BriefDaten {
  typ: Brieftyp;
  absender: Adresse;
  empfaenger: Adresse;
  wohnung: string;
  zeitraumVon: string | null;
  zeitraumBis: string | null;
  befunde: Befund[];
  betrag: number;
  nachzahlung: number | null;
  bereitsGezahlt: boolean;
  fristTage: number;
  datum: Date;
}

export interface Brief {
  absender: string[];
  empfaenger: string[];
  ortDatum: string;
  betreff: string;
  anrede: string;
  absaetze: string[];
  liste: string[];
  schluss: string[];
  gruss: string;
  unterschrift: string;
}

export const TITEL: Record<Brieftyp, string> = {
  einwendung: "Widerspruch gegen die Abrechnung",
  belegeinsicht: "Antrag auf Belegeinsicht",
  rueckforderung: "Rückforderung zu viel gezahlter Beträge",
};

const TT = { day: "2-digit", month: "2-digit", year: "numeric" } as const;
const d = (s: string | null) => (s ? new Date(s).toLocaleDateString("de-DE", { ...TT, timeZone: "UTC" }) : "…");
const euro = (n: number) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const plusTage = (x: Date, t: number) => new Date(x.getTime() + t * 86400000).toLocaleDateString("de-DE", TT);

function befundZeile(b: Befund): string {
  const betrag = b.betrag > 0 ? ` (${euro(b.betrag)})` : "";
  return `${b.titel}${betrag}: ${b.erklaerung} Rechtsgrundlage: ${b.rechtsgrundlage}.`;
}

export function erstelleBrief(x: BriefDaten): Brief {
  const zeitraum = `${d(x.zeitraumVon)} bis ${d(x.zeitraumBis)}`;
  const frist = plusTage(x.datum, x.fristTage);
  const ortName = x.absender.ort.replace(/^\d{5}\s*/, "") || "…";
  const basis = {
    absender: [x.absender.name, x.absender.strasse, x.absender.ort].filter(Boolean),
    empfaenger: [x.empfaenger.name, x.empfaenger.strasse, x.empfaenger.ort].filter(Boolean),
    ortDatum: `${ortName}, ${x.datum.toLocaleDateString("de-DE", TT)}`,
    anrede: "Sehr geehrte Damen und Herren,",
    gruss: "Mit freundlichen Grüßen",
    unterschrift: x.absender.name,
  };
  const objekt = x.wohnung ? `Mietobjekt: ${x.wohnung}` : "Mietobjekt: siehe Absender";
  const rot = x.befunde.filter((b) => b.schwere === "rot");

  if (x.typ === "belegeinsicht") {
    return {
      ...basis,
      betreff: `Betriebskostenabrechnung für den Zeitraum ${zeitraum} - Antrag auf Belegeinsicht\n${objekt}`,
      absaetze: [
        `hiermit beantrage ich gemäß § 259 BGB Einsicht in sämtliche Originalbelege, die der Betriebskostenabrechnung für den Zeitraum ${zeitraum} zugrunde liegen, insbesondere Rechnungen, Verträge, Zahlungsnachweise und die Aufstellung der Flächen bzw. Verteilerschlüssel.`,
        x.befunde.length ? "Besonderen Klärungsbedarf sehe ich bei folgenden Positionen:" : "",
      ].filter(Boolean),
      liste: x.befunde.map(befundZeile),
      schluss: [
        `Bitte teilen Sie mir bis zum ${frist} mögliche Termine für die Einsichtnahme mit. Alternativ bitte ich um Übersendung von Kopien bzw. Scans.`,
        "Bis zur Gewährung der Belegeinsicht ist eine etwaige Nachforderung nicht fällig (BGH, Urteil vom 07.02.2018, VIII ZR 189/17). Ich mache insoweit von meinem Zurückbehaltungsrecht Gebrauch.",
        "Weitere Einwendungen nach Prüfung der Belege behalte ich mir ausdrücklich vor.",
      ],
    };
  }

  if (x.typ === "rueckforderung") {
    return {
      ...basis,
      betreff: `Betriebskostenabrechnung für den Zeitraum ${zeitraum} - Rückforderung\n${objekt}`,
      absaetze: [
        `die von Ihnen erstellte Betriebskostenabrechnung für den Zeitraum ${zeitraum} ist aus den folgenden Gründen fehlerhaft. Die Nachzahlung habe ich unter Vorbehalt geleistet bzw. ohne Rechtsgrund zu viel gezahlt.`,
      ],
      liste: (rot.length ? rot : x.befunde).map(befundZeile),
      schluss: [
        `Ich fordere Sie auf, mir den zu viel gezahlten Betrag von ${euro(x.betrag)} bis zum ${frist} auf mein Ihnen bekanntes Konto zu erstatten (§ 812 BGB) und mir eine korrigierte Abrechnung zu übersenden.`,
        "Weitere Einwendungen behalte ich mir vor.",
      ],
    };
  }

  const nach = x.nachzahlung && x.nachzahlung > 0;
  return {
    ...basis,
    betreff: `Betriebskostenabrechnung für den Zeitraum ${zeitraum} - Widerspruch\n${objekt}`,
    absaetze: [
      `hiermit erhebe ich gemäß § 556 Abs. 3 Satz 5 BGB fristgerecht Einwendungen gegen Ihre Betriebskostenabrechnung für den Zeitraum ${zeitraum}.`,
      "Die Abrechnung ist in folgenden Punkten zu beanstanden:",
    ],
    liste: x.befunde.map(befundZeile),
    schluss: [
      x.befunde.some((b) => b.regelId === "frist")
        ? "Da die Abrechnung nach Ablauf der Abrechnungsfrist zugegangen ist, ist eine Nachforderung ausgeschlossen. Ich werde keine Nachzahlung leisten."
        : `Ich bitte Sie, mir bis zum ${frist} eine korrigierte Abrechnung zu übersenden.${x.betrag > 0 ? ` Nach meiner Prüfung sind mindestens ${euro(x.betrag)} zu Unrecht angesetzt.` : ""}`,
      nach
        ? x.bereitsGezahlt
          ? "Die geforderte Nachzahlung habe ich ausschließlich unter Vorbehalt geleistet. Den zu viel gezahlten Betrag fordere ich nach Korrektur zurück."
          : "Bis zur Vorlage einer korrigierten Abrechnung mache ich von meinem Zurückbehaltungsrecht an der geforderten Nachzahlung Gebrauch."
        : "",
      "Zugleich bitte ich um Einsicht in die Originalbelege gemäß § 259 BGB. Weitere Einwendungen behalte ich mir ausdrücklich vor.",
    ].filter(Boolean),
  };
}

export function briefAlsText(b: Brief): string {
  return [
    b.absender.join("\n"),
    "",
    b.empfaenger.join("\n"),
    "",
    b.ortDatum,
    "",
    b.betreff,
    "",
    b.anrede,
    "",
    ...b.absaetze.flatMap((a) => [a, ""]),
    ...b.liste.map((l, i) => `${i + 1}. ${l}`),
    b.liste.length ? "" : "",
    ...b.schluss.flatMap((s) => [s, ""]),
    b.gruss,
    "",
    "",
    b.unterschrift,
  ].join("\n");
}
