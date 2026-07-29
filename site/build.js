#!/usr/bin/env node
/* Game Design Atlas — static site generator.
   Reads games/ + atlas/, writes _site/. No framework, one dependency (marked). */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { marked } = require('marked');

/* when was this file last committed? (tiebreaker for same-day entries; 0 if unknown) */
function gitTime(file) {
  try {
    return +execSync(`git log -1 --format=%at -- "${file}"`, { cwd: path.join(__dirname, '..'), stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim() || 0;
  } catch { return 0; }
}

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, '_site');

/* canonical feel vocabulary — the source of truth (mirrored in CONTRIBUTING.md).
   Add a word here first, then use it; the build warns on anything off-list or missing. */
const MOODS = ['tense', 'eerie', 'oppressive', 'melancholic', 'lonely', 'contemplative',
  'wondrous', 'dreamlike', 'cozy', 'playful', 'hopeful', 'tender'];
const PACES = ['slow', 'medium', 'fast'];
/* genre = the FORM of the game, anchored to standard Steam/IGDB terms (not moods/themes-as-vibes).
   Add here first, then use it; the build warns on off-list genres. */
const GENRES = ['action', 'adventure', 'co-op', 'comedy', 'detective', 'driving', 'experimental',
  'exploration', 'first-person', 'fishing', 'fps', 'historical', 'horror', 'immersive-sim',
  'management', 'metroidvania', 'multiplayer', 'music', 'narrative', 'open-world', 'physics',
  'platformer', 'point-and-click', 'post-apocalyptic', 'procedural', 'puzzle', 'roguelike', 'rpg',
  'sci-fi', 'slice-of-life', 'survival', 'thriller', 'walking-sim'];

/* ---------- helpers ---------- */
const read = f => fs.readFileSync(f, 'utf8');
const exists = f => fs.existsSync(f);
const listDirs = d => exists(d) ? fs.readdirSync(d, { withFileTypes: true })
  .filter(e => e.isDirectory()).map(e => e.name) : [];
const listFiles = (d, ext) => exists(d) ? fs.readdirSync(d)
  .filter(f => !ext || f.endsWith(ext)) : [];

function mkdirp(d) { fs.mkdirSync(d, { recursive: true }); }
function write(f, c) { mkdirp(path.dirname(f)); fs.writeFileSync(f, c); }
function copy(src, dst) { mkdirp(path.dirname(dst)); fs.copyFileSync(src, dst); }

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    let [, key, val] = kv;
    val = val.replace(/\s+#.*$/, '').trim();
    if (val.startsWith('[')) {
      meta[key] = val.replace(/^\[|\]$/g, '').split(',')
        .map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      meta[key] = val.replace(/^["']|["']$/g, '');
    }
  }
  return { meta, body: m[2] };
}

/* standalone-line YouTube URLs -> embedded players (timestamps supported) */
function embedYouTube(md) {
  return md.replace(
    /^(?:<)?(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})[^\s>]*)(?:>)?$/gm,
    (_, url, id) => {
      const t = url.match(/[?&](?:t|start)=(\d+)/);
      const start = t ? `?start=${t[1]}` : '';
      return `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${id}${start}" allowfullscreen loading="lazy"></iframe></div>`;
    });
}
const md2html = md => marked.parse(embedYouTube(md));

