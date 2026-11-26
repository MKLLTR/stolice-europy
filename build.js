// Generuje statyczną stronę z notatek w ../Stolice_Europy/*.md
// Użycie: node build.js
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'Stolice_Europy');
const OUT = path.join(__dirname, 'public');

const REGIONY = {
  'Północna': ['Kopenhaga', 'Tallinn', 'Helsinki', 'Reykjavik', 'Ryga', 'Wilno', 'Oslo', 'Sztokholm', 'Dublin', 'Londyn'],
  'Zachodnia': ['Bruksela', 'Paryż', 'Amsterdam', 'Luksemburg', 'Monako'],
  'Środkowa': ['Wiedeń', 'Praga', 'Vaduz', 'Berlin', 'Warszawa', 'Bratysława', 'Lublana', 'Berno', 'Budapeszt'],
  'Południowa': ['Andora', 'Nikozja', 'Ateny', 'Madryt', 'Valletta', 'Lizbona', 'San Marino', 'Watykan', 'Rzym'],
  'Bałkany': ['Tirana', 'Sarajewo', 'Sofia', 'Zagrzeb', 'Podgorica', 'Skopje', 'Belgrad', 'Prisztina'],
  'Wschodnia': ['Mińsk', 'Kiszyniów', 'Moskwa', 'Kijów', 'Bukareszt'],
};
const regionOf = (city) => Object.keys(REGIONY).find((r) => REGIONY[r].includes(city)) || 'Inne';

// --- flagi (uproszczone, w CSS) ---
const stripes = (dir, cols) => {
  const n = cols.length;
  return `linear-gradient(${dir}, ${cols.map((c, i) => `${c} ${(i * 100) / n}% ${((i + 1) * 100) / n}%`).join(', ')})`;
};
const H = (...c) => stripes('to bottom', c);
const V = (...c) => stripes('to right', c);
const nordic = (bg, cross, inner) => {
  const bar = (c, a, b, dir) => `linear-gradient(${dir}, transparent ${a}%, ${c} ${a}% ${b}%, transparent ${b}%)`;
  const layers = [];
  if (inner) layers.push(bar(inner, 31, 37, 'to right'), bar(inner, 45, 55, 'to bottom'));
  layers.push(bar(cross, 28, 40, 'to right'), bar(cross, 40, 60, 'to bottom'), bg);
  return layers.join(', ');
};
const FLAGS = {
  'Albania': 'radial-gradient(ellipse 16% 32% at 50% 50%, #000 92%, transparent 100%), #E41E20',
  'Andora': V('#10069F', '#FEDF00', '#D50032'),
  'Austria': H('#C8102E', '#fff', '#C8102E'),
  'Belgia': V('#000', '#FDDA24', '#EF3340'),
  'Białoruś': H('#C8313E', '#C8313E', '#4AA657'),
  'Bośnia i Hercegowina': 'linear-gradient(to bottom left, transparent 50%, #002395 50%) 30% 0 / 35% 100% no-repeat, linear-gradient(#FECB00, #FECB00) 30% 0 / 35% 100% no-repeat, #002395',
  'Bułgaria': H('#fff', '#00966E', '#D62612'),
  'Chorwacja': H('#FF0000', '#fff', '#171796'),
  'Cypr': 'radial-gradient(ellipse 30% 16% at 50% 45%, #D57800 92%, transparent 100%), radial-gradient(ellipse 18% 6% at 50% 72%, #4E5B31 92%, transparent 100%), #fff',
  'Czarnogóra': 'linear-gradient(#C40308, #C40308) center / calc(100% - 12px) calc(100% - 12px) no-repeat, radial-gradient(circle at 50% 50%, #D4AF37 0 16%, transparent 17%), #D4AF37',
  'Czechy': 'linear-gradient(to bottom right, #11457E 50%, transparent 50%) 0 0 / 45% 50% no-repeat, linear-gradient(to top right, #11457E 50%, transparent 50%) 0 100% / 45% 50% no-repeat, linear-gradient(#fff 50%, #D7141A 50%)',
  'Dania': nordic('#C8102E', '#fff'),
  'Estonia': H('#0072CE', '#000', '#fff'),
  'Finlandia': nordic('#fff', '#002F6C'),
  'Francja': V('#002395', '#fff', '#ED2939'),
  'Grecja': 'repeating-linear-gradient(to bottom, #0D5EAF 0 11.11%, #fff 11.11% 22.22%)',
  'Hiszpania': H('#AA151B', '#F1BF00', '#F1BF00', '#AA151B'),
  'Holandia': H('#AE1C28', '#fff', '#21468B'),
  'Irlandia': V('#169B62', '#fff', '#FF883E'),
  'Islandia': nordic('#02529C', '#fff', '#DC1E35'),
  'Liechtenstein': H('#002B7F', '#CE1126'),
  'Litwa': H('#FDB913', '#006A44', '#C1272D'),
  'Luksemburg': H('#EF3340', '#fff', '#00A3E0'),
  'Łotwa': H('#9E3039', '#9E3039', '#fff', '#9E3039', '#9E3039'),
  'Macedonia Północna': 'radial-gradient(circle at 50% 50%, #FFE600 0 13%, #D20000 13.5% 16%, transparent 16.5%), repeating-conic-gradient(from -8deg at 50% 50%, #FFE600 0 16deg, #D20000 16deg 45deg)',
  'Malta': V('#fff', '#CF142B'),
  'Mołdawia': V('#0046AE', '#FFD200', '#CC092F'),
  'Monako': H('#CE1126', '#fff'),
  'Niemcy': H('#000', '#DD0000', '#FFCE00'),
  'Norwegia': nordic('#BA0C2F', '#fff', '#00205B'),
  'Polska': H('#fff', '#DC143C'),
  'Portugalia': 'radial-gradient(circle at 40% 50%, #FFE900 0 14%, transparent 15%), linear-gradient(to right, #046A38 40%, #DA291C 40%)',
  'Rosja': H('#fff', '#0039A6', '#D52B1E'),
  'Rumunia': V('#002B7F', '#FCD116', '#CE1126'),
  'San Marino': H('#fff', '#5EB6E4'),
  'Serbia': H('#C6363C', '#0C4076', '#fff'),
  'Słowacja': H('#fff', '#0B4EA2', '#EE1C25'),
  'Słowenia': H('#fff', '#005DA4', '#ED1C24'),
  'Szwajcaria': 'linear-gradient(#fff, #fff) center / 18px 56px no-repeat, linear-gradient(#fff, #fff) center / 56px 18px no-repeat, #DA291C',
  'Szwecja': nordic('#006AA7', '#FECC02'),
  'Ukraina': H('#0057B7', '#FFD700'),
  'Watykan': V('#FFE000', '#fff'),
  'Węgry': H('#CD2A3E', '#fff', '#436F4D'),
  'Wielka Brytania': 'linear-gradient(#C8102E, #C8102E) center / 100% 12% no-repeat, linear-gradient(#C8102E, #C8102E) center / 7% 100% no-repeat, linear-gradient(#fff, #fff) center / 100% 22% no-repeat, linear-gradient(#fff, #fff) center / 13% 100% no-repeat, linear-gradient(to top right, transparent 46%, #C8102E 46% 49%, #fff 49% 54%, transparent 54%), linear-gradient(to bottom right, transparent 46%, #fff 46% 51%, #C8102E 51% 54%, transparent 54%), #012169',
  'Włochy': V('#009246', '#fff', '#CE2B37'),
  'Kosowo': 'radial-gradient(ellipse 22% 26% at 50% 55%, #D0A650 92%, transparent 100%), #244AA5',
};

