export interface Kategorie {
  id: string;
  name: string;
  betrkvNr: string;
  stichworte: string[];
  richtwertProQmMonat: number;
}

export const UMLAGEFAEHIG: Kategorie[] = [
  { id: "grundsteuer", name: "Grundsteuer", betrkvNr: "§ 2 Nr. 1", stichworte: ["grundsteuer", "öffentliche lasten", "oeffentliche lasten"], richtwertProQmMonat: 0.19 },
  { id: "wasser", name: "Wasserversorgung", betrkvNr: "§ 2 Nr. 2", stichworte: ["kaltwasser", "wasserversorgung", "frischwasser", "wasser"], richtwertProQmMonat: 0.2 },
  { id: "abwasser", name: "Entwässerung", betrkvNr: "§ 2 Nr. 3", stichworte: ["abwasser", "entwässerung", "entwaesserung", "kanal", "niederschlagswasser", "schmutzwasser"], richtwertProQmMonat: 0.17 },
  { id: "heizung", name: "Heizung", betrkvNr: "§ 2 Nr. 4", stichworte: ["heizung", "heizkosten", "wärme", "waerme", "fernwärme", "fernwaerme", "brennstoff", "gas", "öl", "heizöl"], richtwertProQmMonat: 1.19 },
  { id: "warmwasser", name: "Warmwasser", betrkvNr: "§ 2 Nr. 5", stichworte: ["warmwasser", "warmwasserbereitung"], richtwertProQmMonat: 0.33 },
  { id: "aufzug", name: "Aufzug", betrkvNr: "§ 2 Nr. 7", stichworte: ["aufzug", "fahrstuhl", "lift"], richtwertProQmMonat: 0.17 },
  { id: "strassenreinigung", name: "Straßenreinigung", betrkvNr: "§ 2 Nr. 8", stichworte: ["straßenreinigung", "strassenreinigung", "winterdienst", "schneeräumung", "schneeraeumung"], richtwertProQmMonat: 0.05 },
  { id: "muell", name: "Müllbeseitigung", betrkvNr: "§ 2 Nr. 8", stichworte: ["müll", "muell", "abfall", "entsorgung"], richtwertProQmMonat: 0.19 },
  { id: "gebaeudereinigung", name: "Gebäudereinigung", betrkvNr: "§ 2 Nr. 9", stichworte: ["gebäudereinigung", "gebaeudereinigung", "treppenhausreinigung", "hausreinigung", "reinigung", "ungeziefer"], richtwertProQmMonat: 0.2 },
  { id: "garten", name: "Gartenpflege", betrkvNr: "§ 2 Nr. 10", stichworte: ["garten", "grünanlage", "gruenanlage", "grünpflege", "spielplatz"], richtwertProQmMonat: 0.11 },
  { id: "beleuchtung", name: "Beleuchtung", betrkvNr: "§ 2 Nr. 11", stichworte: ["beleuchtung", "allgemeinstrom", "hausstrom", "strom allgemein"], richtwertProQmMonat: 0.05 },
  { id: "schornstein", name: "Schornsteinreinigung", betrkvNr: "§ 2 Nr. 12", stichworte: ["schornstein", "kaminkehrer", "schornsteinfeger", "immissionsmessung"], richtwertProQmMonat: 0.03 },
  { id: "versicherung", name: "Sach- und Haftpflichtversicherung", betrkvNr: "§ 2 Nr. 13", stichworte: ["versicherung", "gebäudeversicherung", "gebaeudeversicherung", "haftpflicht", "glasversicherung", "elementar"], richtwertProQmMonat: 0.23 },
  { id: "hauswart", name: "Hauswart", betrkvNr: "§ 2 Nr. 14", stichworte: ["hauswart", "hausmeister", "hauswartung"], richtwertProQmMonat: 0.26 },
  { id: "antenne", name: "Antenne / Kabel", betrkvNr: "§ 2 Nr. 15", stichworte: ["antenne", "kabel", "breitband", "tv", "fernseh"], richtwertProQmMonat: 0.11 },
  { id: "waesche", name: "Wascheinrichtungen", betrkvNr: "§ 2 Nr. 16", stichworte: ["waschküche", "waschkueche", "waschmaschine", "wascheinrichtung"], richtwertProQmMonat: 0.02 },
  { id: "sonstige", name: "Sonstige Betriebskosten", betrkvNr: "§ 2 Nr. 17", stichworte: ["sonstige", "dachrinnenreinigung", "wartung rauchmelder", "rauchwarnmelder", "legionellen", "brandschutz"], richtwertProQmMonat: 0.08 },
];

export interface Unzulaessig {
  id: string;
  name: string;
  stichworte: string[];
  grund: string;
}