/* entry dressing: sequence paragraph -> mono flow-line; "New threads" list -> takeaway cards */
function dressEntry(html) {
  html = html.replace(/(<h2[^>]*>\s*Sequence\s*<\/h2>\s*)<p>([\s\S]*?)<\/p>/i, (m, h, body) =>
    h + '<p class="flow">' + body.replace(/→/g, '<span class="arr">→</span>') + '</p>');
  html = html.replace(/(<h3[^>]*>\s*New threads[\s\S]{0,80}?<\/h3>\s*)<ul>/i, '$1<ul class="threads">');
  return html;
}
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const title = s => String(s || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

/* ---------- load data ---------- */
const games = listDirs(path.join(ROOT, 'games')).map(slug => {
  const dir = path.join(ROOT, 'games', slug);
  const idx = parseFrontmatter(read(path.join(dir, 'index.md')));
  const entries = listFiles(dir, '.md').filter(f => f !== 'index.md').map(f => {
    const e = parseFrontmatter(read(path.join(dir, f)));
    return { file: f, slug: f.replace(/\.md$/, ''), meta: e.meta, body: e.body,
      added: gitTime(path.join('games', slug, f)) };
  }).sort((a, b) => String(b.meta.date).localeCompare(String(a.meta.date)) || b.added - a.added);
  const prototypes = listFiles(path.join(dir, 'prototypes'), '.html');
  const sketches = listFiles(path.join(dir, 'sketches')).filter(f => !f.startsWith('.'));
  return { slug, dir, meta: idx.meta, body: idx.body, entries, prototypes, sketches };
}).sort((a, b) => a.meta.title.localeCompare(b.meta.title));

const allEntries = games.flatMap(g => g.entries.map(e => ({ ...e, game: g })));

/* feel-vocabulary guardrail: warn (never fail) on missing or off-list mood/pace */
(function checkFeel() {
  const warns = [];
  for (const g of games) {
    const moods = g.meta.mood || [];
    if (!moods.length) warns.push(`${g.slug}: no mood`);
    for (const m of moods) if (!MOODS.includes(m)) warns.push(`${g.slug}: unknown mood "${m}" (see CONTRIBUTING.md)`);
    if (!g.meta.pace) warns.push(`${g.slug}: no pace`);
    else if (!PACES.includes(g.meta.pace)) warns.push(`${g.slug}: unknown pace "${g.meta.pace}"`);
    for (const t of g.meta.tags || []) if (!GENRES.includes(t)) warns.push(`${g.slug}: unknown genre "${t}" (see CONTRIBUTING.md)`);
  }
  if (warns.length) console.warn('⚠ feel vocabulary:\n  ' + warns.join('\n  '));
})();

const gameBySlug = Object.fromEntries(games.map(g => [g.slug, g]));
const lists = listFiles(path.join(ROOT, 'lists'), '.md').map(f => {
  const l = parseFrontmatter(read(path.join(ROOT, 'lists', f)));
  return { slug: f.replace(/\.md$/, ''), meta: l.meta, body: l.body };
}).sort((a, b) => String(a.meta.title || '').localeCompare(String(b.meta.title || '')));
const listsForGame = {};
for (const l of lists) for (const s of (l.meta.games || [])) (listsForGame[s] ??= []).push(l);

const wings = listDirs(path.join(ROOT, 'atlas')).map(w => {
  const dir = path.join(ROOT, 'atlas', w);
  const idx = parseFrontmatter(read(path.join(dir, 'index.md')));
  const topics = listFiles(path.join(dir, 'topics'), '.md').map(f => {
    const t = parseFrontmatter(read(path.join(dir, 'topics', f)));
    return { slug: f.replace(/\.md$/, ''), meta: t.meta, body: t.body };
  }).sort((a, b) => (+a.meta.order || 99) - (+b.meta.order || 99));
  const patterns = listFiles(path.join(dir, 'patterns'), '.md').map(f => {
    const p = parseFrontmatter(read(path.join(dir, 'patterns', f)));
    return { slug: f.replace(/\.md$/, ''), meta: p.meta, body: p.body };
  }).sort((a, b) => String(a.meta.pattern).localeCompare(String(b.meta.pattern)));
  return { slug: w, meta: idx.meta, body: idx.body, topics, patterns };
}).sort((a, b) => (b.topics.length + b.patterns.length) - (a.topics.length + a.patterns.length));

/* ---------- layout ---------- */
function page(titleText, active, content, depth = 0, bodyClass = '', desc = '', image = '', ogTitle = '') {
  const p = '../'.repeat(depth);
  const wingKeys = wings.map(w => w.slug);
  const nav = [
    ['index.html', 'Games', 'games'],
    ['lists.html', 'Lists', 'lists'],
    ['atlas/index.html', 'Knowledge', 'atlas'],
    ['diary.html', 'Log', 'diary'],
    ['to-play.html', 'To Play', 'to-play'],
  ].map(([href, label, key]) => {
    const on = key === active || (key === 'atlas' && wingKeys.includes(active));
    return `<a href="${p}${href}"${on ? ' class="active"' : ''}>${label}</a>`;
  }).join('');
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(titleText)} — Game Design Atlas</title>
<link rel="icon" href="${p}favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Game Design Atlas">
<meta property="og:title" content="${esc(ogTitle || titleText)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(ogTitle || titleText)}">
${desc ? `<meta name="description" content="${esc(desc)}">
<meta property="og:description" content="${esc(desc)}">
<meta name="twitter:description" content="${esc(desc)}">` : ''}
${image ? `<meta property="og:image" content="${esc(image)}">
<meta name="twitter:image" content="${esc(image)}">` : ''}
<link rel="stylesheet" href="${p}style.css"></head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}><header><a class="brand" href="${p}index.html"><img class="brand-mark" src="${p}mark.svg" alt="" width="20" height="20">game design atlas</a><nav>${nav}</nav><button class="nav-search" data-open-search aria-label="Search the atlas">search ( / )</button></header>
<main>${content}</main>
<footer>schmenz &amp; Jachym — play, record, prototype.</footer>
<script>window.SEARCH_BASE=${JSON.stringify(p)}</script>
<script src="${p}search-index.js" defer></script>
<script src="${p}search.js" defer></script>
</body></html>`;
}

const typeLabel = { 'reverse-engineering': 'Reverse Engineering', 'rebuild-fragment': 'Rebuild Fragment', 'topic-case-study': 'Case Study' };
const chip = (txt, cls = '') => `<span class="chip ${cls}">${esc(txt)}</span>`;

/* lookup maps so tags can link to their pages (cross-wing safe) */
const topicWing = {}, patternRef = {};
for (const w of wings) {
  for (const t of w.topics) topicWing[t.slug] ??= w.slug;
  for (const p of w.patterns) patternRef[p.meta.pattern] ??= { wing: w.slug, slug: p.slug };
}
const topicChip = (t, p) => topicWing[t]
  ? `<a class="chip" href="${p}atlas/${topicWing[t]}/topics/${t}.html">${esc(title(t))}</a>`
  : chip(title(t));
const patternChip = (id, p) => patternRef[id]
  ? `<a class="chip pp" href="${p}atlas/${patternRef[id].wing}/patterns/${patternRef[id].slug}.html">${esc(id)}</a>`
  : chip(id, 'pp');
/* pattern title with its code stripped, so the human-readable name can lead (code shown separately) */
const patName = p => {
  const code = p.meta.pattern || '';
  const re = new RegExp('^' + code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*[—–-]\\s*');
  return (p.meta.title || '').replace(re, '').trim() || p.meta.title || code;
};

/* cover art: local cover.jpg wins, else Steam CDN, else none.
   localPath = how to reach games/<slug>/cover.jpg from the page being rendered */
function coverUrl(g, localPath) {
  if (exists(path.join(g.dir, 'cover.jpg'))) {
    copy(path.join(g.dir, 'cover.jpg'), path.join(OUT, 'games', g.slug, 'cover.jpg'));
    return localPath;
  }
  if (g.meta.cover) return g.meta.cover;   // full URL override from frontmatter
  if (g.meta.steam) return `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.meta.steam}/library_600x900.jpg`;
  return null;
}
/* steam covers fall back: vertical art -> header.jpg -> no image */
const coverImg = (url, cls) => url
  ? `<img class="${cls}${url.includes('header') ? ' wide' : ''}" loading="lazy" src="${url}" alt="" onerror="if(this.src.includes('library_600x900')){this.src=this.src.replace('library_600x900','header');this.classList.add('wide')}else{this.remove()}">` : '';

/* grid tile: a uniform 2:3 frame. Any art is cropped to fit; when there's no cover,
   the title shows as a typographic fallback so no tile is ever blank or mis-shaped. */
const coverTile = (url, titleText) => {
  const img = url
    ? `<img loading="lazy" src="${url}" alt="" onerror="if(this.src.includes('library_600x900')){this.src=this.src.replace('library_600x900','header')}else{this.remove()}">`
    : '';
  return `<span class="cover-frame"><span class="ph" aria-hidden="true">${esc(titleText)}</span>${img}</span>`;
};

/* absolute cover URL for link-preview (og:image) meta — must be absolute, not page-relative */
const SITE = 'https://yschmenz.github.io/game-design-atlas';
const ogImage = g => {
  if (exists(path.join(g.dir, 'cover.jpg'))) return `${SITE}/games/${g.slug}/cover.jpg`;
  if (g.meta.cover) return g.meta.cover;
  if (g.meta.steam) return `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.meta.steam}/library_600x900.jpg`;
  return '';
};

/* related games: rank the rest of the library by shared genre / mood / topic (+ same pace) */
const relatedGames = (g, n = 6) => {
  const gt = new Set(g.meta.tags || []), gm = new Set(g.meta.mood || []);
  const gtop = new Set(g.entries.flatMap(e => e.meta.topics || []));
  return games.filter(x => x.slug !== g.slug).map(x => {
    let s = 0;
    for (const t of (x.meta.tags || [])) if (gt.has(t)) s += 2;
    for (const m of (x.meta.mood || [])) if (gm.has(m)) s += 2;
    for (const t of new Set(x.entries.flatMap(e => e.meta.topics || []))) if (gtop.has(t)) s += 1;
    if (g.meta.pace && x.meta.pace === g.meta.pace) s += 1;
    return { x, s };
  }).filter(o => o.s > 0).sort((a, b) => b.s - a.s || a.x.meta.title.localeCompare(b.x.meta.title)).slice(0, n).map(o => o.x);
};

/* quiet monochrome line icons for wings (inline, no icon font) — used by hub + wing pages */
const _svgIcon = body => `<svg class="wicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const wingIcon = {
  map: _svgIcon(`<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14"/><path d="M15 6v14"/>`),
  adjustments: _svgIcon(`<path d="M4 6h10"/><path d="M18 6h2"/><circle cx="16" cy="6" r="2"/><path d="M4 12h4"/><path d="M12 12h8"/><circle cx="10" cy="12" r="2"/><path d="M4 18h10"/><path d="M18 18h2"/><circle cx="16" cy="18" r="2"/>`),
  wave: _svgIcon(`<path d="M3 9v6"/><path d="M7 5v14"/><path d="M11 8v8"/><path d="M15 4v16"/><path d="M19 7v10"/>`),
  book: _svgIcon(`<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M19 17H6a2 2 0 0 0-2 2"/>`),
};

