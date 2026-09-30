import { textAusDateien } from "@/lib/extract";
import { extrahiereAbrechnung, extrahiereMietvertrag } from "@/lib/llm";
import { enthaeltPersonendaten, maskiere } from "@/lib/mask";
import { pruefe } from "@/lib/rules";
import type { Analyse } from "@/lib/types";

export class NutzerFehler extends Error {}

export interface Eingabe {
  abrechnung: File[];
  mietvertrag: File[];
  zugangsdatum: string | null;
  namen: string[];
}

export async function analysiere(e: Eingabe): Promise<Analyse> {
  const hinweise: string[] = [];
  const roh = await textAusDateien(e.abrechnung);
  const maskiert = maskiere(roh, e.namen).text;
  if (enthaeltPersonendaten(maskiert).length) throw new NutzerFehler("Die Abrechnung konnte nicht sicher anonymisiert werden. Schwärze bitte Namen und Kontodaten und lade sie erneut hoch.");

  const [{ abrechnung, gueltig }, mietvertrag] = await Promise.all([
    extrahiereAbrechnung(maskiert),
    e.mietvertrag.length ? textAusDateien(e.mietvertrag).then((t) => extrahiereMietvertrag(maskiere(t, e.namen).text)) : Promise.resolve(null),
  ]);

  if (!gueltig || !abrechnung.positionen.length) throw new NutzerFehler("Das sieht nicht nach einer Nebenkostenabrechnung aus. Lade bitte die Seiten mit den einzelnen Kostenpositionen hoch.");
  if (e.mietvertrag.length && !mietvertrag) hinweise.push("Der Mietvertrag konnte nicht ausgewertet werden, die Prüfung lief ohne ihn.");

  abrechnung.zugangsdatum = e.zugangsdatum;
  return { abrechnung, ergebnis: pruefe(abrechnung, mietvertrag), hinweise };
}
