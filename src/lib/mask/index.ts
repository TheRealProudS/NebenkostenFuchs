export interface MaskErgebnis {
  text: string;
  anzahl: Record<string, number>;
}

const NAME = "[A-ZÄÖÜ][a-zäöüß]+(?:-[A-ZÄÖÜ][a-zäöüß]+)?";
const NAME_KETTE = `${NAME}(?:\\s+(?:von|van|de|zu|der)?\\s*${NAME}){0,3}`;

const MUSTER: Array<[string, RegExp]> = [
  ["IBAN", /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}(?:\s?[A-Z0-9]{1,4})?\b/g],
  ["BIC", /\b(?:BIC|SWIFT)[:\s]*[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/gi],
  ["EMAIL", /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g],
  ["URL", /\b(?:https?:\/\/|www\.)\S+/gi],
  ["TELEFON", /(?:(?:Tel(?:efon)?|Fax|Mobil|Handy)\.?[:\s]*)?(?:\+49|0049|\(?0\d{2,5}\)?)[\s\/-]*\d[\d\s\/-]{4,}\d/g],
  ["NUMMER", /\b(?:Kunden|Mieter|Vertrags|Objekt|Wohnungs|Konto|Steuer|Aktenzeichen|Az|Referenz|Buchungs|Rechnungs)[-\s]?(?:nr|nummer|kennung|zeichen)?\.?[:\s#]*[A-Z0-9][A-Z0-9\/.-]{2,}/gi],
  ["ADRESSE", new RegExp(`\\b${NAME}(?:str(?:aße|asse|\\.)|weg|platz|allee|gasse|ring|damm|ufer|chaussee|steig|pfad|markt)\\s*\\d+\\s?[a-zA-Z]?\\b`, "g")],
  ["ADRESSE", new RegExp(`\\b(?:${NAME}\\s)+(?:Straße|Strasse|Str\\.|Weg|Platz|Allee|Gasse|Ring|Damm)\\s*\\d+\\s?[a-zA-Z]?\\b`, "g")],
  ["ORT", /\b\d{5}\s+[A-ZÄÖÜ][a-zäöüß]+(?:[\s-][A-ZÄÖÜ]?[a-zäöüß]+)*(?:\s\([^)]*\))?/g],
  ["NAME", new RegExp(`\\b(?:Herrn?|Frau|Familie|Eheleute|Fam\\.)\\s+(?:Dr\\.\\s+|Prof\\.\\s+)?${NAME_KETTE}`, "g")],
  ["NAME", new RegExp(`\\b(?:Mieter(?:in)?|Vermieter(?:in)?|Eigentümer(?:in)?|Ansprechpartner(?:in)?|Sachbearbeiter(?:in)?|Name|Inhaber(?:in)?)\\s*:\\s*${NAME_KETTE}`, "g")],
  ["NAME", new RegExp(`\\b(?:Sehr geehrte[rs]?|Liebe[rs]?|Hallo)\\s+(?:Herr|Frau)?\\s*${NAME_KETTE}`, "g")],
  ["NAME", new RegExp(`\\b(?:Mit freundlichen Grüßen|Freundliche Grüße|MfG)[,\\s]+${NAME_KETTE}`, "g")],
];

export function maskiere(input: string, extraNamen: string[] = []): MaskErgebnis {
  let text = input;
  const anzahl: Record<string, number> = {};
  const zaehler: Record<string, number> = {};
  const ersetzung = new Map<string, string>();

  const ersetze = (typ: string, treffer: string) => {
    const key = `${typ}:${treffer}`;
    if (!ersetzung.has(key)) {
      zaehler[typ] = (zaehler[typ] ?? 0) + 1;
      ersetzung.set(key, `[${typ}_${zaehler[typ]}]`);
    }
    anzahl[typ] = (anzahl[typ] ?? 0) + 1;
    return ersetzung.get(key)!;
  };

  const gefundeneNamen = new Set<string>(extraNamen.filter((n) => n.trim().length > 2));

  for (const [typ, re] of MUSTER) {
    text = text.replace(re, (m) => {
      if (typ === "TELEFON" && /\d+,\d{2}\b/.test(m)) return m;
      if (typ === "NAME") {
        const teile = m.split(/\s+/).filter((w) => /^[A-ZÄÖÜ][a-zäöüß-]+$/.test(w) && !/^(Herrn?|Frau|Familie|Eheleute|Sehr|Liebe[rs]?|Hallo|Mit|Freundliche[n]?|Grüße[n]?|Dr|Prof|Mieter|Mieterin|Vermieter|Vermieterin|Name)$/.test(w));
        teile.forEach((t) => gefundeneNamen.add(t));
        const prefix = m.match(/^(Herrn?|Frau|Familie|Eheleute|Sehr geehrte[rs]?|Liebe[rs]?|Hallo|Mit freundlichen Grüßen|Freundliche Grüße|MfG|Mieter(?:in)?|Vermieter(?:in)?)\b[:,]?\s*/);
        return (prefix?.[0] ?? "") + ersetze(typ, teile.join(" ") || m);
      }
      return ersetze(typ, m);
    });
  }

  for (const n of [...gefundeneNamen].sort((a, b) => b.length - a.length)) {
    const re = new RegExp(`(?<!\\p{L})${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?!\\p{L})`, "gu");
    text = text.replace(re, () => ersetze("NAME", n));
  }

  return { text, anzahl };
}

export function enthaeltPersonendaten(text: string): string[] {
  const funde: string[] = [];
  if (/\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}/.test(text)) funde.push("IBAN");
  if (/[\w.+-]+@[\w-]+\.[\w.-]+/.test(text)) funde.push("EMAIL");
  if (/\b(?:Herrn?|Frau)\s+[A-ZÄÖÜ][a-zäöüß]+/.test(text)) funde.push("NAME");
  return funde;
}