/* ---------- home: games grid with filters ---------- */
(function buildHome() {
  /* per-value counts (how many games match), used for filter scent + sorting */
  const tagCount = t => games.filter(g => (g.meta.tags || []).includes(t)).length;
  const topicCount = t => games.filter(g => g.entries.some(e => (e.meta.topics || []).includes(t))).length;
  const moodCount = m => games.filter(g => (g.meta.mood || []).includes(m)).length;
  const statusCount = s => games.filter(g => (g.meta.status || 'to-play') === s).length;
  const paceCount = p => games.filter(g => g.meta.pace === p).length;
  const authorCount = a => games.filter(g => g.meta['added-by'] === a || g.entries.some(e => e.meta.author === a)).length;
  const bySort = cnt => (a, b) => cnt(b) - cnt(a) || a.localeCompare(b);
  const topicsInUse = [...new Set(allEntries.flatMap(e => e.meta.topics || []))].sort(bySort(topicCount));
  const authors = [...new Set([...games.map(g => g.meta['added-by']),
    ...allEntries.map(e => e.meta.author)].filter(Boolean))].sort();
  const gameTags = [...new Set(games.flatMap(g => g.meta.tags || []))].sort(bySort(tagCount));
  const gameMoods = [...new Set(games.flatMap(g => g.meta.mood || []))].sort(bySort(moodCount));
  const paces = ['slow', 'medium', 'fast'].filter(p => games.some(g => g.meta.pace === p));
  /* one filter row. long (searchable) facets get a type-to-filter box + top values; short ones show inline. */
  const VISIBLE = 8;
  const filterRow = (label, f, vals, cnt, { fmt = x => x, searchable = false } = {}) => {
    const btn = (v, hidden) => `<button data-f="${f}" data-v="${esc(v)}"${hidden ? ' class="hid"' : ''}>${esc(fmt(v))} <span class="fcount">${cnt(v)}</span></button>`;
    const all = `<button data-f="${f}" data-v="all" class="on">all</button>`;
    const inline = vals.map(v => btn(v)).join('');
    if (searchable && vals.length > VISIBLE) {
      const btns = vals.map((v, i) => btn(v, i >= VISIBLE)).join('');
      return `<div class="frow"><b>${label}</b><div class="fvals">${all}<input class="facet-search" placeholder="filter ${vals.length}…" aria-label="Filter ${label}" autocomplete="off">${btns}<button class="facet-more" type="button" data-n="${vals.length}">show all ${vals.length}</button></div></div>`;
    }
    return `<div class="frow"><b>${label}</b><div class="fvals">${all}${inline}</div></div>`;
  };
  const filters = `
  <div class="filters" id="filters">
    ${filterRow('Status', 'status', ['to-play', 'playing', 'recorded'], statusCount)}
    ${filterRow('Mood', 'mood', gameMoods, moodCount)}
    ${filterRow('Pace', 'pace', paces, paceCount)}
    ${filterRow('Author', 'author', authors, authorCount)}
    <div class="fdiv"></div>
    ${filterRow('Genre', 'tag', gameTags, tagCount, { searchable: true })}
    ${filterRow('Topic', 'topic', topicsInUse, topicCount, { fmt: title, searchable: true })}
  </div>`;
  const cards = games.map(g => {
    const topics = [...new Set(g.entries.flatMap(e => e.meta.topics || []))];
    const auths = [...new Set([g.meta['added-by'], ...g.entries.map(e => e.meta.author)].filter(Boolean))];
    const n = g.entries.length, np = g.prototypes.length;
    /* everything the search box matches against, one lowercased haystack */
    const searchText = [g.meta.title, g.meta.summary, ...(g.meta.tags || []),
      ...(g.meta.mood || []), g.meta.pace, ...topics.map(title), ...auths].filter(Boolean).join(' ').toLowerCase();
    return `<a class="card" href="games/${g.slug}/index.html" data-status="${esc(g.meta.status || 'to-play')}"
      data-topics="${topics.join(' ')}" data-authors="${auths.join(' ')}" data-tags="${(g.meta.tags || []).join(' ')}"
      data-moods="${(g.meta.mood || []).join(' ')}" data-pace="${esc(g.meta.pace || '')}"
      data-search="${esc(searchText)}">
      ${coverTile(coverUrl(g, `games/${g.slug}/cover.jpg`), g.meta.title)}
      <h3>${esc(g.meta.title)}</h3>
      <div class="meta">${chip(g.meta.status || 'to-play', 'st-' + (g.meta.status || 'to-play'))}
      ${g.meta['added-by'] ? chip('+ ' + g.meta['added-by'], 'author') : ''}
      ${n ? chip(n + (n > 1 ? ' entries' : ' entry')) : ''}${np ? chip(np + ' proto', 'proto') : ''}
      ${g.meta['recommended-by'] ? chip('★ ' + g.meta['recommended-by'], 'rec') : ''}</div></a>`;
  }).join('\n');
  const js = `<script>
  const searchBox = document.getElementById('search'), shown = document.getElementById('shown');
  const activeBar = document.getElementById('active-filters'), filters = document.getElementById('filters');
  /* how to read each facet's values off a card (multi-value facets return arrays) */
  const fieldOf = {
    status: c => [c.dataset.status], pace: c => [c.dataset.pace],
    tag: c => c.dataset.tags.split(' '), mood: c => c.dataset.moods.split(' '),
    topic: c => c.dataset.topics.split(' '), author: c => c.dataset.authors.split(' ')
  };
  function applyFilters() {
    /* selected values per facet; multi-select = OR within a facet, AND across facets */
    const sel = {};
    filters.querySelectorAll('button.on').forEach(x => { if (x.dataset.v !== 'all') (sel[x.dataset.f] = sel[x.dataset.f] || []).push(x.dataset.v); });
    const q = (searchBox.value || '').trim().toLowerCase();
    let count = 0;
    document.querySelectorAll('.card').forEach(c => {
      let ok = !q || c.dataset.search.includes(q);
      for (const f in sel) { if (!ok) break; const vals = fieldOf[f](c); ok = sel[f].some(v => vals.indexOf(v) >= 0); }
      c.style.display = ok ? '' : 'none'; if (ok) count++;
    });
    shown.textContent = count;
    let h = '';
    for (const f in sel) sel[f].forEach(v => h += '<button class="af-chip" data-clear="' + f + '|' + v + '">' + v + ' ✕</button>');
    if (q) h += '<button class="af-chip" data-clear="__q">“' + q + '” ✕</button>';
    if (h) h = '<span class="af-label">active</span>' + h + '<button class="af-clear" data-clear="__all">clear all</button>';
    activeBar.innerHTML = h; activeBar.hidden = !h;
  }
  /* the "all" chip in a facet is on iff no value in that facet is selected */
  function syncAll(f) {
    const anyOn = [...filters.querySelectorAll('button[data-f="' + f + '"]')].some(x => x.dataset.v !== 'all' && x.classList.contains('on'));
    filters.querySelector('button[data-f="' + f + '"][data-v="all"]').classList.toggle('on', !anyOn);
  }
  filters.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.dataset.f === undefined) return;
    const f = b.dataset.f;
    if (b.dataset.v === 'all') filters.querySelectorAll('button[data-f="' + f + '"]').forEach(x => x.classList.toggle('on', x.dataset.v === 'all'));
    else { b.classList.toggle('on'); b.classList.remove('hid'); syncAll(f); }
    applyFilters();
  });
  function applyFacet(fvals) {
    const inp = fvals.querySelector('.facet-search'), more = fvals.querySelector('.facet-more');
    const qq = (inp.value || '').trim().toLowerCase(), exp = fvals.classList.contains('exp');
    fvals.querySelectorAll('button[data-f]:not([data-v="all"])').forEach((b, i) => {
      const show = qq ? b.dataset.v.toLowerCase().indexOf(qq) >= 0 : (exp || i < ${VISIBLE});
      b.classList.toggle('hid', !show);
    });
    if (more) more.style.display = qq ? 'none' : '';
  }
  filters.querySelectorAll('.facet-search').forEach(inp => inp.addEventListener('input', () => applyFacet(inp.parentNode)));
  filters.querySelectorAll('.facet-more').forEach(mb => mb.addEventListener('click', () => {
    const fvals = mb.parentNode, exp = fvals.classList.toggle('exp');
    mb.textContent = exp ? 'show less' : 'show all ' + mb.dataset.n;
    applyFacet(fvals);
  }));
  activeBar.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const c = b.dataset.clear;
    if (c === '__all') {
      filters.querySelectorAll('button.on').forEach(x => x.classList.remove('on'));
      filters.querySelectorAll('button[data-v="all"]').forEach(x => x.classList.add('on'));
      searchBox.value = '';
    } else if (c === '__q') { searchBox.value = ''; }
    else {
      const i = c.indexOf('|'), f = c.slice(0, i), v = c.slice(i + 1);
      const btn = filters.querySelector('button[data-f="' + f + '"][data-v="' + v + '"]');
      if (btn) { btn.classList.remove('on'); syncAll(f); }
    }
    applyFilters();
  });
  searchBox.addEventListener('input', applyFilters);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.activeElement === searchBox) { searchBox.value = ''; applyFilters(); searchBox.blur(); }
  });
  const ft = document.getElementById('filter-toggle');
  const openFilters = open => {
    filters.classList.toggle('open', open); ft.classList.toggle('open', open);
    ft.textContent = open ? 'filter ▾' : 'filter ▸'; ft.setAttribute('aria-expanded', open);
  };
  ft.addEventListener('click', () => openFilters(!filters.classList.contains('open')));
  /* deep link: index.html?tag=rpg&mood=eerie (works for any facet) */
  const params = new URLSearchParams(location.search);
  const touched = new Set();
  for (const [k, v] of params) {
    if (k === 'q') continue;
    const b = filters.querySelector('button[data-f="' + k + '"][data-v="' + v + '"]');
    if (b) { b.classList.add('on'); b.classList.remove('hid'); touched.add(k); }
  }
  touched.forEach(syncAll);
  if (params.get('q')) searchBox.value = params.get('q');
  if ([...params].filter(([k]) => k !== 'q').length) { openFilters(true); filters.scrollIntoView(); }
  applyFilters();
  const wanderUrls = [${games.map(g => `"games/${g.slug}/index.html"`).join(',')}];
  document.getElementById('wander').addEventListener('click', e => {
    e.preventDefault(); location.href = wanderUrls[Math.floor(Math.random() * wanderUrls.length)];
  });
  </script>`;
  const latest = allEntries.filter(e => e.meta.date)
    .sort((a, b) => String(b.meta.date).localeCompare(String(a.meta.date)) || b.added - a.added).slice(0, 6);
  const feed = latest.length ? `<h2>Latest entries</h2><div class="latest">` + latest.map(e => {
    const cover = coverUrl(e.game, `games/${e.game.slug}/cover.jpg`);
    return `<a class="lcard" href="games/${e.game.slug}/index.html#e-${e.slug}">
     ${cover ? `<img loading="lazy" src="${cover}" alt="" onerror="this.remove()">` : ''}
     <span><span class="lt">${esc(e.meta.title)}</span>
     <span class="lm">${esc(e.game.meta.title)} · ${esc(e.meta.author || '?')} · ${esc(e.meta.date).slice(0, 10)}${e.meta.status === 'draft' ? ' · draft' : ''}</span></span></a>`;
  }).join('') + `</div>` : '';
  write(path.join(OUT, 'index.html'), page('Games', 'games',
    `<h1>The Games <span class="count">${games.length}</span></h1>${feed}
     <div class="section-head"><h2>All games <span class="count" id="shown">${games.length}</span></h2>
     <input id="search" class="search" type="search" placeholder="filter games — mood, tag, topic, author" aria-label="Filter games" autocomplete="off" spellcheck="false">
     <button class="filter-toggle" id="filter-toggle" aria-expanded="false" aria-controls="filters">filter ▸</button>
     <a class="wander" id="wander" href="#" title="jump to a random game">wander →</a></div>
     ${filters}
     <div class="active-filters" id="active-filters" hidden></div>
     <div class="grid">${cards}</div>${js}`, 0, '', 'Field notes on play.', SITE + '/og-card.png', 'Game Design Atlas'));
})();

