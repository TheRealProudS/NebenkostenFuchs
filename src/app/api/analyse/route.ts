import { NextRequest, NextResponse } from "next/server";
import { hashIp, store } from "@/lib/db";
import { ExtraktionsFehler } from "@/lib/extract";
import { clientIp } from "@/lib/ip";
import { LlmFehler } from "@/lib/llm";
import { analysiere, NutzerFehler } from "@/lib/pipeline";
import { pruefeTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_DATEIEN = 10;

function dateien(form: FormData, feld: string): File[] {
  return form.getAll(feld).filter((f): f is File => f instanceof File && f.size > 0).slice(0, MAX_DATEIEN);
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ fehler: "Upload konnte nicht gelesen werden." }, { status: 400 });
  }

  if (!(await pruefeTurnstile(form.get("turnstile")?.toString() ?? null, ip))) {
    return NextResponse.json({ fehler: "Sicherheitsprüfung fehlgeschlagen. Lade die Seite neu." }, { status: 403 });
  }

  const limit = Number(process.env.RATE_LIMIT_PER_DAY ?? 5);
  if (!(await store.zaehleAnalyse(hashIp(ip), limit))) {
    return NextResponse.json({ fehler: `Du hast heute bereits ${limit} Prüfungen gemacht. Morgen geht es weiter.` }, { status: 429 });
  }

  const abrechnung = dateien(form, "abrechnung");
  if (!abrechnung.length) return NextResponse.json({ fehler: "Bitte lade deine Nebenkostenabrechnung hoch." }, { status: 400 });

  const zugang = form.get("zugangsdatum")?.toString() ?? "";
  const namen = (form.get("namen")?.toString() ?? "").split(/[,;\n]/).map((s) => s.trim()).filter((s) => s.length > 2).slice(0, 10);

  try {
    const analyse = await analysiere({
      abrechnung,
      mietvertrag: dateien(form, "mietvertrag"),
      zugangsdatum: /^\d{4}-\d{2}-\d{2}$/.test(zugang) ? zugang : null,
      namen,
    });
    await store.statistik(analyse.ergebnis.einsparpotenzial, analyse.ergebnis.befunde.length).catch(() => {});
    return NextResponse.json(analyse, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    if (e instanceof NutzerFehler || e instanceof ExtraktionsFehler) return NextResponse.json({ fehler: e.message }, { status: 422 });
    if (e instanceof LlmFehler) {
      console.error("llm", e.message);
      return NextResponse.json({ fehler: "Die Auswertung ist gerade überlastet. Versuche es in ein paar Minuten erneut." }, { status: 503 });
    }
    console.error("analyse", e instanceof Error ? e.name : "unbekannt");
    return NextResponse.json({ fehler: "Die Auswertung ist fehlgeschlagen. Prüfe, ob die Datei vollständig ist." }, { status: 500 });
  }
}
