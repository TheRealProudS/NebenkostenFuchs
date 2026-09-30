export type Schluessel =
  | "wohnflaeche"
  | "personen"
  | "einheiten"
  | "verbrauch"
  | "miteigentum"
  | "sonstig";

export interface Position {
  bezeichnung: string;
  gesamtkosten: number | null;
  schluessel: Schluessel | null;
  schluesselWertMieter: number | null;
  schluesselWertGesamt: number | null;
  betragMieter: number;
}

export interface Abrechnung {
  zeitraumVon: string | null;
  zeitraumBis: string | null;
  erstelltAm: string | null;
  zugangsdatum: string | null;
  wohnflaecheMieter: number | null;
  summeMieter: number | null;
  vorauszahlungen: number | null;
  ergebnis: number | null;
  heizkostenVerbrauchsanteilProzent: number | null;
  positionen: Position[];
}

export interface Mietvertrag {
  pauschale: boolean;
  verweisAufBetrKV: boolean;
  sonstigeBenannt: string[];
}

export type Schwere = "rot" | "gelb" | "info";

export interface Befund {
  regelId: string;
  titel: string;
  rechtsgrundlage: string;
  schwere: Schwere;
  betrag: number;
  erklaerung: string;
  positionIndex?: number;
}

export interface Pruefergebnis {
  befunde: Befund[];
  ampel: Array<{ index: number; bezeichnung: string; betrag: number; status: Schwere | "gruen"; kategorie: string | null }>;
  einsparpotenzial: number;
  nachzahlung: number | null;
  zeitraum: { von: string | null; bis: string | null };
  einwendungsfristBis: string | null;
}

export interface Analyse {
  abrechnung: Abrechnung;
  ergebnis: Pruefergebnis;
  hinweise: string[];
}