/* ---------- game pages ---------- */
for (const g of games) {
  const entriesHtml = g.entries.map(e => {
    const protos = (e.meta.prototypes || []).map(p =>
      `<div class="proto-embed"><div class="proto-bar"><span>▶ ${esc(p)}</span>
       <a href="prototypes/${p}" target="_blank">open fullscreen ↗</a></div>
       <iframe src="prototypes/${p}" loading="lazy"></iframe></div>`).join('');
    return `<article class="entry" id="e-${e.slug}">
      <div class="entry-head"><h2>${esc(e.meta.title || e.slug)}</h2>
      <p class="entry-meta">${esc(typeLabel[e.meta.type] || e.meta.type)}${e.meta.author ? ' · ' + esc(e.meta.author) : ''}${e.meta.date ? ' · ' + esc(String(e.meta.date).slice(0, 10)) : ''}${e.meta.status === 'draft' ? ' · <span class="draft-flag">draft</span>' : ''}</p>
      <div class="meta">${(e.meta.topics || []).map(t => topicChip(t, '../../')).join('')}
      ${(e.meta.patterns || []).map(p => patternChip(p, '../../')).join('')}</div></div>
      ${dressEntry(md2html(e.body))}${protos}</article>`;
  }).join('\n');
  const otherProtos = g.prototypes.filter(p => !g.entries.some(e => (e.meta.prototypes || []).includes(p)));
  const looseProtos = otherProtos.length ? `<h2>Prototypes</h2>` + otherProtos.map(p =>
    `<div class="proto-embed"><div class="proto-bar"><span>▶ ${esc(p)}</span>
     <a href="prototypes/${p}" target="_blank">open fullscreen ↗</a></div>
     <iframe src="prototypes/${p}" loading="lazy"></iframe></div>`).join('') : '';
  const body = g.body.replace(/<!--[\s\S]*?-->/g, '').trim();
  const related = relatedGames(g);
  const relatedBlock = related.length ? `<h2>Related games</h2><div class="grid grid-related">` + related.map(x =>
    `<a class="card" href="../${x.slug}/index.html">${coverTile(coverUrl(x, `../${x.slug}/cover.jpg`), x.meta.title)}<h3>${esc(x.meta.title)}</h3></a>`).join('') + `</div>` : '';
  /* in-page wayfinding: a jump-to-entry index when a game has more than one entry */
  const entryIndex = g.entries.length >= 2 ? `<nav class="entry-index" aria-label="Entries on this page">
    <h2>Entries <span class="count">${g.entries.length}</span></h2>
    <ol class="entry-index-list">${g.entries.map(e =>
      `<li><a href="#e-${e.slug}"><span class="ei-t">${esc(e.meta.title || e.slug)}</span><span class="ei-m">${esc(typeLabel[e.meta.type] || e.meta.type || '')}${e.meta.date ? ' · ' + esc(String(e.meta.date).slice(0, 10)) : ''}</span></a></li>`).join('')}</ol></nav>` : '';
  write(path.join(OUT, 'games', g.slug, 'index.html'), page(g.meta.title, 'games',
    `${coverImg(coverUrl(g, 'cover.jpg'), 'cover-page')}
     <h1>${esc(g.meta.title)}</h1>
     <div class="meta">${chip(g.meta.status || 'to-play', 'st-' + (g.meta.status || 'to-play'))}
     ${g.meta['added-by'] ? chip('added by ' + g.meta['added-by'], 'author') : ''}
     ${g.meta['recommended-by'] ? chip('★ recommended by ' + g.meta['recommended-by'], 'rec') : ''}</div>
     ${g.meta.summary ? `<p class="summary">${esc(g.meta.summary)}</p>` : ''}
     ${(g.meta.tags || []).length || (g.meta.mood || []).length || g.meta.pace ? `<div class="meta facets">${
       (g.meta.tags || []).map(t => `<a class="chip" href="../../index.html?tag=${encodeURIComponent(t)}">${esc(t)}</a>`).join('')
       }${(g.meta.mood || []).map(m => `<a class="chip mood" href="../../index.html?mood=${encodeURIComponent(m)}">${esc(m)}</a>`).join('')
       }${g.meta.pace ? `<a class="chip pace" href="../../index.html?pace=${encodeURIComponent(g.meta.pace)}">${esc(g.meta.pace)}</a>` : ''}</div>` : ''}
     ${(listsForGame[g.slug] || []).length ? `<p class="in-lists">In: ${listsForGame[g.slug].map(l =>
       `<a href="../../lists/${l.slug}.html">${esc(l.meta.title)}</a>`).join(', ')}</p>` : ''}
     ${body ? md2html(body) : ''}
     ${entryIndex}
     ${entriesHtml || '<p class="dim">Nothing recorded here yet. When we play it, the first note lands on this page — copy a template from <code>templates/</code> to start.</p>'}
     ${looseProtos}
     ${relatedBlock}`, 2, 'reading', g.meta.summary || '', ogImage(g)));
  for (const p of g.prototypes) copy(path.join(g.dir, 'prototypes', p), path.join(OUT, 'games', g.slug, 'prototypes', p));
  for (const s of g.sketches) copy(path.join(g.dir, 'sketches', s), path.join(OUT, 'games', g.slug, 'sketches', s));
}

