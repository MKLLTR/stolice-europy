// Pobiera miniatury godeł (PNG, 240 px) z Wikimedia Commons do folderu godla/.
// Użycie: node pobierz_godla.js   (pomija pliki, które już istnieją)
const fs = require('fs');
const path = require('path');
const { COA, coaFile } = require('./godla');

const DIR = path.join(__dirname, 'godla');
fs.mkdirSync(DIR, { recursive: true });

(async () => {
  let ok = 0, bad = 0;
  for (const [country, file] of Object.entries(COA)) {
    const dest = path.join(DIR, coaFile(country));
    if (fs.existsSync(dest)) { ok++; continue; }
    const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, '_'))}?width=240`;
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'capitals-site-builder/1.0' } });
      const type = r.headers.get('content-type') || '';
      if (!r.ok || !type.startsWith('image/png')) throw new Error(`HTTP ${r.status}, ${type}`);
      fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
      ok++;
    } catch (e) {
      bad++;
      console.log(`BŁĄD ${country}: ${e.message}`);
    }
    await new Promise((res) => setTimeout(res, 300));
  }
  console.log(`Gotowe: ${ok} zapisanych, ${bad} błędów`);
})();
