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
function page(titleText, active, content, depth = 0, bodyClass = '') {
  const p = '../'.repeat(depth);
  const nav = [
    ['index.html', 'Games', 'games'],
    ...wings.map(w => [`atlas/${w.slug}/index.html`, w.meta.title || title(w.slug), w.slug]),
    ['to-play.html', 'To Play', 'to-play'],
  ].map(([href, label, key]) =>
    `<a href="${p}${href}"${key === active ? ' class="active"' : ''}>${label}</a>`).join('');
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(titleText)} — Game Design Atlas</title>
<link rel="stylesheet" href="${p}style.css"></head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}><header><a class="brand" href="${p}index.html">GAME DESIGN ATLAS</a><nav>${nav}</nav></header>
<main>${content}</main>
<footer>schmenz &amp; Jachym — play, record, prototype.</footer></body></html>`;
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

/* ---------- home: games grid with filters ---------- */
(function buildHome() {
  /* filter values, sorted by how many games they match (ties: alphabetical) */
  const tagCount = t => games.filter(g => (g.meta.tags || []).includes(t)).length;
  const topicCount = t => games.filter(g => g.entries.some(e => (e.meta.topics || []).includes(t))).length;
  const bySort = cnt => (a, b) => cnt(b) - cnt(a) || a.localeCompare(b);
  const topicsInUse = [...new Set(allEntries.flatMap(e => e.meta.topics || []))].sort(bySort(topicCount));
  const authors = [...new Set([...games.map(g => g.meta['added-by']),
    ...allEntries.map(e => e.meta.author)].filter(Boolean))].sort();
  const gameTags = [...new Set(games.flatMap(g => g.meta.tags || []))].sort(bySort(tagCount));
  /* a filter row: "all" + top VISIBLE values; the rest hide behind a "+N more" toggle */
  const VISIBLE = 8;
  const filterRow = (label, f, vals, fmt = x => x) => {
    const btn = v => `<button data-f="${f}" data-v="${v}">${esc(fmt(v))}</button>`;
    const rest = vals.slice(VISIBLE);
    const more = rest.length
      ? `<span class="more-wrap">${rest.map(btn).join('')}</span><button class="more" data-more="+${rest.length} more" aria-expanded="false">+${rest.length} more</button>`
      : '';
    return `<div><b>${label}</b> <button data-f="${f}" data-v="all" class="on">all</button>${vals.slice(0, VISIBLE).map(btn).join('')}${more}</div>`;
  };
  const filters = `
  <div class="filters" id="filters">
    ${filterRow('Status', 'status', ['to-play', 'playing', 'recorded'])}
    ${filterRow('Genre', 'tag', gameTags)}
    ${filterRow('Topic', 'topic', topicsInUse, title)}
    ${filterRow('Author', 'author', authors)}
  </div>`;
  const cards = games.map(g => {
    const topics = [...new Set(g.entries.flatMap(e => e.meta.topics || []))];
    const auths = [...new Set([g.meta['added-by'], ...g.entries.map(e => e.meta.author)].filter(Boolean))];
    const n = g.entries.length, np = g.prototypes.length;
    return `<a class="card" href="games/${g.slug}/index.html" data-status="${esc(g.meta.status || 'to-play')}"
      data-topics="${topics.join(' ')}" data-authors="${auths.join(' ')}" data-tags="${(g.meta.tags || []).join(' ')}">
      ${coverImg(coverUrl(g, `games/${g.slug}/cover.jpg`), 'cover')}
      <h3>${esc(g.meta.title)}</h3>
      <div class="meta">${chip(g.meta.status || 'to-play', 'st-' + (g.meta.status || 'to-play'))}
      ${g.meta['added-by'] ? chip('+ ' + g.meta['added-by'], 'author') : ''}
      ${n ? chip(n + (n > 1 ? ' entries' : ' entry')) : ''}${np ? chip(np + ' proto', 'proto') : ''}
      ${g.meta['recommended-by'] ? chip('★ ' + g.meta['recommended-by'], 'rec') : ''}</div></a>`;
  }).join('\n');
  const js = `<script>
  function applyFilters() {
    const f = {};
    document.querySelectorAll('#filters button.on').forEach(x => f[x.dataset.f] = x.dataset.v);
    document.querySelectorAll('.card').forEach(c => {
      const ok = (f.status === 'all' || c.dataset.status === f.status)
        && (f.tag === 'all' || c.dataset.tags.split(' ').includes(f.tag))
        && (f.topic === 'all' || c.dataset.topics.split(' ').includes(f.topic))
        && (f.author === 'all' || c.dataset.authors.split(' ').includes(f.author));
      c.style.display = ok ? '' : 'none';
    });
  }
  const ft = document.getElementById('filter-toggle'), fp = document.getElementById('filters');
  const openFilters = open => {
    fp.classList.toggle('open', open); ft.classList.toggle('open', open);
    ft.textContent = open ? 'filter ▾' : 'filter ▸'; ft.setAttribute('aria-expanded', open);
  };
  ft.addEventListener('click', () => openFilters(!fp.classList.contains('open')));
  document.getElementById('filters').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.more !== undefined) {   /* "+N more" / "less" toggle */
      const open = b.closest('div').classList.toggle('expanded');
      b.textContent = open ? 'less' : b.dataset.more;
      b.setAttribute('aria-expanded', open);
      return;
    }
    [...b.closest('div').querySelectorAll('button:not(.more)')].forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    applyFilters();
  });
  /* deep link: index.html?tag=rpg (works for tag/topic/status/author) */
  const params = new URLSearchParams(location.search);
  for (const [k, v] of params) {
    const b = document.querySelector('#filters button[data-f="' + k + '"][data-v="' + v + '"]');
    if (!b) continue;
    [...b.closest('div').querySelectorAll('button:not(.more)')].forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    if (b.closest('.more-wrap')) {   /* selected value is hidden -> expand its row */
      const row = b.closest('div'), t = row.querySelector('button.more');
      row.classList.add('expanded'); t.textContent = 'less'; t.setAttribute('aria-expanded', true);
    }
  }
  if ([...params].length) { openFilters(true); applyFilters(); document.getElementById('filters').scrollIntoView(); }
  </script>`;
  const latest = allEntries.filter(e => e.meta.date)
    .sort((a, b) => String(b.meta.date).localeCompare(String(a.meta.date)) || b.added - a.added).slice(0, 6);
  const feed = latest.length ? `<h2>Latest entries</h2><div class="latest">` + latest.map(e => {
    const cover = coverUrl(e.game, `games/${e.game.slug}/cover.jpg`);
    return `<a class="lcard" href="games/${e.game.slug}/index.html#${e.slug}">
     ${cover ? `<img loading="lazy" src="${cover}" alt="" onerror="this.remove()">` : ''}
     <span><span class="lt">${esc(e.meta.title)}</span>
     <span class="lm">${esc(e.game.meta.title)} · ${esc(e.meta.author || '?')} · ${esc(e.meta.date).slice(0, 10)}${e.meta.status === 'draft' ? ' · draft' : ''}</span></span></a>`;
  }).join('') + `</div>` : '';
  write(path.join(OUT, 'index.html'), page('Games', 'games',
    `<h1>The Games <span class="count">${games.length}</span></h1>${feed}
     <div class="section-head"><h2>All games</h2>
     <button class="filter-toggle" id="filter-toggle" aria-expanded="false" aria-controls="filters">filter ▸</button></div>
     ${filters}<div class="grid">${cards}</div>${js}`));
})();

/* ---------- game pages ---------- */
for (const g of games) {
  const entriesHtml = g.entries.map(e => {
    const protos = (e.meta.prototypes || []).map(p =>
      `<div class="proto-embed"><div class="proto-bar"><span>▶ ${esc(p)}</span>
       <a href="prototypes/${p}" target="_blank">open fullscreen ↗</a></div>
       <iframe src="prototypes/${p}" loading="lazy"></iframe></div>`).join('');
    return `<article class="entry" id="${e.slug}">
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
  write(path.join(OUT, 'games', g.slug, 'index.html'), page(g.meta.title, 'games',
    `${coverImg(coverUrl(g, 'cover.jpg'), 'cover-page')}
     <h1>${esc(g.meta.title)}</h1>
     <div class="meta">${chip(g.meta.status || 'to-play', 'st-' + (g.meta.status || 'to-play'))}
     ${g.meta['added-by'] ? chip('added by ' + g.meta['added-by'], 'author') : ''}
     ${g.meta['recommended-by'] ? chip('★ recommended by ' + g.meta['recommended-by'], 'rec') : ''}</div>
     ${g.meta.summary ? `<p class="summary">${esc(g.meta.summary)}</p>` : ''}
     ${(g.meta.tags || []).length ? `<div class="meta">${g.meta.tags.map(t =>
       `<a class="chip" href="../../index.html?tag=${encodeURIComponent(t)}">${esc(t)}</a>`).join('')}</div>` : ''}
     ${body ? md2html(body) : ''}
     ${entriesHtml || '<p class="dim">No entries yet — copy a template from <code>templates/</code> into this game’s folder.</p>'}
     ${looseProtos}`, 2, 'reading'));
  for (const p of g.prototypes) copy(path.join(g.dir, 'prototypes', p), path.join(OUT, 'games', g.slug, 'prototypes', p));
  for (const s of g.sketches) copy(path.join(g.dir, 'sketches', s), path.join(OUT, 'games', g.slug, 'sketches', s));
}

