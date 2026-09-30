import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/db";

const Eingabe = z.object({
  betrag: z.number().positive().max(20000),
  stadt: z.string().trim().max(40).regex(/^[\p{L} .'-]*$/u).nullable().optional(),
  art: z.enum(["zurueckgeholt", "gefunden"]),
});

export async function POST(req: NextRequest) {
  const parsed = Eingabe.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ fehler: "Ungültige Angaben." }, { status: 400 });
  const { betrag, stadt, art } = parsed.data;
  const id = await store.speichereErfolg({ betrag: Math.round(betrag), stadt: stadt || null, art });
  return NextResponse.json({ id });
}
