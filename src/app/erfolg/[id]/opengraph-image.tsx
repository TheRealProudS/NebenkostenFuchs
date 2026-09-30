import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { euro0, ladeErfolg } from "./daten";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "NebenkostenFuchs Erfolg";

export default async function Bild({ params }: { params: Promise<{ id: string }> }) {
  const e = await ladeErfolg((await params).id);
  const pub = (f: string) => path.join(process.cwd(), "public", f);
  const [svg, r400, r700, r800] = await Promise.all([
    readFile(pub("brand/logo-mark.svg"), "utf8"),
    readFile(pub("fonts/manrope-400.woff")),
    readFile(pub("fonts/manrope-700.woff")),
    readFile(pub("fonts/manrope-800.woff")),
  ]);
  const logo = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const betrag = e ? euro0(e.betrag) : "";
  const zeile = !e ? "Nebenkosten prüfen" : e.art === "zurueckgeholt" ? "Nebenkosten zurückgeholt" : "strittige Nebenkosten gefunden";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f7f3ec", padding: "64px 72px", color: "#1f2a36", fontFamily: "Manrope" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src={logo} width={84} height={84} />
          <div style={{ display: "flex", fontSize: 40 }}>
            Nebenkosten<span style={{ color: "#e8702a", fontWeight: 800 }}>Fuchs</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, fontWeight: 800, color: "#e8702a", lineHeight: 1 }}>{betrag}</div>
          <div style={{ fontSize: 52, fontWeight: 700, marginTop: 14 }}>{zeile}</div>
          {e?.stadt ? <div style={{ fontSize: 34, marginTop: 10, opacity: 0.7 }}>{`in ${e.stadt}`}</div> : null}
        </div>
        <div style={{ display: "flex", fontSize: 28, opacity: 0.75 }}>
          {"Jetzt kostenlos prüfen: nebenkostenfuchs.zenkner-technology.de"}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Manrope", data: r400, weight: 400, style: "normal" },
        { name: "Manrope", data: r700, weight: 700, style: "normal" },
        { name: "Manrope", data: r800, weight: 800, style: "normal" },
      ],
    },
  );
}