/* ---------- wings, topics, patterns ---------- */
const entryWing = e => e.meta.wing || (e.meta.topics || []).map(t => topicWing[t]).find(Boolean);
const countLabel = n => `<span class="count" aria-label="${n} ${n > 1 ? 'entries' : 'entry'}">· ${n} ${n > 1 ? 'entries' : 'entry'}</span>`;
for (const w of wings) {
  /* the living front door: latest entries in this wing */
  const wingLatest = allEntries.filter(e => entryWing(e) === w.slug && e.meta.date)
    .sort((a, b) => String(b.meta.date).localeCompare(String(a.meta.date)) || b.added - a.added).slice(0, 3);
  const feed = wingLatest.length ? `<h2>Latest entries</h2><div class="latest">` + wingLatest.map(e => {
    const cover = coverUrl(e.game, `../../games/${e.game.slug}/cover.jpg`);
    return `<a class="lcard" href="../../games/${e.game.slug}/index.html#e-${e.slug}">
     ${cover ? `<img loading="lazy" src="${cover}" alt="" onerror="this.remove()">` : ''}
     <span><span class="lt">${esc(e.meta.title)}</span>
     <span class="lm">${esc(e.game.meta.title)} · ${esc(e.meta.author || '?')} · ${esc(String(e.meta.date)).slice(0, 10)}</span></span></a>`;
  }).join('') + `</div>` : '';
  /* lit spots: topics/patterns with entries glow, empty ones recede */
  const topicLi = t => {
    const n = allEntries.filter(e => (e.meta.topics || []).includes(t.slug)).length;
    return `<li${n ? ' class="lit"' : ''}><a href="topics/${t.slug}.html">${esc(t.meta.title)}</a>${n ? ' ' + countLabel(n) : ''}</li>`;
  };
  /* group core topics by cluster when the wing declares them (contiguous `order` ranges); else flat */
  const clusters = (w.meta.clusters || []).map(c => {
    const i = c.indexOf(':'); const [s, e] = c.slice(i + 1).split('-').map(Number);
    return { name: c.slice(0, i), s, e };
  });
  let topicList = '';
  if (w.topics.length && clusters.length) {
    topicList = `<h2>Core Topics</h2>` + clusters.map(c =>
      `<h3>${esc(c.name)}</h3><ol class="topic-list" start="${c.s}">` +
      w.topics.filter(t => +t.meta.order >= c.s && +t.meta.order <= c.e).map(topicLi).join('') + `</ol>`).join('');
  } else if (w.topics.length) {
    topicList = `<h2>Core Topics</h2><ol class="topic-list">` + w.topics.map(topicLi).join('') + `</ol>`;
  }
  const groups = {};
  for (const p of w.patterns) (groups[p.meta.group] ??= []).push(p);
  /* keep the "A. / B." prefix for ordering, drop it for display (matches the plain cluster labels) */
  const patternList = w.patterns.length ? `<h2>Pattern Library</h2>` + Object.entries(groups)
    .sort((a, b) => String(a[0]).localeCompare(String(b[0]))).map(([grp, ps]) =>
    `<h3>${esc(grp.replace(/^[A-Z]\.\s*/, ''))}</h3><ul class="pattern-list">` + ps.map(p => {
      const n = allEntries.filter(e => (e.meta.patterns || []).includes(p.meta.pattern)).length;
      return `<li${n ? ' class="lit"' : ''}><a href="patterns/${p.slug}.html">${esc(patName(p))}</a> <span class="pcode">${esc(p.meta.pattern)}</span>${n ? ' ' + countLabel(n) : ''}</li>`;
    }).join('') + `</ul>`).join('') : '';
  const provenance = w.body.replace(/<!--[\s\S]*?-->/g, '').trim();
  write(path.join(OUT, 'atlas', w.slug, 'index.html'), page(w.meta.title || title(w.slug), w.slug,
    `<p class="crumb"><a href="../index.html">Knowledge</a></p>
     <h1 class="wing-title">${wingIcon[w.meta.icon] || ''}${esc(w.meta.title || title(w.slug))}</h1>
     ${w.meta.summary ? `<p class="summary">${esc(w.meta.summary)}</p>` : ''}
     ${feed}${topicList}${patternList}
     ${provenance ? `<div class="provenance">${md2html(provenance)}</div>` : ''}`, 2));

  for (const t of w.topics) {
    const related = allEntries.filter(e => (e.meta.topics || []).includes(t.slug));
    const rel = related.length ? `<h2>Entries</h2><ul class="entry-list">` + related.map(e =>
      `<li><a href="../../../games/${e.game.slug}/index.html#e-${e.slug}">${esc(e.meta.title)}</a>
       <span class="dim">— ${esc(e.game.meta.title)}, ${esc(typeLabel[e.meta.type] || '')} by ${esc(e.meta.author || '?')}</span></li>`).join('') + `</ul>`
      : `<p class="dim">Nothing tagged <code>${t.slug}</code> yet.</p>`;
    write(path.join(OUT, 'atlas', w.slug, 'topics', t.slug + '.html'), page(t.meta.title, w.slug,
      `<p class="crumb"><a href="../../index.html">Knowledge</a> / <a href="../index.html">${esc(w.meta.title || title(w.slug))}</a></p>
       <h1>${esc(t.meta.title)}</h1>${md2html(t.body.replace(/<!--[\s\S]*?-->/g, ''))}${rel}`, 3, 'reading'));
  }
  for (const p of w.patterns) {
    const related = allEntries.filter(e => (e.meta.patterns || []).includes(p.meta.pattern));
    const rel = related.length ? `<h2>Entries & prototypes</h2><ul class="entry-list">` + related.map(e =>
      `<li><a href="../../../games/${e.game.slug}/index.html#e-${e.slug}">${esc(e.meta.title)}</a>
       <span class="dim">— ${esc(e.game.meta.title)} by ${esc(e.meta.author || '?')}</span></li>`).join('') + `</ul>`
      : `<p class="dim">Not run yet — copy <code>templates/prototype.html</code> and try it.</p>`;
    write(path.join(OUT, 'atlas', w.slug, 'patterns', p.slug + '.html'), page(p.meta.title, w.slug,
      `<p class="crumb"><a href="../../index.html">Knowledge</a> / <a href="../index.html">${esc(w.meta.title || title(w.slug))}</a></p>
       <h1 class="pattern-title">${esc(patName(p))} <span class="pcode">${esc(p.meta.pattern)}</span></h1>${md2html(p.body.replace(/<!--[\s\S]*?-->/g, ''))}${rel}`, 3, 'reading'));
  }
}

