export function parseDatum(s: string | null | undefined): Date | null {
  if (!s) return null;
  const t = s.trim();
  let m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  m = t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (m) {
    const j = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    return new Date(Date.UTC(j, +m[2] - 1, +m[1]));
  }
  return null;
}

export function addMonate(d: Date, n: number): Date {
  const r = new Date(d.getTime());
  const tag = r.getUTCDate();
  r.setUTCDate(1);
  r.setUTCMonth(r.getUTCMonth() + n);
  const letzter = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate();
  r.setUTCDate(Math.min(tag, letzter));
  return r;
}

export function monateZwischen(von: Date, bis: Date): number {
  const tage = (bis.getTime() - von.getTime()) / 86400000 + 1;
  return Math.round(tage / 30.4375);
}

export function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function formatDe(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
}
