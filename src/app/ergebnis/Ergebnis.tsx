"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { alsDocx, alsPdf } from "@/lib/letters/export";
import { briefAlsText, erstelleBrief, TITEL, type Adresse, type Brieftyp } from "@/lib/letters/vorlagen";
import type { Analyse, Befund, Schwere } from "@/lib/types";
import { Teilen } from "./Teilen";

const euro = (n: number) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const datum = (s: string | null) => (s ? new Date(s).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }) : "unbekannt");

const FARBE: Record<Schwere | "gruen", string> = { rot: "bg-rot", gelb: "bg-gelb", info: "bg-tinte/30", gruen: "bg-gruen" };
const WORT: Record<Schwere | "gruen", string> = { rot: "beanstanden", gelb: "nachfragen", info: "Hinweis", gruen: "in Ordnung" };

function Punkt({ s }: { s: Schwere | "gruen" }) {
  return <span className={`inline-block h-3 w-3 shrink-0 rounded-full ${FARBE[s]}`} aria-hidden />;
}

const leer: Adresse = { name: "", strasse: "", ort: "" };

function ladeAdressen(): { ich: Adresse; vm: Adresse } {
  try {
    const s = localStorage.getItem("fuchs-adressen");
    if (s) return JSON.parse(s);
  } catch {}
  return { ich: leer, vm: leer };
}