/* ---------- atlas hub: the four wings, one calm directory ---------- */
(function buildAtlasHub() {
  /* short blurb: first sentence of the wing's intro, capped (fallback when no summary) */
  const wingBlurb = w => {
    const txt = (w.body || '').replace(/<!--[\s\S]*?-->/g, '').trim();
    const para = (txt.split(/\n\s*\n/)[0] || '').replace(/\n/g, ' ').replace(/\*\*/g, '').replace(/\*/g, '').trim();
    let s = para;
    const m = para.match(/^(.*?\.)\s/);
    if (m && m[1].length >= 25) s = m[1];
    if (s.length > 140) s = s.slice(0, 139).replace(/\s+\S*$/, '') + '…';
    return s;
  };
  const wingEntryCount = w => allEntries.filter(e =>
    (e.meta.topics || []).some(t => topicWing[t] === w.slug) ||
    (e.meta.patterns || []).some(pp => patternRef[pp] && patternRef[pp].wing === w.slug)).length;

  const cards = wings.map(w => {
    const nt = w.topics.length, np = w.patterns.length, ne = wingEntryCount(w);
    const meta = [nt ? `${nt} topics` : '', np ? `${np} patterns` : '', ne ? `${ne} ${ne > 1 ? 'entries' : 'entry'}` : '']
      .filter(Boolean).join(' · ');
    return `<a class="wing" href="${w.slug}/index.html">
      <div class="wing-head">${wingIcon[w.meta.icon] || ''}<h2>${esc(w.meta.title || title(w.slug))}</h2></div>
      <p class="wing-blurb">${esc(w.meta.summary || wingBlurb(w))}</p>
      <p class="wing-meta">${meta}</p></a>`;
  }).join('\n');

  write(path.join(OUT, 'atlas', 'index.html'), page('Knowledge', 'atlas',
    `<h1>Knowledge</h1>
     <div class="wings">${cards}</div>`, 1));
})();