// --- godła: lokalne kopie w godla/ (pobiera je pobierz_godla.js) ---
const { COA, coaFile } = require('./godla');
const COA_DIR = path.join(__dirname, 'godla');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// --- wczytanie notatek ---
const cities = fs.readdirSync(SRC)
  .filter((f) => f.endsWith('.md'))
  .map((file) => {
    const raw = fs.readFileSync(path.join(SRC, file), 'utf8').replace(/\r/g, '');
    const lines = raw.split('\n');
    const m = lines[0].match(/^#\s+(.+?)\s+\((.+)\)\s*$/);
    if (!m) throw new Error(`Nieprawidłowy nagłówek w ${file}`);
    const body = lines.slice(1).join(' ').replace(/\s+/g, ' ').trim();
    // Zdanie z ostrzeżeniem MSZ wyświetlamy osobno jako uwagę.
    // Nie dzielimy po skrótach typu „św.”, „m.in.”, „np.”.
    const parts = body.split(/(?<![\s(](?:św|St|m\.in|np|ok|ul|tzw)\.)(?<=[.!?])\s+(?=[A-ZĄĆĘŁŃÓŚŹŻ])/);
    const notice = parts.filter((p) => /MSZ/.test(p));
    const text = parts.filter((p) => !/MSZ/.test(p));
    const slug = file.replace(/\.md$/, '').toLowerCase();
    const flag = FLAGS[m[2]];
    if (!flag) throw new Error(`Brak flagi dla kraju: ${m[2]}`);
    if (!COA[m[2]]) throw new Error(`Brak godła dla kraju: ${m[2]}`);
    if (!fs.existsSync(path.join(COA_DIR, coaFile(m[2])))) throw new Error(`Brak pliku godła dla kraju: ${m[2]} – uruchom: node pobierz_godla.js`);
    return { city: m[1], country: m[2], slug, lead: text[0], text, notice, flag, region: regionOf(m[1]) };
  })
  .sort((a, b) => a.city.localeCompare(b.city, 'pl'));

// --- wspólne elementy ---
const CSS = `
:root{--bg:#f6f4ef;--surface:#fffdf8;--ink:#1d2330;--muted:#5d6473;--line:#e3ddd0;--accent:#1f4e8c;--accent-soft:#e4ecf7;--warn-bg:#fff4dc;--warn-ink:#7a4b00;--shadow:0 1px 2px rgba(0,0,0,.05),0 6px 20px rgba(0,0,0,.05)}
@media (prefers-color-scheme:dark){:root{--bg:#14171d;--surface:#1c2029;--ink:#eceae4;--muted:#a3a9b6;--line:#2d3340;--accent:#8fb4ec;--accent-soft:#243145;--warn-bg:#3a2e14;--warn-ink:#f4cf87;--shadow:none}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.65 "Source Sans 3",system-ui,-apple-system,"Segoe UI",sans-serif}
a{color:var(--accent)}
.wrap{max-width:1120px;margin:0 auto;padding:0 16px}
header.site{border-bottom:1px solid var(--line);background:var(--surface)}
header.site .wrap{display:flex;align-items:center;justify-content:space-between;height:60px}
.brand{font-family:"Fraunces",Georgia,serif;font-weight:600;font-size:1.2rem;text-decoration:none;color:var(--ink)}
.brand span{color:var(--accent)}
h1,h2{font-family:"Fraunces",Georgia,serif;font-weight:600;line-height:1.15;margin:0}
.hero{padding:56px 0 28px}
.hero h1{font-size:clamp(2rem,5vw,3.2rem);max-width:16ch}
.hero p{color:var(--muted);max-width:60ch;font-size:1.1rem;margin:14px 0 0}
.tools{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:8px 0 24px;position:sticky;top:0;background:var(--bg);z-index:2}
.tools input{flex:1 1 240px;min-width:0;padding:11px 14px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink);font:inherit}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:7px 12px;border-radius:999px;font:inherit;font-size:.9rem;cursor:pointer}
.chip[aria-pressed=true]{background:var(--accent);border-color:var(--accent);color:var(--bg)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;padding-bottom:64px}
.card{display:flex;flex-direction:column;padding:0 8px 8px;border:1px solid var(--line);border-radius:14px;text-decoration:none;color:var(--ink);box-shadow:var(--shadow);transition:transform .15s,box-shadow .15s;overflow:hidden}
.card[hidden]{display:none}
.card:hover,.card:focus-visible{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,.18)}
.card .flagspace{height:84px;flex:none;display:flex;align-items:center;justify-content:flex-end}
.coa{flex:none;width:64px;height:64px;padding:6px;object-fit:contain;background:#fff;border-radius:14px;box-shadow:0 2px 10px rgba(0,0,0,.25)}
.banner{display:flex;align-items:center;padding:0 20px}
.banner .coa{width:104px;height:104px;padding:10px;border-radius:18px}
.card .body{flex:1;display:flex;flex-direction:column;gap:6px;padding:14px 14px 16px;background:color-mix(in srgb,var(--surface) 84%,transparent);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-radius:9px;box-shadow:0 0 0 1px rgba(0,0,0,.06)}
.card h2{font-size:1.35rem}
.banner{height:140px;border-radius:14px;border:1px solid var(--line);margin:18px 0 8px}
.meta{font-size:.85rem;color:var(--muted);display:flex;gap:8px;align-items:center}
.tag{background:var(--accent-soft);color:var(--accent);padding:1px 8px;border-radius:999px;font-size:.78rem}
.card p{margin:4px 0 0;color:var(--muted);font-size:.95rem}
.empty{color:var(--muted);padding:24px 0 64px}
article{max-width:720px;padding:40px 0 64px}
article h1{font-size:clamp(2.2rem,6vw,3.4rem);margin-top:10px}
article .lead{font-size:1.25rem;margin:22px 0 10px}
article ul{padding-left:1.2em;margin:0}
article li{margin:8px 0}
.notice{margin-top:24px;padding:14px 16px;border-radius:10px;background:var(--warn-bg);color:var(--warn-ink)}
.pager{display:flex;justify-content:space-between;gap:12px;margin-top:40px;padding-top:20px;border-top:1px solid var(--line)}
.pager a{text-decoration:none}
footer{border-top:1px solid var(--line);color:var(--muted);font-size:.85rem;padding:20px 0}
`;

const head = (title, desc, prefix) => `<!doctype html>
<html lang="pl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${prefix}style.css">
</head><body>
<header class="site"><div class="wrap"><a class="brand" href="${prefix}index.html">Stolice <span>Europy</span></a><span class="meta">${cities.length} miast</span></div></header>`;

const foot = `<footer><div class="wrap">Notatki turystyczne o stolicach Europy. Przed podróżą sprawdź aktualne komunikaty MSZ.</div></footer></body></html>`;

// --- strona główna ---
const regions = Object.keys(REGIONY);
const index = `${head('Stolice Europy', 'Krótkie, zachęcające notatki turystyczne o stolicach Europy.', '')}
<main class="wrap">
<section class="hero"><h1>Odkryj stolice Europy</h1>
<p>${cities.length} miast, od Reykjaviku po Nikozję. Każda notatka to kilka zdań, które pomogą Ci wybrać następny kierunek podróży.</p></section>
<div class="tools">
<input id="q" type="search" placeholder="Szukaj miasta, kraju lub atrakcji…" aria-label="Szukaj">
<div class="chips" role="group" aria-label="Region">
<button class="chip" data-r="" aria-pressed="true">Wszystkie</button>
${regions.map((r) => `<button class="chip" data-r="${esc(r)}" aria-pressed="false">${esc(r)}</button>`).join('\n')}
</div></div>
<div class="grid" id="grid">
${cities.map((c) => `<a class="card" style="background:${esc(c.flag)}" href="miasta/${c.slug}.html" data-r="${esc(c.region)}" data-s="${esc((c.city + ' ' + c.country + ' ' + c.text.join(' ')).toLowerCase())}">
<div class="flagspace"><img class="coa" src="godla/${coaFile(c.country)}" alt="Godło: ${esc(c.country)}" loading="lazy"></div>
<div class="body"><div class="meta">${esc(c.country)} <span class="tag">${esc(c.region)}</span></div>
<h2>${esc(c.city)}</h2><p>${esc(c.lead)}</p></div></a>`).join('\n')}
</div>
<p class="empty" id="empty" hidden>Brak wyników. Spróbuj innej frazy.</p>
</main>
<script>
(function(){
  var q=document.getElementById('q'),cards=[].slice.call(document.querySelectorAll('.card')),chips=[].slice.call(document.querySelectorAll('.chip')),empty=document.getElementById('empty'),region='';
  function apply(){var t=q.value.trim().toLowerCase(),n=0;cards.forEach(function(c){var ok=(!region||c.dataset.r===region)&&(!t||c.dataset.s.indexOf(t)>-1);c.hidden=!ok;if(ok)n++;});empty.hidden=n>0;}
  q.addEventListener('input',apply);
  chips.forEach(function(b){b.addEventListener('click',function(){region=b.dataset.r;chips.forEach(function(x){x.setAttribute('aria-pressed',x===b);});apply();});});
})();
</script>
${foot}`;

// --- podstrony miast ---
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'miasta'), { recursive: true });
fs.cpSync(COA_DIR, path.join(OUT, 'godla'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'style.css'), CSS.trim());
fs.writeFileSync(path.join(OUT, 'index.html'), index);

cities.forEach((c, i) => {
  const prev = cities[(i - 1 + cities.length) % cities.length];
  const next = cities[(i + 1) % cities.length];
  const html = `${head(`${c.city} – Stolice Europy`, c.lead, '../')}
<main class="wrap"><article>
<a href="../index.html">← Wszystkie stolice</a>
<div class="banner" style="background:${esc(c.flag)}"><img class="coa" src="../godla/${coaFile(c.country)}" alt="Godło: ${esc(c.country)}"></div>
<div class="meta" style="margin-top:18px">${esc(c.country)} <span class="tag">${esc(c.region)}</span></div>
<h1>${esc(c.city)}</h1>
<p class="lead">${esc(c.lead)}</p>
<ul>${c.text.slice(1).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
${c.notice.map((n) => `<p class="notice">⚠ ${esc(n)}</p>`).join('')}
<nav class="pager"><a href="${prev.slug}.html">← ${esc(prev.city)}</a><a href="${next.slug}.html">${esc(next.city)} →</a></nav>
</article></main>
${foot}`;
  fs.writeFileSync(path.join(OUT, 'miasta', `${c.slug}.html`), html);
});

console.log(`Wygenerowano ${cities.length} podstron + index.html w ${OUT}`);