export const NICHT_UMLAGEFAEHIG: Unzulaessig[] = [
  { id: "verwaltung", name: "Verwaltungskosten", stichworte: ["verwaltung", "hausverwaltung", "verwaltergebühr", "verwaltergebuehr", "verwalterhonorar", "wegverwaltung", "weg-verwaltung"], grund: "Verwaltungskosten sind nach § 1 Abs. 2 Nr. 1 BetrKV keine Betriebskosten und dürfen im Wohnraummietrecht nicht umgelegt werden." },
  { id: "instandhaltung", name: "Instandhaltung und Reparaturen", stichworte: ["instandhaltung", "instandsetzung", "reparatur", "sanierung", "erneuerung", "austausch", "ersatzbeschaffung"], grund: "Instandhaltungs- und Instandsetzungskosten sind nach § 1 Abs. 2 Nr. 2 BetrKV keine Betriebskosten." },
  { id: "ruecklage", name: "Instandhaltungsrücklage", stichworte: ["rücklage", "ruecklage", "erhaltungsrücklage", "erhaltungsruecklage"], grund: "Rücklagen der Eigentümergemeinschaft sind Vermögensbildung des Eigentümers und keine Betriebskosten." },
  { id: "bank", name: "Bank- und Kontoführungsgebühren", stichworte: ["kontoführung", "kontofuehrung", "bankgebühr", "bankgebuehr", "bankspesen", "zinsen"], grund: "Kontoführungs- und Bankgebühren gehören zu den nicht umlagefähigen Verwaltungskosten." },
  { id: "porto", name: "Porto, Telefon, Büromaterial", stichworte: ["porto", "telefon", "büromaterial", "bueromaterial", "kopierkosten"], grund: "Porto- und Bürokosten sind Verwaltungskosten und nicht umlagefähig." },
  { id: "recht", name: "Rechts- und Gerichtskosten", stichworte: ["rechtsanwalt", "anwalt", "gerichtskosten", "rechtsberatung", "mahngebühr", "mahngebuehr", "inkasso"], grund: "Rechtsverfolgungskosten des Vermieters sind keine Betriebskosten." },
  { id: "leerstand", name: "Leerstand", stichworte: ["leerstand"], grund: "Kosten für leerstehende Wohnungen trägt der Vermieter, sie dürfen nicht auf die übrigen Mieter verteilt werden." },
  { id: "abrechnungskosten", name: "Kosten der Abrechnungserstellung", stichworte: ["erstellung der abrechnung", "abrechnungserstellung", "nebenkostenabrechnungsgebühr"], grund: "Die Erstellung der Betriebskostenabrechnung selbst ist Verwaltungsaufwand. Ausnahme sind die Ablesekosten für Heizung und Wasser." },
  { id: "notdienst", name: "Notdienstpauschale", stichworte: ["notdienst", "notruf", "bereitschaftsdienst"], grund: "Notdienst- und Bereitschaftspauschalen des Hausmeisters sind nach BGH (VIII ZR 62/19) Verwaltungskosten und nicht umlagefähig." },
  { id: "sonderumlage", name: "Sonderumlage", stichworte: ["sonderumlage"], grund: "Sonderumlagen einer Eigentümergemeinschaft sind keine Betriebskosten." },
  { id: "mietausfall", name: "Mietausfallversicherung", stichworte: ["mietausfall", "rechtsschutzversicherung", "hausratversicherung", "reparaturversicherung"], grund: "Versicherungen, die nur den Vermieter schützen, sind nach § 2 Nr. 13 BetrKV nicht umlagefähig." },
  { id: "einmalig", name: "Einmalige Anschaffungen", stichworte: ["anschaffung", "neukauf", "kauf rauchmelder", "erstausstattung", "baumfällung einmalig"], grund: "Einmalige Anschaffungs- oder Investitionskosten sind keine laufend entstehenden Betriebskosten." },
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export function findeUnzulaessig(bezeichnung: string): Unzulaessig | null {
  const b = normalize(bezeichnung);
  if (/wartung/.test(b) && !/reparatur|instandsetzung/.test(b)) {
    const ohneWartung = NICHT_UMLAGEFAEHIG.filter((u) => u.id !== "instandhaltung");
    return ohneWartung.find((u) => u.stichworte.some((w) => b.includes(w))) ?? null;
  }
  return NICHT_UMLAGEFAEHIG.find((u) => u.stichworte.some((w) => b.includes(w))) ?? null;
}

export function findeKategorie(bezeichnung: string): Kategorie | null {
  const b = normalize(bezeichnung);
  let best: { k: Kategorie; len: number } | null = null;
  for (const k of UMLAGEFAEHIG) {
    for (const w of k.stichworte) {
      if (b.includes(w) && (!best || w.length > best.len)) best = { k, len: w.length };
    }
  }
  return best?.k ?? null;
}

export function findeKategorien(bezeichnung: string): Kategorie[] {
  const teile = bezeichnung.split(/\s*(?:\/|,|\+|&|\sund\s)\s*/i).filter(Boolean);
  const out: Kategorie[] = [];
  for (const t of teile) {
    const k = findeKategorie(t);
    if (k && !out.includes(k)) out.push(k);
  }
  const ganz = findeKategorie(bezeichnung);
  if (!out.length && ganz) out.push(ganz);
  return out;
}