/* ---------- wings, topics, patterns ---------- */
for (const w of wings) {
  const topicList = w.topics.length ? `<h2>Core Topics</h2><ol class="topic-list">` + w.topics.map(t => {
    const n = allEntries.filter(e => (e.meta.topics || []).includes(t.slug)).length;
    return `<li><a href="topics/${t.slug}.html">${esc(t.meta.title)}</a>${n ? ` <span class="count">${n}</span>` : ''}</li>`;
  }).join('') + `</ol>` : '';
  const groups = {};
  for (const p of w.patterns) (groups[p.meta.group] ??= []).push(p);
  const patternList = w.patterns.length ? `<h2>Pattern Library</h2>` + Object.entries(groups).map(([grp, ps]) =>
    `<h3>${esc(grp)}</h3><ul class="pattern-list">` + ps.map(p => {
      const n = allEntries.filter(e => (e.meta.patterns || []).includes(p.meta.pattern)).length;
      return `<li><a href="patterns/${p.slug}.html">${esc(p.meta.title)}</a>${n ? ` <span class="count">${n}</span>` : ''}</li>`;
    }).join('') + `</ul>`).join('') : '';
  write(path.join(OUT, 'atlas', w.slug, 'index.html'), page(w.meta.title || title(w.slug), w.slug,
    `<h1>${esc(w.meta.title || title(w.slug))}</h1>${md2html(w.body.replace(/<!--[\s\S]*?-->/g, ''))}${topicList}${patternList}`, 2));

  for (const t of w.topics) {
    const related = allEntries.filter(e => (e.meta.topics || []).includes(t.slug));
    const rel = related.length ? `<h2>Entries</h2><ul class="entry-list">` + related.map(e =>
      `<li><a href="../../../games/${e.game.slug}/index.html#${e.slug}">${esc(e.meta.title)}</a>
       <span class="dim">— ${esc(e.game.meta.title)}, ${esc(typeLabel[e.meta.type] || '')} by ${esc(e.meta.author || '?')}</span></li>`).join('') + `</ul>`
      : `<p class="dim">Nothing tagged <code>${t.slug}</code> yet.</p>`;
    write(path.join(OUT, 'atlas', w.slug, 'topics', t.slug + '.html'), page(t.meta.title, w.slug,
      `<p class="crumb"><a href="../index.html">${esc(w.meta.title || title(w.slug))}</a> / core topic</p>
       <h1>${esc(t.meta.title)}</h1>${md2html(t.body.replace(/<!--[\s\S]*?-->/g, ''))}${rel}`, 3, 'reading'));
  }
  for (const p of w.patterns) {
    const related = allEntries.filter(e => (e.meta.patterns || []).includes(p.meta.pattern));
    const rel = related.length ? `<h2>Entries & prototypes</h2><ul class="entry-list">` + related.map(e =>
      `<li><a href="../../../games/${e.game.slug}/index.html#${e.slug}">${esc(e.meta.title)}</a>
       <span class="dim">— ${esc(e.game.meta.title)} by ${esc(e.meta.author || '?')}</span></li>`).join('') + `</ul>`
      : `<p class="dim">Not run yet — copy <code>templates/prototype.html</code> and try it.</p>`;
    write(path.join(OUT, 'atlas', w.slug, 'patterns', p.slug + '.html'), page(p.meta.title, w.slug,
      `<p class="crumb"><a href="../index.html">${esc(w.meta.title || title(w.slug))}</a> / ${esc(p.meta.group || 'pattern')}</p>
       <h1>${esc(p.meta.title)}</h1>${md2html(p.body.replace(/<!--[\s\S]*?-->/g, ''))}${rel}`, 3, 'reading'));
  }
}