export function Ergebnis() {
  const [a, setA] = useState<Analyse | null | undefined>(undefined);
  const [auswahl, setAuswahl] = useState<Set<number>>(new Set());
  const [typ, setTyp] = useState<Brieftyp>("einwendung");
  const [ich, setIch] = useState<Adresse>(leer);
  const [vm, setVm] = useState<Adresse>(leer);
  const [wohnung, setWohnung] = useState("");
  const [gezahlt, setGezahlt] = useState(false);
  const [merken, setMerken] = useState(false);
  const [kopiert, setKopiert] = useState(false);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem("fuchs-analyse");
      const x = s ? (JSON.parse(s) as Analyse) : null;
      setA(x);
      if (x) setAuswahl(new Set(x.ergebnis.befunde.map((b, i) => (b.schwere === "rot" || b.schwere === "gelb" ? i : -1)).filter((i) => i >= 0)));
    } catch {
      setA(null);
    }
    const g = ladeAdressen();
    setIch(g.ich);
    setVm(g.vm);
    setMerken(Boolean(g.ich.name));
  }, []);

  const gewaehlt: Befund[] = useMemo(() => (a ? a.ergebnis.befunde.filter((_, i) => auswahl.has(i)) : []), [a, auswahl]);
  const betrag = useMemo(() => {
    if (!a) return 0;
    const summe = gewaehlt.filter((b) => b.schwere === "rot").reduce((s, b) => s + b.betrag, 0);
    return Math.min(summe, Math.max(a.ergebnis.einsparpotenzial, 0) || summe);
  }, [a, gewaehlt]);

  const brief = useMemo(() => {
    if (!a) return null;
    return erstelleBrief({
      typ,
      absender: ich,
      empfaenger: vm,
      wohnung,
      zeitraumVon: a.ergebnis.zeitraum.von,
      zeitraumBis: a.ergebnis.zeitraum.bis,
      befunde: gewaehlt,
      betrag,
      nachzahlung: a.ergebnis.nachzahlung,
      bereitsGezahlt: gezahlt,
      fristTage: 21,
      datum: new Date(),
    });
  }, [a, typ, ich, vm, wohnung, gewaehlt, betrag, gezahlt]);

  useEffect(() => {
    try {
      if (merken) localStorage.setItem("fuchs-adressen", JSON.stringify({ ich, vm }));
      else localStorage.removeItem("fuchs-adressen");
    } catch {}
  }, [merken, ich, vm]);

  if (a === undefined) return <p className="py-20 text-center text-tinte/60">Lade Ergebnis…</p>;
  if (!a) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg">Kein Ergebnis gefunden. Ergebnisse werden nur in diesem Browser-Tab gehalten.</p>
        <Link href="/pruefen" className="btn btn-primaer mt-6">Abrechnung prüfen</Link>
      </div>
    );
  }

  const r = a.ergebnis;
  const rot = r.befunde.filter((b) => b.schwere === "rot").length;
  const gelb = r.befunde.filter((b) => b.schwere === "gelb").length;
  const dateiname = `${TITEL[typ].replace(/\s+/g, "_")}_${r.zeitraum.bis?.slice(0, 4) ?? ""}`;
  const feld = "mt-1 w-full rounded-xl border border-tinte/25 bg-white px-3 py-2";

  return (
    <div className="space-y-16">
      <section>
        <p className="text-sm font-bold uppercase tracking-widest text-fuchs">Prüfergebnis</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight font-semibold sm:text-5xl">
          {r.einsparpotenzial > 0 ? (
            <>Der Fuchs hat <span className="text-fuchs">{euro(r.einsparpotenzial)}</span> gefunden, die du anfechten kannst.</>
          ) : rot + gelb > 0 ? (
            <>Keine klaren Fehlbeträge, aber {gelb + rot} Punkte zum Nachfragen.</>
          ) : (
            <>Die Abrechnung sieht sauber aus.</>
          )}
        </h1>
        <p className="mt-4 text-tinte/75">
          Zeitraum {datum(r.zeitraum.von)} bis {datum(r.zeitraum.bis)}
          {r.nachzahlung != null && <> · {r.nachzahlung >= 0 ? `Nachzahlung ${euro(r.nachzahlung)}` : `Guthaben ${euro(-r.nachzahlung)}`}</>}
          {r.einwendungsfristBis && <> · Widerspruch möglich bis <b className="text-tinte">{datum(r.einwendungsfristBis)}</b></>}
        </p>
        {a.hinweise.map((h) => <p key={h} className="mt-3 border-l-4 border-gelb pl-3 text-sm">{h}</p>)}
      </section>

      <section>
        <h2 className="font-serif text-2xl font-semibold">Alle Positionen</h2>
        <table className="mt-4 w-full text-left">
          <thead className="text-xs uppercase tracking-wide text-tinte/60">
            <tr className="border-b border-linie">
              <th className="py-2 font-semibold">Posten</th>
              <th className="hidden py-2 font-semibold sm:table-cell">Einordnung</th>
              <th className="py-2 text-right font-semibold">Dein Anteil</th>
              <th className="py-2 pl-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-linie">
            {r.ampel.map((p) => (
              <tr key={p.index}>
                <td className="py-3 pr-2">{p.bezeichnung}</td>
                <td className="hidden py-3 text-sm text-tinte/60 sm:table-cell">{p.kategorie ?? "nicht zugeordnet"}</td>
                <td className="py-3 text-right tabular-nums">{euro(p.betrag)}</td>
                <td className="py-3 pl-4"><span className="flex items-center gap-2 text-sm"><Punkt s={p.status} />{WORT[p.status]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-tinte/60">Die Positionen wurden automatisch ausgelesen. Vergleiche sie kurz mit deiner Abrechnung.</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-semibold">Befunde</h2>
        <p className="mt-1 text-sm text-tinte/70">Angehakte Befunde übernimmt der Fuchs in dein Schreiben.</p>
        {r.befunde.length === 0 && <p className="mt-4">Keine Auffälligkeiten.</p>}
        <ul className="mt-4 divide-y divide-linie border-y border-linie">
          {r.befunde.map((b, i) => (
            <li key={i} className="flex gap-4 py-5">
              <input
                type="checkbox"
                className="mt-1.5 h-4 w-4 shrink-0 accent-fuchs"
                checked={auswahl.has(i)}
                aria-label={`${b.titel} ins Schreiben übernehmen`}
                onChange={(e) => {
                  const n = new Set(auswahl);
                  if (e.target.checked) n.add(i); else n.delete(i);
                  setAuswahl(n);
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="flex items-center gap-2 font-bold"><Punkt s={b.schwere} />{b.titel}</h3>
                  {b.betrag > 0 && <span className="font-bold tabular-nums text-rot">{euro(b.betrag)}</span>}
                </div>
                <p className="mt-1 text-tinte/80">{b.erklaerung}</p>
                <p className="mt-1 text-xs text-tinte/55">{b.rechtsgrundlage}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="schreiben">
        <h2 className="font-serif text-2xl font-semibold">Dein Schreiben an die Hausverwaltung</h2>
        <p className="mt-1 text-sm text-tinte/70">Die Adressen bleiben in deinem Browser und werden nicht übertragen.</p>

        <div className="mt-6 flex flex-wrap gap-2" role="radiogroup">
          {(Object.keys(TITEL) as Brieftyp[]).map((t) => (
            <button key={t} type="button" role="radio" aria-checked={typ === t} onClick={() => setTyp(t)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${typ === t ? "border-tinte bg-tinte text-papier" : "border-tinte/25 hover:border-tinte"}`}>
              {TITEL[t]}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          {([["Absender (du)", ich, setIch], ["Empfänger (Vermieter / Verwaltung)", vm, setVm]] as const).map(([titel, wert, setzen]) => (
            <fieldset key={titel} className="space-y-2">
              <legend className="font-bold">{titel}</legend>
              <input className={feld} placeholder="Name" value={wert.name} onChange={(e) => setzen({ ...wert, name: e.target.value })} />
              <input className={feld} placeholder="Straße und Hausnummer" value={wert.strasse} onChange={(e) => setzen({ ...wert, strasse: e.target.value })} />
              <input className={feld} placeholder="PLZ und Ort" value={wert.ort} onChange={(e) => setzen({ ...wert, ort: e.target.value })} />
            </fieldset>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input className={feld} placeholder="Wohnung, z. B. 2. OG links, Whg.-Nr. 7" value={wohnung} onChange={(e) => setWohnung(e.target.value)} />
          <div className="flex flex-col justify-center gap-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-fuchs" checked={gezahlt} onChange={(e) => setGezahlt(e.target.checked)} />Nachzahlung schon überwiesen</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-fuchs" checked={merken} onChange={(e) => setMerken(e.target.checked)} />Adressen auf diesem Gerät merken</label>
          </div>
        </div>

        {brief && (
          <>
            <pre className="mt-8 max-h-[32rem] overflow-auto whitespace-pre-wrap border-l-4 border-fuchs bg-white px-6 py-5 font-sans text-sm leading-relaxed">{briefAlsText(brief)}</pre>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className="btn btn-primaer" onClick={() => alsPdf(brief, dateiname)}>Als PDF herunterladen</button>
              <button type="button" className="btn btn-sekundaer" onClick={() => alsDocx(brief, dateiname)}>Als Word herunterladen</button>
              <button type="button" className="btn btn-sekundaer" onClick={async () => { await navigator.clipboard.writeText(briefAlsText(brief)); setKopiert(true); setTimeout(() => setKopiert(false), 2000); }}>
                {kopiert ? "Kopiert" : "Text kopieren"}
              </button>
            </div>
            <p className="mt-4 text-sm text-tinte/70">
              Tipp: Verschicke das Schreiben per Einwurf-Einschreiben oder gib es gegen Empfangsbestätigung ab, damit du den Zugang vor Fristablauf beweisen kannst.
            </p>
          </>
        )}
      </section>

      <Teilen gefunden={r.einsparpotenzial} />

      <section className="border-t border-linie pt-8 text-sm text-tinte/70">
        <p>
          Das Ergebnis ist eine automatisierte Prüfung anhand eines festen Regelkatalogs und ersetzt keine Rechtsberatung. Bei Streit oder höheren Beträgen hilft dir der örtliche Mieterverein.{" "}
          <Link href="/hinweise" className="underline">So prüft der Fuchs</Link>
        </p>
      </section>
    </div>
  );
}
