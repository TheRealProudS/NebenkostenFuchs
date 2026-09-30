import { z } from "zod";
import type { Abrechnung, Mietvertrag } from "@/lib/types";

export interface LlmProvider {
  json(prompt: string, text: string, schema: object): Promise<unknown>;
}

export class LlmFehler extends Error {}

const SCHLUESSEL = ["wohnflaeche", "personen", "einheiten", "verbrauch", "miteigentum", "sonstig"] as const;

const zahl = z.number().nullable();
const datum = z.string().nullable();

export const AbrechnungSchema = z.object({
  istNebenkostenabrechnung: z.boolean(),
  zeitraumVon: datum,
  zeitraumBis: datum,
  erstelltAm: datum,
  wohnflaecheMieter: zahl,
  summeMieter: zahl,
  vorauszahlungen: zahl,
  ergebnis: zahl,
  heizkostenVerbrauchsanteilProzent: zahl,
  positionen: z.array(
    z.object({
      bezeichnung: z.string(),
      gesamtkosten: zahl,
      schluessel: z.enum(SCHLUESSEL).nullable(),
      schluesselWertMieter: zahl,
      schluesselWertGesamt: zahl,
      betragMieter: z.number(),
    }),
  ),
});

export const MietvertragSchema = z.object({
  istMietvertrag: z.boolean(),
  pauschale: z.boolean(),
  verweisAufBetrKV: z.boolean(),
  sonstigeBenannt: z.array(z.string()),
});

const n = { type: "number", nullable: true };
const s = { type: "string", nullable: true };

const ABRECHNUNG_JSON = {
  type: "object",
  properties: {
    istNebenkostenabrechnung: { type: "boolean" },
    zeitraumVon: s,
    zeitraumBis: s,
    erstelltAm: s,
    wohnflaecheMieter: n,
    summeMieter: n,
    vorauszahlungen: n,
    ergebnis: n,
    heizkostenVerbrauchsanteilProzent: n,
    positionen: {
      type: "array",
      items: {
        type: "object",
        properties: {
          bezeichnung: { type: "string" },
          gesamtkosten: n,
          schluessel: { type: "string", enum: [...SCHLUESSEL], nullable: true },
          schluesselWertMieter: n,
          schluesselWertGesamt: n,
          betragMieter: { type: "number" },
        },
        required: ["bezeichnung", "gesamtkosten", "schluessel", "schluesselWertMieter", "schluesselWertGesamt", "betragMieter"],
      },
    },
  },
  required: ["istNebenkostenabrechnung", "zeitraumVon", "zeitraumBis", "erstelltAm", "wohnflaecheMieter", "summeMieter", "vorauszahlungen", "ergebnis", "heizkostenVerbrauchsanteilProzent", "positionen"],
};

const MIETVERTRAG_JSON = {
  type: "object",
  properties: {
    istMietvertrag: { type: "boolean" },
    pauschale: { type: "boolean" },
    verweisAufBetrKV: { type: "boolean" },
    sonstigeBenannt: { type: "array", items: { type: "string" } },
  },
  required: ["istMietvertrag", "pauschale", "verweisAufBetrKV", "sonstigeBenannt"],
};

const PROMPT_ABRECHNUNG = `Du bist ein Extraktionswerkzeug für deutsche Betriebskosten- bzw. Nebenkostenabrechnungen von Wohnraum.
Lies den Text und gib ausschließlich die Daten im vorgegebenen JSON-Schema zurück. Bewerte nichts, rechne nichts nach, erfinde nichts.
Regeln:
- Datumsangaben als YYYY-MM-DD. Fehlende Werte als null.
- Beträge als Zahl in Euro mit Punkt als Dezimaltrenner, ohne Tausendertrennzeichen.
- positionen: jede einzelne Kostenart, die dem Mieter anteilig berechnet wird, mit Originalbezeichnung. Keine Zwischensummen, keine Vorauszahlungen, keine Endsummen.
- gesamtkosten: Kosten für das gesamte Haus bzw. die Abrechnungseinheit.
- schluessel: Verteilerschlüssel (wohnflaeche, personen, einheiten, verbrauch, miteigentum, sonstig).
- schluesselWertMieter / schluesselWertGesamt: z. B. 72 und 1440 bei Wohnfläche, Personentage, Einheiten.
- betragMieter: Anteil des Mieters an dieser Position.
- summeMieter: Summe aller Kosten des Mieters. vorauszahlungen: Summe der geleisteten Vorauszahlungen.
- ergebnis: Nachzahlung als positive Zahl, Guthaben als negative Zahl.
- heizkostenVerbrauchsanteilProzent: verbrauchsabhängiger Anteil der Heizkosten in Prozent, falls angegeben.
- Personenbezogene Daten sind durch Platzhalter wie [NAME_1] ersetzt. Ignoriere sie.
- Wenn der Text keine Nebenkostenabrechnung ist, setze istNebenkostenabrechnung auf false und positionen auf [].`;

