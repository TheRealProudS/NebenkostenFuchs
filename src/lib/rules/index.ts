import { findeKategorie, findeKategorien, findeUnzulaessig, type Kategorie } from "@/data/katalog";
import type { Abrechnung, Befund, Mietvertrag, Pruefergebnis, Schwere } from "@/lib/types";
import { addMonate, formatDe, monateZwischen, parseDatum, toIso } from "./datum";

const runde = (n: number) => Math.round(n * 100) / 100;
const euro = (n: number) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

type Regel = (a: Abrechnung, mv: Mietvertrag | null) => Befund[];

const frist: Regel = (a) => {
  const bis = parseDatum(a.zeitraumBis);
  if (!bis) return [];
  const grenze = addMonate(bis, 12);
  const zugang = parseDatum(a.zugangsdatum) ?? parseDatum(a.erstelltAm);
  if (!zugang) {
    return [{
      regelId: "frist",
      titel: "Zugang der Abrechnung prüfen",
      rechtsgrundlage: "§ 556 Abs. 3 Satz 2 BGB",
      schwere: "info",
      betrag: 0,
      erklaerung: `Die Abrechnung musste bis zum ${formatDe(grenze)} bei dir eingehen. Kam sie später, darfst du keine Nachzahlung mehr leisten müssen.`,
    }];
  }
  if (zugang > grenze) {
    const nach = a.ergebnis && a.ergebnis > 0 ? a.ergebnis : 0;
    return [{
      regelId: "frist",
      titel: "Abrechnung zu spät",
      rechtsgrundlage: "§ 556 Abs. 3 Satz 2 und 3 BGB",
      schwere: "rot",
      betrag: nach,
      erklaerung: `Der Abrechnungszeitraum endete am ${formatDe(bis)}. Die Abrechnung hätte bis ${formatDe(grenze)} zugehen müssen, datiert aber auf den ${formatDe(zugang)}. Eine Nachforderung ist damit ausgeschlossen, es sei denn, der Vermieter hat die Verspätung nicht zu vertreten.`,
    }];
  }
  return [];
};

const zeitraum: Regel = (a) => {
  const von = parseDatum(a.zeitraumVon);
  const bis = parseDatum(a.zeitraumBis);
  if (!von || !bis) {
    return [{
      regelId: "zeitraum",
      titel: "Abrechnungszeitraum fehlt",
      rechtsgrundlage: "§ 556 Abs. 3 Satz 1 BGB",
      schwere: "gelb",
      betrag: 0,
      erklaerung: "Der Abrechnungszeitraum ist nicht eindeutig angegeben. Er gehört zu den Mindestangaben einer formell ordnungsgemäßen Abrechnung.",
    }];
  }
  const m = monateZwischen(von, bis);
  if (m > 12) {
    return [{
      regelId: "zeitraum",
      titel: "Abrechnungszeitraum länger als 12 Monate",
      rechtsgrundlage: "§ 556 Abs. 3 Satz 1 BGB",
      schwere: "rot",
      betrag: 0,
      erklaerung: `Der Zeitraum umfasst etwa ${m} Monate. Abgerechnet werden darf jährlich, also höchstens über 12 Monate. Kosten außerhalb eines Jahreszeitraums können beanstandet werden.`,
    }];
  }
  return [];
};

const unzulaessig: Regel = (a) =>
  a.positionen.flatMap((p, i) => {
    const u = findeUnzulaessig(p.bezeichnung);
    if (!u) return [];
    return [{
      regelId: `unzulaessig-${u.id}`,
      titel: `${u.name} nicht umlagefähig`,
      rechtsgrundlage: "§ 556 Abs. 1 BGB, § 1 Abs. 2 BetrKV",
      schwere: "rot" as Schwere,
      betrag: runde(p.betragMieter),
      erklaerung: `„${p.bezeichnung}“ (${euro(p.betragMieter)}): ${u.grund}`,
      positionIndex: i,
    }];
  });

const formell: Regel = (a) => {
  const out: Befund[] = [];
  a.positionen.forEach((p, i) => {
    if (p.gesamtkosten == null) {
      out.push({
        regelId: "gesamtkosten",
        titel: "Gesamtkosten fehlen",
        rechtsgrundlage: "§ 259 BGB, BGH VIII ZR 93/15",
        schwere: "gelb",
        betrag: 0,
        erklaerung: `Bei „${p.bezeichnung}“ sind die Gesamtkosten des Hauses nicht angegeben. Ohne sie kannst du die Verteilung nicht nachvollziehen.`,
        positionIndex: i,
      });
    }
    if (p.schluessel == null) {
      out.push({
        regelId: "schluessel",
        titel: "Verteilerschlüssel fehlt",
        rechtsgrundlage: "§ 556a BGB",
        schwere: "gelb",
        betrag: 0,
        erklaerung: `Bei „${p.bezeichnung}“ ist nicht erkennbar, nach welchem Schlüssel die Kosten verteilt wurden. Das macht die Abrechnung an dieser Stelle formell angreifbar.`,
        positionIndex: i,
      });
    }
  });
  if (a.vorauszahlungen == null) {
    out.push({
      regelId: "vorauszahlungen",
      titel: "Vorauszahlungen nicht ausgewiesen",
      rechtsgrundlage: "§ 556 Abs. 3 BGB",
      schwere: "gelb",
      betrag: 0,
      erklaerung: "Deine geleisteten Vorauszahlungen sind nicht erkennbar abgezogen. Prüfe, ob alle Monatszahlungen berücksichtigt wurden.",
    });
  }
  return out;
};

