import { createHash, randomBytes } from "node:crypto";
import postgres from "postgres";

export interface Erfolg {
  id: string;
  betrag: number;
  stadt: string | null;
  art: "zurueckgeholt" | "gefunden";
  erstellt: string;
}

interface Store {
  zaehleAnalyse(ipHash: string, limit: number): Promise<boolean>;
  statistik(einsparpotenzial: number, befunde: number): Promise<void>;
  kennzahlen(): Promise<{ analysen: number; gefunden: number; zurueckgeholt: number }>;
  speichereErfolg(e: Omit<Erfolg, "id" | "erstellt">): Promise<string>;
  ladeErfolg(id: string): Promise<Erfolg | null>;
}

const SCHEMA = `
create table if not exists rate_limits (ip_hash text not null, tag date not null, anzahl int not null default 0, primary key (ip_hash, tag));
create table if not exists analysis_stats (id bigserial primary key, erstellt timestamptz not null default now(), einsparpotenzial numeric(10,2) not null, befunde int not null);
create table if not exists success_shares (id text primary key, betrag numeric(10,2) not null, stadt text, art text not null, erstellt timestamptz not null default now());
`;

function pgStore(url: string): Store {
  const sql = postgres(url, { max: 5 });
  let init: Promise<unknown> | null = null;
  const bereit = () => (init ??= sql.unsafe(SCHEMA));
  return {
    async zaehleAnalyse(ipHash, limit) {
      await bereit();
      await sql`delete from rate_limits where tag < current_date - 2`;
      const [r] = await sql`insert into rate_limits (ip_hash, tag, anzahl) values (${ipHash}, current_date, 1)
        on conflict (ip_hash, tag) do update set anzahl = rate_limits.anzahl + 1 returning anzahl`;
      return r.anzahl <= limit;
    },
    async statistik(e, b) {
      await bereit();
      await sql`insert into analysis_stats (einsparpotenzial, befunde) values (${e}, ${b})`;
    },
    async kennzahlen() {
      await bereit();
      const [a] = await sql`select count(*)::int as analysen, coalesce(sum(einsparpotenzial),0)::float as gefunden from analysis_stats`;
      const [z] = await sql`select coalesce(sum(betrag),0)::float as zurueckgeholt from success_shares where art = 'zurueckgeholt'`;
      return { analysen: a.analysen, gefunden: a.gefunden, zurueckgeholt: z.zurueckgeholt };
    },
    async speichereErfolg(e) {
      await bereit();
      const id = neueId();
      await sql`insert into success_shares (id, betrag, stadt, art) values (${id}, ${e.betrag}, ${e.stadt}, ${e.art})`;
      return id;
    },
    async ladeErfolg(id) {
      await bereit();
      const [r] = await sql`select id, betrag::float as betrag, stadt, art, erstellt::text as erstellt from success_shares where id = ${id}`;
      return (r as unknown as Erfolg) ?? null;
    },
  };
}

function memStore(): Store {
  const limits = new Map<string, number>();
  const stats: number[] = [];
  const erfolge = new Map<string, Erfolg>();
  return {
    async zaehleAnalyse(ip, limit) {
      const k = `${ip}:${new Date().toISOString().slice(0, 10)}`;
      limits.set(k, (limits.get(k) ?? 0) + 1);
      return limits.get(k)! <= limit;
    },
    async statistik(e) {
      stats.push(e);
    },
    async kennzahlen() {
      const z = [...erfolge.values()].filter((e) => e.art === "zurueckgeholt").reduce((s, e) => s + e.betrag, 0);
      return { analysen: stats.length, gefunden: stats.reduce((s, n) => s + n, 0), zurueckgeholt: z };
    },
    async speichereErfolg(e) {
      const id = neueId();
      erfolge.set(id, { ...e, id, erstellt: new Date().toISOString() });
      return id;
    },
    async ladeErfolg(id) {
      return erfolge.get(id) ?? null;
    },
  };
}

function neueId() {
  return randomBytes(6).toString("base64url");
}

const g = globalThis as unknown as { __fuchsStore?: Store };
export const store: Store = (g.__fuchsStore ??= process.env.DATABASE_URL ? pgStore(process.env.DATABASE_URL) : memStore());

export function hashIp(ip: string) {
  return createHash("sha256").update(`${process.env.IP_SALT ?? "dev"}:${ip}:${new Date().toISOString().slice(0, 10)}`).digest("hex").slice(0, 32);
}
