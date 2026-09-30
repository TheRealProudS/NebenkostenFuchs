"use client";

import { useState } from "react";

type Art = "gefunden" | "zurueckgeholt";

export function Teilen({ gefunden }: { gefunden: number }) {
  const [art, setArt] = useState<Art>("gefunden");
  const [betrag, setBetrag] = useState(gefunden > 0 ? String(Math.round(gefunden)) : "");
  const [stadt, setStadt] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);

  async function erstellen() {
    setFehler(null);
    setLaeuft(true);
    try {
      const res = await fetch("/api/erfolg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ art, betrag: Number(betrag.replace(",", ".")), stadt: stadt.trim() || null }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.fehler);
      setLink(`${location.origin}/erfolg/${d.id}`);
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Fehler");
    } finally {
      setLaeuft(false);
    }
  }

  const text = art === "zurueckgeholt"
    ? `${betrag} € Nebenkosten zurückgeholt${stadt ? ` in ${stadt}` : ""}. Prüf deine Abrechnung auch:`
    : `Der NebenkostenFuchs hat in meiner Abrechnung ${betrag} € gefunden. Prüf deine auch, kostenlos:`;

  const teilen = async () => {
    if (!link) return;
    if (navigator.share) {
      try { await navigator.share({ title: "NebenkostenFuchs", text, url: link }); } catch {}
    } else {
      await navigator.clipboard.writeText(`${text} ${link}`);
    }
  };

  const enc = encodeURIComponent;
  const feld = "mt-1 w-full rounded-xl border border-papier/30 bg-transparent px-3 py-2 text-papier placeholder:text-papier/40";

  return (
    <section className="-mx-4 bg-tinte px-4 py-12 text-papier sm:mx-0 sm:rounded-3xl sm:px-10">
      <h2 className="font-serif text-3xl font-semibold">Erzähl anderen davon</h2>
      <p className="mt-2 max-w-xl text-papier/75">
        Die meisten Mieter prüfen ihre Abrechnung nie. Mit deiner Karte merken sie, dass es sich lohnt. Die Karte enthält nur Betrag und optional die Stadt.
      </p>

      {!link ? (
        <div className="mt-6 grid max-w-2xl gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            Was teilst du?
            <select className={feld} value={art} onChange={(e) => setArt(e.target.value as Art)}>
              <option value="gefunden" className="text-tinte">Gefundener Betrag</option>
              <option value="zurueckgeholt" className="text-tinte">Zurückgeholter Betrag</option>
            </select>
          </label>
          <label className="block text-sm">
            Betrag in €
            <input className={feld} inputMode="numeric" value={betrag} onChange={(e) => setBetrag(e.target.value.replace(/[^\d,]/g, ""))} />
          </label>
          <label className="block text-sm">
            Stadt (optional)
            <input className={feld} value={stadt} maxLength={40} onChange={(e) => setStadt(e.target.value)} placeholder="z. B. Leipzig" />
          </label>
          <button type="button" disabled={!Number(betrag.replace(",", ".")) || laeuft} onClick={erstellen} className="btn btn-primaer sm:col-span-3 sm:w-fit">
            Teilen-Karte erstellen
          </button>
          {fehler && <p className="text-sm text-fuchs sm:col-span-3">{fehler}</p>}
        </div>
      ) : (
        <div className="mt-6 grid items-start gap-6 md:grid-cols-[1fr_1fr]">
          <img src={`${link}/opengraph-image`} alt="Deine Teilen-Karte" className="w-full rounded-xl" />
          <div className="space-y-3">
            <button type="button" onClick={teilen} className="btn btn-primaer w-full justify-center">Teilen</button>
            <div className="flex flex-wrap gap-2 text-sm font-semibold">
              <a className="btn btn-sekundaer !border-papier/40" target="_blank" rel="noopener" href={`https://www.reddit.com/submit?url=${enc(link)}&title=${enc(text)}`}>Reddit</a>
              <a className="btn btn-sekundaer !border-papier/40" target="_blank" rel="noopener" href={`https://wa.me/?text=${enc(`${text} ${link}`)}`}>WhatsApp</a>
              <a className="btn btn-sekundaer !border-papier/40" target="_blank" rel="noopener" href={`https://x.com/intent/post?text=${enc(text)}&url=${enc(link)}`}>X</a>
              <a className="btn btn-sekundaer !border-papier/40" href={`${link}/opengraph-image`} download="nebenkostenfuchs.png">Bild speichern</a>
            </div>
            <p className="break-all text-sm text-papier/60">{link}</p>
          </div>
        </div>
      )}
    </section>
  );
}
