import fs from 'fs'; import sharp from 'sharp'; import pngToIco from 'png-to-ico';
const out = process.argv[2];
const fox = (o,c,e) => `<polygon points="22,16 52,46 18,58" fill="${o}"/><polygon points="106,16 76,46 110,58" fill="${o}"/><polygon points="28,26 44,44 25,50" fill="${e}"/><polygon points="100,26 84,44 103,50" fill="${e}"/><polygon points="18,50 110,50 64,114" fill="${o}"/><polygon points="18,50 50,76 64,114" fill="${c}"/><polygon points="110,50 78,76 64,114" fill="${c}"/><polygon points="40,64 52,68 42,72" fill="${e}"/><polygon points="88,64 76,68 86,72" fill="${e}"/><polygon points="57,104 71,104 64,114" fill="${e}"/>`;
const mark = ({o='#E8702A',c='#F7F3EC',e='#1F2A36',lens='#F7F3EC',ring='#1F2A36',ok='#2E9E6B'}={}) =>
 `<g transform="translate(-6,-4) scale(.9)">${fox(o,c,e)}</g><circle cx="92" cy="92" r="20" fill="${lens}" fill-opacity=".85" stroke="${ring}" stroke-width="7"/><path d="M83 92l6 6 11-12" fill="none" stroke="${ok}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><line x1="106" y1="106" x2="122" y2="122" stroke="${ring}" stroke-width="9" stroke-linecap="round"/>`;
const svg = (w,h,b) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${b}</svg>\n`;
const wm = (t,f='#E8702A') => `<text x="140" y="82" font-family="Manrope, Inter, 'Segoe UI', Arial, sans-serif" font-size="52" letter-spacing="-1" fill="${t}">Nebenkosten<tspan font-weight="800" fill="${f}">Fuchs</tspan></text>`;
const dark = {e:'#1F2A36',ring:'#F7F3EC',lens:'#1F2A36'};
const mono = {o:'#1F2A36',c:'#FFFFFF',e:'#FFFFFF',lens:'#FFFFFF',ring:'#1F2A36',ok:'#1F2A36'};
const files = {
 'logo-mark.svg': svg(128,128,mark()),
 'logo-mark-dark.svg': svg(128,128,mark(dark)),
 'logo-mark-mono.svg': svg(128,128,mark(mono)),
 'logo.svg': svg(600,128,mark()+wm('#1F2A36')),
 'logo-dark.svg': svg(600,128,mark(dark)+wm('#F7F3EC')),
 'logo-mono.svg': svg(600,128,mark(mono)+wm('#1F2A36','#1F2A36')),
};
for (const [n,s] of Object.entries(files)) fs.writeFileSync(`${out}/${n}`, s);
const base = Buffer.from(files['logo-mark.svg']);
fs.mkdirSync(`${out}/icons`,{recursive:true});
const icon = (n,size) => sharp(base,{density:600}).resize(size,size).png().toFile(`${out}/icons/${n}`);
for (const s of [16,32,48]) await icon(`favicon-${s}.png`,s);
await icon('icon-192.png',192); await icon('icon-512.png',512);
const pad = async (n,size) => { const inner = Math.round(size*.72);
 const m = await sharp(base,{density:600}).resize(inner,inner).png().toBuffer();
 await sharp({create:{width:size,height:size,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:m,gravity:'center'}]).png().toFile(`${out}/icons/${n}`); };
await pad('apple-touch-icon.png',180); await pad('icon-maskable-512.png',512);
fs.writeFileSync(`${out}/icons/favicon.ico`, await pngToIco([16,32,48].map(s=>`${out}/icons/favicon-${s}.png`)));
const og = Buffer.from(svg(1200,630,`<rect width="1200" height="630" fill="#F7F3EC"/><g transform="translate(90,215) scale(1.6)">${mark()+wm('#1F2A36')}</g><text x="94" y="500" font-family="Manrope, Inter, 'Segoe UI', Arial, sans-serif" font-size="32" fill="#1F2A36" opacity=".75">Nebenkostenabrechnung prüfen. Kostenlos. Musterschreiben inklusive.</text>`));
await sharp(og).png().toFile(`${out}/og-default.png`);
console.log('ok');