const rechnen: Regel = (a) => {
  const out: Befund[] = [];
  a.positionen.forEach((p, i) => {
    if (p.gesamtkosten == null || !p.schluesselWertMieter || !p.schluesselWertGesamt) return;
    const soll = (p.gesamtkosten * p.schluesselWertMieter) / p.schluesselWertGesamt;
    const diff = runde(p.betragMieter - soll);
    if (diff > 1) {
      out.push({
        regelId: "rechenfehler",
        titel: "Anteil zu hoch berechnet",
        rechtsgrundlage: "§ 556a BGB",
        schwere: "rot",
        betrag: diff,
        erklaerung: `„${p.bezeichnung}“: ${euro(p.gesamtkosten)} × ${p.schluesselWertMieter} / ${p.schluesselWertGesamt} ergibt ${euro(soll)}, berechnet wurden ${euro(p.betragMieter)}.`,
        positionIndex: i,
      });
    }
  });
  const summe = runde(a.positionen.reduce((s, p) => s + p.betragMieter, 0));
  if (a.summeMieter != null && runde(a.summeMieter - summe) > 1) {
    const diff = runde(a.summeMieter - summe);
    out.push({
      regelId: "summe",
      titel: "Summe stimmt nicht",
      rechtsgrundlage: "§ 259 BGB",
      schwere: "rot",
      betrag: diff,
      erklaerung: `Die Einzelposten ergeben ${euro(summe)}, ausgewiesen sind aber ${euro(a.summeMieter)}.`,
    });
  }
  if (a.summeMieter != null && a.vorauszahlungen != null && a.ergebnis != null) {
    const soll = runde(a.summeMieter - a.vorauszahlungen);
    const diff = runde(a.ergebnis - soll);
    if (diff > 1) {
      out.push({
        regelId: "saldo",
        titel: "Nachzahlung falsch berechnet",
        rechtsgrundlage: "§ 556 Abs. 3 BGB",
        schwere: "rot",
        betrag: diff,
        erklaerung: `Kosten ${euro(a.summeMieter)} minus Vorauszahlungen ${euro(a.vorauszahlungen)} ergibt ${euro(soll)}, gefordert werden ${euro(a.ergebnis)}.`,
      });
    }
  }
  return out;
};

const heizkosten: Regel = (a) => {
  const heiz = a.positionen
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => findeKategorie(p.bezeichnung)?.id === "heizung" || findeKategorie(p.bezeichnung)?.id === "warmwasser");
  if (!heiz.length) return [];
  const anteil = a.heizkostenVerbrauchsanteilProzent;
  const summe = heiz.reduce((s, { p }) => s + p.betragMieter, 0);
  if (anteil === 0 || heiz.every(({ p }) => p.schluessel && p.schluessel !== "verbrauch" && anteil == null)) {
    return [{
      regelId: "heizkostenv",
      titel: "Heizkosten nicht nach Verbrauch abgerechnet",
      rechtsgrundlage: "§§ 7, 12 HeizkostenV",
      schwere: "rot",
      betrag: runde(summe * 0.15),
      erklaerung: `Heiz- und Warmwasserkosten müssen zu 50 bis 70 % nach Verbrauch verteilt werden. Wurde das nicht gemacht, darfst du deinen Anteil (${euro(summe)}) um 15 % kürzen.`,
      positionIndex: heiz[0].i,
    }];
  }
  if (anteil != null && (anteil < 50 || anteil > 70)) {
    return [{
      regelId: "heizkostenv",
      titel: "Verbrauchsanteil außerhalb 50-70 %",
      rechtsgrundlage: "§ 7 Abs. 1 HeizkostenV",
      schwere: "gelb",
      betrag: 0,
      erklaerung: `Der verbrauchsabhängige Anteil liegt bei ${anteil} %. Zulässig sind 50 bis 70 %. Lass dir die Verteilung erklären.`,
      positionIndex: heiz[0].i,
    }];
  }
  return [];
};