/* ---------- to-play: a cover-led status board (not a spreadsheet) ---------- */
(function buildQueue() {
  const label = { 'to-play': 'To play', playing: 'Playing', recorded: 'Recorded' };
  const byStatus = { 'to-play': [], playing: [], recorded: [] };
  for (const g of games) (byStatus[g.meta.status] || byStatus['to-play']).push(g);
  const shelf = st => {
    const gs = byStatus[st]; if (!gs.length) return '';
    const cards = gs.map(g => {
      const meta = [g.meta['added-by'] ? chip('+ ' + g.meta['added-by'], 'author') : '',
        g.meta['recommended-by'] ? chip('★ ' + g.meta['recommended-by'], 'rec') : ''].join('');
      return `<a class="card" href="games/${g.slug}/index.html">${coverTile(coverUrl(g, `games/${g.slug}/cover.jpg`), g.meta.title)}
        <h3>${esc(g.meta.title)}</h3>${meta ? `<div class="meta">${meta}</div>` : ''}</a>`;
    }).join('');
    return `<h2>${label[st]} <span class="count">${gs.length}</span></h2><div class="grid">${cards}</div>`;
  };
  /* recommendations lead the page — "here's what you should play next", with the why */
  const recs = games.filter(g => g.meta['recommended-by']);
  const recBlock = recs.length
    ? `<div class="recs">` + recs.map(g => {
        const cover = coverUrl(g, `games/${g.slug}/cover.jpg`);
        return `<a class="rec" href="games/${g.slug}/index.html">
          ${cover ? `<img loading="lazy" src="${cover}" alt="" onerror="this.remove()">` : ''}
          <span class="rec-body"><span class="rec-t">${esc(g.meta.title)}</span>
          ${g.meta['recommend-note'] ? `<span class="rec-note">${esc(g.meta['recommend-note'])}</span>` : ''}
          <span class="rec-by">★ recommended by ${esc(g.meta['recommended-by'])}</span></span></a>`;
      }).join('') + `</div>`
    : `<p class="dim">No recommendations yet. To flag a game for the other one, set <code>recommended-by:</code> (and a <code>recommend-note:</code> saying why) in its <code>index.md</code>.</p>`;
  write(path.join(OUT, 'to-play.html'), page('To Play', 'to-play',
    `<h1>To Play</h1>
     <p class="dim">What we're flagging for each other, then the shared queue.</p>
     <h2>Recommended${recs.length ? ` <span class="count">${recs.length}</span>` : ''}</h2>
     ${recBlock}
     ${shelf('playing')}${shelf('recorded')}${shelf('to-play')}`));
})();

/* ---------- diary: the full activity timeline ---------- */
(function buildDiary() {
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthLabel = ym => `${MONTHS[+ym.slice(5) - 1]} ${ym.slice(0, 4)}`;
  const dated = allEntries.filter(e => e.meta.date)
    .sort((a, b) => String(b.meta.date).localeCompare(String(a.meta.date)) || b.added - a.added);

  /* quiet patterns line: totals, per-author split (doubles as filter legend), span */
  const byAuthor = {};
  for (const e of dated) { const a = e.meta.author || '?'; byAuthor[a] = (byAuthor[a] || 0) + 1; }
  const gamesTouched = new Set(dated.map(e => e.game.slug)).size;
  const firstYm = dated.length ? String(dated[dated.length - 1].meta.date).slice(0, 7) : '';
  const span = firstYm ? ` · since ${MONTHS[+firstYm.slice(5) - 1].slice(0, 3)} ${firstYm.slice(0, 4)}` : '';
  const statsLine = `${dated.length} ${dated.length === 1 ? 'entry' : 'entries'} · ${gamesTouched} games`
    + Object.entries(byAuthor).sort().map(([a, n]) => ` · ${esc(a)} ${n}`).join('') + span;

  /* author filter: summoned toggle, mirrors the games-grid filter styling */
  const authorBtns = ['all', ...Object.keys(byAuthor).sort()].map(a =>
    `<button data-a="${esc(a)}"${a === 'all' ? ' class="on"' : ''}>${a === 'all' ? 'all' : esc(a) + ' ' + byAuthor[a]}</button>`).join('');

  /* wing filter: an entry can touch several wings (via its topics + patterns) */
  const entryWings = e => [...new Set([
    ...(e.meta.wing ? [e.meta.wing] : []),
    ...(e.meta.topics || []).map(t => topicWing[t]).filter(Boolean),
    ...(e.meta.patterns || []).map(p => patternRef[p] && patternRef[p].wing).filter(Boolean),
  ])];
  const wingTitle = {}; for (const w of wings) wingTitle[w.slug] = w.meta.title || title(w.slug);
  const byWing = {};
  for (const e of dated) for (const wg of entryWings(e)) byWing[wg] = (byWing[wg] || 0) + 1;
  const wingBtns = ['all', ...Object.keys(byWing).sort((a, b) => byWing[b] - byWing[a] || a.localeCompare(b))].map(wg =>
    `<button data-w="${esc(wg)}"${wg === 'all' ? ' class="on"' : ''}>${wg === 'all' ? 'all' : esc(wingTitle[wg] || wg) + ' ' + byWing[wg]}</button>`).join('');

  /* month sections so a filtered-empty month can hide its whole header */
  const groups = {};
  for (const e of dated) (groups[String(e.meta.date).slice(0, 7)] ??= []).push(e);
  const sections = Object.entries(groups).map(([ym, list]) => {
    const rows = list.map(e => {
      const cover = coverUrl(e.game, `games/${e.game.slug}/cover.jpg`);
      const type = typeLabel[e.meta.type] || e.meta.type || '';
      const draft = e.meta.status === 'draft' ? ' · draft' : '';
      return `<a class="lcard" href="games/${e.game.slug}/index.html#e-${e.slug}" data-author="${esc(e.meta.author || '?')}" data-wings="${entryWings(e).join(' ')}">
       ${cover ? `<img loading="lazy" src="${cover}" alt="" onerror="this.remove()">` : ''}
       <span><span class="lt">${esc(e.meta.title)}</span>
       <span class="lm">${esc(e.game.meta.title)}${type ? ' · ' + esc(type) : ''} · ${esc(e.meta.author || '?')} · ${esc(String(e.meta.date)).slice(0, 10)}${draft}</span></span></a>`;
    }).join('');
    return `<section class="dmonth"><h2>${monthLabel(ym)} <span class="count">· ${list.length}</span></h2><div class="diary">${rows}</div></section>`;
  }).join('');

  const js = `<script>
  const dshown = document.getElementById('dshown');
  let fAuthor = 'all', fWing = 'all';
  function applyDiary() {
    let total = 0;
    document.querySelectorAll('.dmonth').forEach(sec => {
      let vis = 0;
      sec.querySelectorAll('.lcard').forEach(c => {
        const okA = fAuthor === 'all' || c.dataset.author === fAuthor;
        const okW = fWing === 'all' || (c.dataset.wings || '').split(' ').includes(fWing);
        const ok = okA && okW;
        c.style.display = ok ? '' : 'none'; if (ok) vis++;
      });
      sec.style.display = vis ? '' : 'none'; total += vis;
    });
    if (dshown) dshown.textContent = total;
  }
  document.querySelectorAll('.diary-filter').forEach(row => {
    row.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      row.querySelectorAll('button').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      if (row.dataset.kind === 'author') fAuthor = b.dataset.a; else fWing = b.dataset.w;
      applyDiary();
    });
  });
  </script>`;

  const content = dated.length
    ? `<h1>Log <span class="count" id="dshown">${dated.length}</span></h1>
       <p class="diary-stats">${statsLine}</p>
       <div class="diary-filters">
         <div class="diary-filter" data-kind="author"><span class="dfl">who</span>${authorBtns}</div>
         <div class="diary-filter" data-kind="wing"><span class="dfl">wing</span>${wingBtns}</div>
       </div>
       ${sections}${js}`
    : `<h1>Log</h1><p class="dim">No dated entries yet.</p>`;
  write(path.join(OUT, 'diary.html'), page('Log', 'diary', content));
})();

