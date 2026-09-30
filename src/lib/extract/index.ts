import { extractText, getDocumentProxy } from "unpdf";

export class ExtraktionsFehler extends Error {}

const MAX_BYTES = 15 * 1024 * 1024;
const BILD = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export async function textAusDatei(file: File): Promise<string> {
  if (file.size > MAX_BYTES) throw new ExtraktionsFehler("Die Datei ist größer als 15 MB.");
  const buf = new Uint8Array(await file.arrayBuffer());
  const istPdf = file.type === "application/pdf" || (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46);
  if (istPdf) return pdfText(buf);
  if (BILD.includes(file.type)) return ocr(Buffer.from(buf));
  throw new ExtraktionsFehler("Bitte lade ein PDF oder ein Foto (JPG, PNG) hoch.");
}

async function pdfText(buf: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(buf);
  if (pdf.numPages > 30) throw new ExtraktionsFehler("Das PDF hat mehr als 30 Seiten.");
  const { text } = await extractText(pdf, { mergePages: true });
  const t = String(text).replace(/[ \t]+/g, " ").trim();
  if (t.replace(/\s/g, "").length < 150) {
    throw new ExtraktionsFehler("Das PDF enthält keinen lesbaren Text, vermutlich ist es ein Scan. Fotografiere die Seiten bitte ab oder lade sie als Bilder hoch.");
  }
  return t;
}

let workerPromise: Promise<import("tesseract.js").Worker> | null = null;

async function ocr(buf: Buffer): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  workerPromise ??= createWorker("deu", 1, { cachePath: process.env.TESS_CACHE ?? "/tmp/tess" });
  const worker = await workerPromise;
  const { data } = await worker.recognize(buf);
  const t = data.text.trim();
  if (t.length < 100) throw new ExtraktionsFehler("Auf dem Foto konnte kaum Text erkannt werden. Achte auf gutes Licht und fotografiere die Seite gerade von oben.");
  return t;
}

export async function textAusDateien(files: File[]): Promise<string> {
  const teile: string[] = [];
  for (const f of files) teile.push(await textAusDatei(f));
  return teile.join("\n\n--- Nächste Seite ---\n\n");
}