/* ---------- to-play queue ---------- */
(function buildQueue() {
  const rows = games.map(g => `<tr>
    <td><a href="games/${g.slug}/index.html">${esc(g.meta.title)}</a></td>
    <td>${chip(g.meta.status || 'to-play', 'st-' + (g.meta.status || 'to-play'))}</td>
    <td>${esc(g.meta['added-by'] || '')}</td>
    <td>${esc(g.meta['recommended-by'] || '')}</td>
    <td>${g.entries.length || ''}</td></tr>`).join('\n');
  write(path.join(OUT, 'to-play.html'), page('To Play', 'to-play',
    `<h1>To Play — the shared queue</h1>
     <p class="dim">Live view generated from each game's <code>index.md</code>. ★ = recommended to the other one.</p>
     <table><thead><tr><th>Game</th><th>Status</th><th>Added by</th><th>Recommended by</th><th>Entries</th></tr></thead>
     <tbody>${rows}</tbody></table>`));
})();

/* ---------- css ---------- */
copy(path.join(__dirname, 'style.css'), path.join(OUT, 'style.css'));
write(path.join(OUT, '.nojekyll'), '');

console.log(`Built: ${games.length} games, ${allEntries.length} entries, ` +
  wings.map(w => `${w.slug}(${w.topics.length}t/${w.patterns.length}p)`).join(' ') + ` -> _site/`);