const plausibel: Regel = (a) => {
  const von = parseDatum(a.zeitraumVon);
  const bis = parseDatum(a.zeitraumBis);
  if (!a.wohnflaecheMieter || !von || !bis) return [];
  const monate = Math.max(1, Math.min(12, monateZwischen(von, bis)));
  const jeKat = new Map<string, { summe: number; index: number; kats: Kategorie[] }>();
  a.positionen.forEach((p, i) => {
    if (findeUnzulaessig(p.bezeichnung)) return;
    const kats = findeKategorien(p.bezeichnung);
    if (!kats.length) return;
    const id = kats.map((k) => k.id).join("-");
    const e = jeKat.get(id) ?? { summe: 0, index: i, kats };
    e.summe += p.betragMieter;
    jeKat.set(id, e);
  });
  const out: Befund[] = [];
  for (const [id, { summe, index, kats }] of jeKat) {
    const richtwert = kats.reduce((s, k) => s + k.richtwertProQmMonat, 0);
    const name = kats.map((k) => k.name).join(" / ");
    const ist = summe / a.wohnflaecheMieter / monate;
    if (ist > richtwert * 2 && summe > 50) {
      out.push({
        regelId: `plausibel-${id}`,
        titel: `${name} ungewöhnlich hoch`,
        rechtsgrundlage: "§ 556 Abs. 3 Satz 1 BGB (Wirtschaftlichkeitsgebot)",
        schwere: "gelb",
        betrag: 0,
        erklaerung: `${ist.toFixed(2).replace(".", ",")} €/m² im Monat, der bundesweite Richtwert liegt bei etwa ${richtwert.toFixed(2).replace(".", ",")} €/m². Das ist nicht automatisch falsch, eine Belegeinsicht lohnt sich aber.`,
        positionIndex: index,
      });
    }
  }
  return out;
};

const vertrag: Regel = (a, mv) => {
  if (!mv) return [];
  if (mv.pauschale) {
    const nach = a.ergebnis && a.ergebnis > 0 ? a.ergebnis : 0;
    return [{
      regelId: "pauschale",
      titel: "Pauschale vereinbart, Abrechnung unzulässig",
      rechtsgrundlage: "§ 556 Abs. 2 BGB",
      schwere: "rot",
      betrag: nach,
      erklaerung: "Laut Mietvertrag zahlst du eine Betriebskostenpauschale. Über eine Pauschale wird nicht abgerechnet, eine Nachforderung ist deshalb ausgeschlossen.",
    }];
  }
  return a.positionen.flatMap((p, i) => {
    const k = findeKategorie(p.bezeichnung);
    if (k?.id !== "sonstige") return [];
    const b = p.bezeichnung.toLowerCase();
    const benannt = mv.sonstigeBenannt.some((s) => b.includes(s.toLowerCase()) || s.toLowerCase().includes(b));
    if (benannt) return [];
    return [{
      regelId: "sonstige-nicht-vereinbart",
      titel: "Sonstige Kosten nicht vereinbart",
      rechtsgrundlage: "§ 2 Nr. 17 BetrKV, BGH VIII ZR 137/15",
      schwere: "rot" as Schwere,
      betrag: runde(p.betragMieter),
      erklaerung: `„${p.bezeichnung}“ fällt unter „sonstige Betriebskosten“. Solche Kosten darf der Vermieter nur umlegen, wenn sie im Mietvertrag einzeln benannt sind. Im Vertrag wurde das nicht gefunden.`,
      positionIndex: i,
    }];
  });
};

const REGELN: Regel[] = [frist, zeitraum, unzulaessig, rechnen, heizkosten, vertrag, formell, plausibel];

const rang: Record<Schwere | "gruen", number> = { gruen: 0, info: 1, gelb: 2, rot: 3 };

export function pruefe(a: Abrechnung, mv: Mietvertrag | null = null, heute = new Date()): Pruefergebnis {
  const befunde = REGELN.flatMap((r) => r(a, mv));
  const ampel = a.positionen.map((p, index) => {
    const eigene = befunde.filter((b) => b.positionIndex === index);
    const status = eigene.reduce<Schwere | "gruen">((s, b) => (rang[b.schwere] > rang[s] ? b.schwere : s), "gruen");
    return {
      index,
      bezeichnung: p.bezeichnung,
      betrag: p.betragMieter,
      status,
      kategorie: findeUnzulaessig(p.bezeichnung)?.name ?? findeKategorie(p.bezeichnung)?.name ?? null,
    };
  });

  const jePosition = new Map<number, number>();
  let rechnerisch = 0;
  let nachforderungWeg = 0;
  for (const b of befunde) {
    if (b.schwere !== "rot" || b.betrag <= 0) continue;
    if (b.regelId === "frist" || b.regelId === "pauschale") nachforderungWeg = Math.max(nachforderungWeg, b.betrag);
    else if (b.positionIndex == null) rechnerisch += b.betrag;
    else jePosition.set(b.positionIndex, Math.max(jePosition.get(b.positionIndex) ?? 0, b.betrag));
  }
  const summePositionen = [...jePosition.values()].reduce((s, n) => s + n, 0) + rechnerisch;
  const nachzahlung = a.ergebnis;
  const einsparpotenzial = Math.max(nachforderungWeg, summePositionen);

  const erhalten = parseDatum(a.zugangsdatum) ?? parseDatum(a.erstelltAm) ?? heute;
  return {
    befunde: befunde.sort((x, y) => rang[y.schwere] - rang[x.schwere] || y.betrag - x.betrag),
    ampel,
    einsparpotenzial: runde(einsparpotenzial),
    nachzahlung,
    zeitraum: { von: a.zeitraumVon, bis: a.zeitraumBis },
    einwendungsfristBis: toIso(addMonate(erhalten, 12)),
  };
}
