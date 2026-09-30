import { cache } from "react";
import { store } from "@/lib/db";

export const ladeErfolg = cache(async (id: string) => (/^[\w-]{6,12}$/.test(id) ? store.ladeErfolg(id) : null));

export const euro0 = (n: number) => n.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " €";

export function schlagzeile(e: { betrag: number; stadt: string | null; art: string }) {
  return e.art === "zurueckgeholt"
    ? `${euro0(e.betrag)} Nebenkosten zurückgeholt${e.stadt ? ` in ${e.stadt}` : ""}`
    : `${euro0(e.betrag)} strittige Nebenkosten gefunden${e.stadt ? ` in ${e.stadt}` : ""}`;
}
