import type { Brief } from "./vorlagen";

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function alsPdf(b: Brief, dateiname: string) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const normal = await doc.embedFont(StandardFonts.Helvetica);
  const fett = await doc.embedFont(StandardFonts.HelveticaBold);
  const A4: [number, number] = [595.28, 841.89];
  const rand = 70;
  const breite = A4[0] - rand * 2;
  const groesse = 10.5;
  const zeilenhoehe = 15;
  let seite = doc.addPage(A4);
  let y = A4[1] - 60;

  const sauber = (t: string) => t.replace(/[„“]/g, '"').replace(/[‚‘’]/g, "'").replace(/[–—]/g, "-").replace(/…/g, "...").replace(/[^\x20-\x7E\xA0-\xFF€\n]/g, "");

  const umbrechen = (text: string, font = normal, max = breite) => {
    const zeilen: string[] = [];
    for (const absatz of sauber(text).split("\n")) {
      let z = "";
      for (const w of absatz.split(" ")) {
        const probe = z ? `${z} ${w}` : w;
        if (font.widthOfTextAtSize(probe, groesse) > max && z) {
          zeilen.push(z);
          z = w;
        } else z = probe;
      }
      zeilen.push(z);
    }
    return zeilen;
  };

  const schreibe = (text: string, opt: { font?: typeof normal; einzug?: number; abstand?: number; rechts?: boolean } = {}) => {
    const font = opt.font ?? normal;
    const einzug = opt.einzug ?? 0;
    for (const z of umbrechen(text, font, breite - einzug)) {
      if (y < 70) {
        seite = doc.addPage(A4);
        y = A4[1] - 60;
      }
      const x = opt.rechts ? A4[0] - rand - font.widthOfTextAtSize(z, groesse) : rand + einzug;
      seite.drawText(z, { x, y, size: groesse, font, color: rgb(0.1, 0.1, 0.12) });
      y -= zeilenhoehe;
    }
    y -= opt.abstand ?? 0;
  };

  seite.drawText(sauber(b.absender.join(" · ")), { x: rand, y, size: 8, font: normal, color: rgb(0.35, 0.35, 0.4) });
  y -= 40;
  for (const z of b.empfaenger) schreibe(z);
  y -= 30;
  schreibe(b.ortDatum, { rechts: true, abstand: 24 });
  schreibe(b.betreff, { font: fett, abstand: 14 });
  schreibe(b.anrede, { abstand: 8 });
  for (const a of b.absaetze) schreibe(a, { abstand: 8 });
  b.liste.forEach((l, i) => {
    const vorher = y;
    schreibe(`${i + 1}.`, {});
    y = vorher;
    schreibe(l, { einzug: 18, abstand: 6 });
  });
  y -= 4;
  for (const s of b.schluss) schreibe(s, { abstand: 8 });
  schreibe(b.gruss, { abstand: 36 });
  schreibe(b.unterschrift);

  const bytes = await doc.save();
  download(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${dateiname}.pdf`);
}

export async function alsDocx(b: Brief, dateiname: string) {
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import("docx");
  const p = (text: string, opt: { fett?: boolean; nach?: number; rechts?: boolean; groesse?: number } = {}) =>
    new Paragraph({
      alignment: opt.rechts ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: { after: opt.nach ?? 0 },
      children: text.split("\n").map((t, i) => new TextRun({ text: t, bold: opt.fett, break: i > 0 ? 1 : 0, size: opt.groesse })),
    });
  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 21 } } } },
    sections: [{
      properties: { page: { margin: { top: 1100, left: 1400, right: 1400, bottom: 1100 } } },
      children: [
        p(b.absender.join(" · "), { groesse: 16, nach: 500 }),
        ...b.empfaenger.map((z, i) => p(z, { nach: i === b.empfaenger.length - 1 ? 500 : 0 })),
        p(b.ortDatum, { rechts: true, nach: 400 }),
        p(b.betreff, { fett: true, nach: 240 }),
        p(b.anrede, { nach: 160 }),
        ...b.absaetze.map((a) => p(a, { nach: 160 })),
        ...b.liste.map((l) => new Paragraph({ numbering: { reference: "liste", level: 0 }, spacing: { after: 120 }, children: [new TextRun(l)] })),
        ...b.schluss.map((s) => p(s, { nach: 160 })),
        p(b.gruss, { nach: 700 }),
        p(b.unterschrift),
      ],
    }],
    numbering: { config: [{ reference: "liste", levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 360 } } } }] }] },
  });
  download(await Packer.toBlob(doc), `${dateiname}.docx`);
}