const PROMPT_MIETVERTRAG = `Du bist ein Extraktionswerkzeug für deutsche Wohnraummietverträge.
Gib ausschließlich das JSON-Schema zurück, ohne Bewertung.
- pauschale: true, wenn eine Betriebskostenpauschale statt Vorauszahlungen mit Abrechnung vereinbart ist.
- verweisAufBetrKV: true, wenn auf die Betriebskostenverordnung oder Anlage 3 zu § 27 II. BV verwiesen wird.
- sonstigeBenannt: alle unter "sonstige Betriebskosten" einzeln benannten Kostenarten im Originalwortlaut.
- istMietvertrag: false, wenn der Text kein Mietvertrag ist.`;

export class GeminiProvider implements LlmProvider {
  constructor(
    private key = process.env.GEMINI_API_KEY ?? "",
    private modelle = (process.env.GEMINI_MODEL || "gemini-flash-latest,gemini-3-flash-preview,gemini-flash-lite-latest")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean),
  ) {}

  async json(prompt: string, text: string, schema: object): Promise<unknown> {
    if (!this.key) throw new LlmFehler("GEMINI_API_KEY fehlt.");
    let letzterFehler = "";
    for (let versuch = 0; versuch < this.modelle.length * 2; versuch++) {
      const modell = this.modelle[versuch % this.modelle.length];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modell}:generateContent`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": this.key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: prompt }] },
          contents: [{ role: "user", parts: [{ text }] }],
          generationConfig: { temperature: 0, responseMimeType: "application/json", responseSchema: schema },
        }),
        signal: AbortSignal.timeout(90_000),
      });
      if (res.status === 429 || res.status === 404 || res.status >= 500) {
        letzterFehler = `Gemini ${modell} ${res.status}`;
        if ((versuch + 1) % this.modelle.length === 0) await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      if (!res.ok) throw new LlmFehler(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const out = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      try {
        return JSON.parse(out);
      } catch {
        letzterFehler = "Ungültiges JSON";
      }
    }
    throw new LlmFehler(letzterFehler || "Gemini nicht erreichbar");
  }
}

let provider: LlmProvider = new GeminiProvider();

export function setzeProvider(p: LlmProvider) {
  provider = p;
}

export async function extrahiereAbrechnung(text: string): Promise<{ abrechnung: Abrechnung; gueltig: boolean }> {
  const roh = AbrechnungSchema.parse(await provider.json(PROMPT_ABRECHNUNG, text.slice(0, 60_000), ABRECHNUNG_JSON));
  const { istNebenkostenabrechnung, ...abrechnung } = roh;
  return { abrechnung: { ...abrechnung, zugangsdatum: null }, gueltig: istNebenkostenabrechnung };
}

export async function extrahiereMietvertrag(text: string): Promise<Mietvertrag | null> {
  const roh = MietvertragSchema.parse(await provider.json(PROMPT_MIETVERTRAG, text.slice(0, 80_000), MIETVERTRAG_JSON));
  if (!roh.istMietvertrag) return null;
  return { pauschale: roh.pauschale, verweisAufBetrKV: roh.verweisAufBetrKV, sonstigeBenannt: roh.sonstigeBenannt };
}