/* ---------- lists / collections ---------- */
(function buildLists() {
  if (!lists.length) return;
  const gamesOf = l => (l.meta.games || []).map(s => gameBySlug[s]).filter(Boolean);

  const cards = lists.map(l => {
    const gs = gamesOf(l);
    const thumbs = gs.slice(0, 5).map(g => {
      const c = coverUrl(g, `games/${g.slug}/cover.jpg`);
      return c ? `<img loading="lazy" src="${c}" alt="" onerror="this.remove()">` : '';
    }).join('');
    return `<a class="list-card" href="lists/${l.slug}.html">
      <div class="list-covers">${thumbs}</div>
      <h3>${esc(l.meta.title || l.slug)}</h3>
      <p class="list-meta">${l.meta.by ? 'by ' + esc(l.meta.by) + ' · ' : ''}${gs.length} game${gs.length !== 1 ? 's' : ''}</p>
      ${l.meta.summary ? `<p class="list-sum">${esc(l.meta.summary)}</p>` : ''}</a>`;
  }).join('\n');
  write(path.join(OUT, 'lists.html'), page('Lists', 'lists',
    `<h1>Lists <span class="count">${lists.length}</span></h1><div class="list-index">${cards}</div>`, 0));

  for (const l of lists) {
    const gs = gamesOf(l);
    const grid = gs.map(g => {
      const c = coverUrl(g, `../games/${g.slug}/cover.jpg`);
      return `<a class="card" href="../games/${g.slug}/index.html">${coverTile(c, g.meta.title)}<h3>${esc(g.meta.title)}</h3></a>`;
    }).join('');
    write(path.join(OUT, 'lists', l.slug + '.html'), page(l.meta.title || l.slug, 'lists',
      `<p class="crumb"><a href="../lists.html">Lists</a></p>
       <h1>${esc(l.meta.title || l.slug)}</h1>
       ${l.meta.summary || l.meta.by ? `<p class="summary">${l.meta.summary ? esc(l.meta.summary) : ''}${l.meta.by ? ` <span class="dim">— ${esc(l.meta.by)}</span>` : ''}</p>` : ''}
       <div class="grid">${grid}</div>
       ${l.body.trim() ? md2html(l.body) : ''}`, 1, '', l.meta.summary || '', gs[0] ? ogImage(gs[0]) : ''));
  }
})();

/* ---------- global search index ---------- */
(function buildSearch() {
  const plain = s => String(s || '').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/[#*_`>\[\]()~|]/g, ' ').replace(/\s+/g, ' ').trim();
  const rec = [];
  for (const g of games) {
    const x = [g.meta.title, g.meta.summary, ...(g.meta.tags || []), ...(g.meta.mood || []),
      g.meta.pace, plain(g.body)].filter(Boolean).join(' ').toLowerCase();
    rec.push({ t: g.meta.title, k: 'game', c: '', u: `games/${g.slug}/index.html`, x });
  }
  for (const e of allEntries) {
    const x = [e.meta.title, typeLabel[e.meta.type] || e.meta.type, e.meta.author,
      ...(e.meta.topics || []), ...(e.meta.patterns || []), plain(e.body)].filter(Boolean).join(' ').toLowerCase();
    rec.push({ t: e.meta.title || e.slug, k: 'entry', c: e.game.meta.title, u: `games/${e.game.slug}/index.html#e-${e.slug}`, x });
  }
  for (const w of wings) {
    const wt = w.meta.title || title(w.slug);
    for (const t of w.topics) {
      const x = [t.meta.title, plain(t.body)].filter(Boolean).join(' ').toLowerCase();
      rec.push({ t: t.meta.title, k: 'topic', c: wt, u: `atlas/${w.slug}/topics/${t.slug}.html`, x });
    }
    for (const p of w.patterns) {
      const x = [patName(p), p.meta.pattern, plain(p.body)].filter(Boolean).join(' ').toLowerCase();
      rec.push({ t: patName(p), k: 'pattern', c: wt, u: `atlas/${w.slug}/patterns/${p.slug}.html`, x });
    }
  }
  for (const l of lists) {
    const gs = (l.meta.games || []).map(s => gameBySlug[s] && gameBySlug[s].meta.title).filter(Boolean);
    const x = [l.meta.title, l.meta.summary, l.meta.by, ...gs, plain(l.body)].filter(Boolean).join(' ').toLowerCase();
    rec.push({ t: l.meta.title || l.slug, k: 'list', c: l.meta.by ? 'by ' + l.meta.by : '', u: `lists/${l.slug}.html`, x });
  }
  write(path.join(OUT, 'search-index.js'), 'window.SEARCH_INDEX=' + JSON.stringify(rec) + ';');
  copy(path.join(__dirname, 'search.js'), path.join(OUT, 'search.js'));
})();

/* ---------- css + logo assets ---------- */
copy(path.join(__dirname, 'style.css'), path.join(OUT, 'style.css'));
copy(path.join(__dirname, 'favicon.svg'), path.join(OUT, 'favicon.svg'));
copy(path.join(__dirname, 'mark.svg'), path.join(OUT, 'mark.svg'));
if (exists(path.join(__dirname, 'og-card.png'))) copy(path.join(__dirname, 'og-card.png'), path.join(OUT, 'og-card.png'));
write(path.join(OUT, '.nojekyll'), '');

console.log(`Built: ${games.length} games, ${allEntries.length} entries, ` +
  wings.map(w => `${w.slug}(${w.topics.length}t/${w.patterns.length}p)`).join(' ') + ` -> _site/`);
