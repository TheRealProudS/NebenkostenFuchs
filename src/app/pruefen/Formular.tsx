"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const SCHRITTE = ["Dokument wird gelesen", "Persönliche Daten werden unkenntlich gemacht", "Positionen werden erkannt", "Regeln werden geprüft"];

declare global {
  interface Window {
    turnstile?: { getResponse: (el?: HTMLElement) => string | undefined; reset: (el?: HTMLElement) => void };
  }
}

function DateiFeld({ name, label, hinweis, pflicht, dateien, setDateien }: {
  name: string;
  label: string;
  hinweis: string;
  pflicht?: boolean;
  dateien: File[];
  setDateien: (f: File[]) => void;
}) {
  const [ziehen, setZiehen] = useState(false);
  return (
    <div>
      <p className="font-bold">{label}{pflicht ? "" : <span className="font-normal text-tinte/60"> (optional)</span>}</p>
      <p className="text-sm text-tinte/70">{hinweis}</p>
      <label
        onDragOver={(e) => { e.preventDefault(); setZiehen(true); }}
        onDragLeave={() => setZiehen(false)}
        onDrop={(e) => { e.preventDefault(); setZiehen(false); setDateien([...dateien, ...Array.from(e.dataTransfer.files)].slice(0, 10)); }}
        className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${ziehen ? "border-fuchs bg-fuchs/5" : "border-tinte/25 hover:border-fuchs"}`}
      >
        <input
          type="file"
          name={name}
          multiple
          accept="application/pdf,image/*"
          className="sr-only"
          onChange={(e) => setDateien([...dateien, ...Array.from(e.target.files ?? [])].slice(0, 10))}
        />
        <span className="font-semibold text-fuchs-dunkel">Datei auswählen oder Foto aufnehmen</span>
        <span className="mt-1 text-sm text-tinte/60">PDF, JPG oder PNG, bis 15 MB je Datei, mehrere Seiten möglich</span>
      </label>
      {dateien.length > 0 && (
        <ul className="mt-3 divide-y divide-linie text-sm">
          {dateien.map((f, i) => (
            <li key={i} className="flex items-center justify-between py-2">
              <span className="truncate">{f.name}</span>
              <button type="button" className="ml-4 text-tinte/60 hover:text-rot" onClick={() => setDateien(dateien.filter((_, j) => j !== i))}>entfernen</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Formular({ turnstileKey }: { turnstileKey: string | null }) {
  const router = useRouter();
  const [abrechnung, setAbrechnung] = useState<File[]>([]);
  const [vertrag, setVertrag] = useState<File[]>([]);
  const [zugang, setZugang] = useState("");
  const [namen, setNamen] = useState("");
  const [einverstanden, setEinverstanden] = useState(false);
  const [laeuft, setLaeuft] = useState(false);
  const [schritt, setSchritt] = useState(0);
  const [fehler, setFehler] = useState<string | null>(null);
  const tsRef = useRef<HTMLDivElement>(null);

  async function senden(e: React.FormEvent) {
    e.preventDefault();
    if (!abrechnung.length || !einverstanden) return;
    setFehler(null);
    setLaeuft(true);
    setSchritt(0);
    const timer = setInterval(() => setSchritt((s) => Math.min(s + 1, SCHRITTE.length - 1)), 4500);
    const fd = new FormData();
    abrechnung.forEach((f) => fd.append("abrechnung", f));
    vertrag.forEach((f) => fd.append("mietvertrag", f));
    if (zugang) fd.append("zugangsdatum", zugang);
    if (namen) fd.append("namen", namen);
    const token = turnstileKey ? window.turnstile?.getResponse(tsRef.current ?? undefined) : undefined;
    if (token) fd.append("turnstile", token);
    try {
      const res = await fetch("/api/analyse", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.fehler ?? "Unbekannter Fehler");
      sessionStorage.setItem("fuchs-analyse", JSON.stringify(data));
      router.push("/ergebnis");
    } catch (err) {
      setFehler(err instanceof Error ? err.message : "Unbekannter Fehler");
      setLaeuft(false);
      if (turnstileKey) window.turnstile?.reset(tsRef.current ?? undefined);
    } finally {
      clearInterval(timer);
    }
  }

  if (laeuft) {
    return (
      <div className="py-10" aria-live="polite">
        <img src="/brand/logo-mark.svg" alt="" className="h-20 w-20 animate-pulse" />
        <ol className="mt-6 space-y-3">
          {SCHRITTE.map((s, i) => (
            <li key={s} className={`flex items-center gap-3 ${i > schritt ? "text-tinte/40" : ""}`}>
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${i < schritt ? "bg-gruen" : i === schritt ? "animate-ping bg-fuchs" : "bg-tinte/20"}`} />
              {s}
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-tinte/60">Das dauert meist 20 bis 60 Sekunden.</p>
      </div>
    );
  }

  return (
    <form onSubmit={senden} className="space-y-10">
      {turnstileKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />}
      <DateiFeld name="abrechnung" label="Nebenkostenabrechnung" hinweis="Alle Seiten mit den Kostenpositionen, gern auch die Heizkostenabrechnung." pflicht dateien={abrechnung} setDateien={setAbrechnung} />
      <DateiFeld name="mietvertrag" label="Mietvertrag" hinweis="Nur die Seiten zu Betriebskosten. Damit prüft der Fuchs, ob Kosten überhaupt vereinbart sind." dateien={vertrag} setDateien={setVertrag} />

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="font-bold">Wann kam die Abrechnung an?</span>
          <span className="block text-sm text-tinte/70">Für die Fristprüfung. Leer lassen, dann gilt das Datum auf dem Schreiben.</span>
          <input type="date" value={zugang} onChange={(e) => setZugang(e.target.value)} className="mt-2 w-full rounded-xl border border-tinte/25 bg-white px-3 py-2.5" />
        </label>
        <label className="block">
          <span className="font-bold">Namen zusätzlich schwärzen</span>
          <span className="block text-sm text-tinte/70">Optional, z. B. dein Nachname. Wird nur zum Unkenntlichmachen genutzt.</span>
          <input type="text" value={namen} onChange={(e) => setNamen(e.target.value)} placeholder="Nachname, Vermieter" className="mt-2 w-full rounded-xl border border-tinte/25 bg-white px-3 py-2.5" />
        </label>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" checked={einverstanden} onChange={(e) => setEinverstanden(e.target.checked)} className="mt-1 h-4 w-4 accent-fuchs" />
        <span>
          Ich habe die <a href="/datenschutz" className="underline">Datenschutzhinweise</a> gelesen. Der Text meiner Dokumente wird nach automatischer Anonymisierung zur Auswertung an Google Gemini übermittelt. Mir ist klar, dass das Ergebnis eine automatisierte Prüfung und keine Rechtsberatung ist.
        </span>
      </label>

      {turnstileKey && <div ref={tsRef} className="cf-turnstile" data-sitekey={turnstileKey} data-language="de" />}

      {fehler && <p className="border-l-4 border-rot bg-rot/5 px-4 py-3 text-rot" role="alert">{fehler}</p>}

      <button type="submit" disabled={!abrechnung.length || !einverstanden} className="btn btn-primaer text-lg">
        Jetzt prüfen
      </button>
    </form>
  );
}
