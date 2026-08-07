#!/usr/bin/env node
/* Game Design Atlas — content linter.
   Validates every games/ + atlas/ file against AGENTS.md's rules.

   Errors   = structurally wrong: the site renders badly or build.js would
              choke (bad frontmatter values, dangling references, missing
              index.md). `npm run lint` exits non-zero when any exist.
   Warnings = renders fine, reads worse than it could (the "perfect entry"
              nudges from AGENTS.md's rendering conventions). Never fail
              the run — they print and that's it.

   This is read-only: it never edits content. See plan-authoring-skill.md
   ("Phase 1") for the checklist this implements. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/* ---------- vocabulary: pulled straight out of site/build.js, never duplicated ----------
   build.js is a self-executing script (it writes _site/ as a side effect just by being
   loaded), so we don't `require` it — we lift the MOODS/PACES/GENRES array literals out
   of its source text and evaluate just those. If build.js's format changes enough to
   break this, it'll throw loudly rather than silently drift. */
function loadVocab() {
  const src = fs.readFileSync(path.join(ROOT, 'site', 'build.js'), 'utf8');
  const m = src.match(/const MOODS = (\[[\s\S]*?\]);\s*const PACES = (\[[\s\S]*?\]);\s*[\s\S]*?const GENRES = (\[[\s\S]*?\]);/);
  if (!m) throw new Error('lint-content: could not find MOODS/PACES/GENRES in site/build.js — has its format changed?');
  const evalArray = code => new Function(`"use strict"; return (${code});`)();
  return { MOODS: evalArray(m[1]), PACES: evalArray(m[2]), GENRES: evalArray(m[3]) };
}
const { MOODS, PACES, GENRES } = loadVocab();
const PEOPLE = ['schmenz', 'jachym', 'kuzeycn'];
const TYPES = ['reverse-engineering', 'rebuild-fragment', 'topic-case-study'];

/* ---------- tiny helpers (a deliberately independent re-read of disk, so linting
   never triggers a full site build as a side effect — see loadVocab above) ---------- */
const exists = f => fs.existsSync(f);
const read = f => fs.readFileSync(f, 'utf8');
const listDirs = d => exists(d) ? fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name) : [];
const listFiles = (d, ext) => exists(d) ? fs.readdirSync(d).filter(f => !ext || f.endsWith(ext)) : [];

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

/* ---------- collect findings ---------- */
const errors = [];   // { file, msg }
const warnings = [];
const err = (file, msg) => errors.push({ file, msg });
const warn = (file, msg) => warnings.push({ file, msg });

/* ---------- load games ---------- */
const gamesDir = path.join(ROOT, 'games');
const games = listDirs(gamesDir).map(slug => {
  const dir = path.join(gamesDir, slug);
  const idxPath = path.join(dir, 'index.md');
  const hasIndex = exists(idxPath);
  if (!hasIndex) err(`games/${slug}/`, 'no index.md in this game folder — build.js reads it unconditionally and will crash');
  const idx = hasIndex ? parseFrontmatter(read(idxPath)) : { meta: {}, body: '' };
  const entries = listFiles(dir, '.md').filter(f => f !== 'index.md').map(f => {
    const e = parseFrontmatter(read(path.join(dir, f)));
    return { file: `games/${slug}/${f}`, meta: e.meta, body: e.body };
  });
  const prototypes = listFiles(path.join(dir, 'prototypes'), '.html');
  const sketches = listFiles(path.join(dir, 'sketches')).filter(f => !f.startsWith('.'));
  return { slug, dir, file: `games/${slug}/index.md`, meta: idx.meta, body: idx.body, entries, prototypes, sketches };
});
const gameBySlug = Object.fromEntries(games.map(g => [g.slug, g]));

/* ---------- load atlas wings ---------- */
const atlasDir = path.join(ROOT, 'atlas');
const wingDirs = listDirs(atlasDir);
const wings = wingDirs.map(w => {
  const dir = path.join(atlasDir, w);
  const idxPath = path.join(dir, 'index.md');
  const idx = exists(idxPath) ? parseFrontmatter(read(idxPath)) : { meta: {}, body: '' };
  const topics = listFiles(path.join(dir, 'topics'), '.md').map(f => {
    const t = parseFrontmatter(read(path.join(dir, 'topics', f)));
    return { slug: f.replace(/\.md$/, ''), file: `atlas/${w}/topics/${f}`, meta: t.meta, body: t.body };
  });
  const patterns = listFiles(path.join(dir, 'patterns'), '.md').map(f => {
    const p = parseFrontmatter(read(path.join(dir, 'patterns', f)));
    return { slug: f.replace(/\.md$/, ''), file: `atlas/${w}/patterns/${f}`, meta: p.meta, body: p.body };
  });
  return { slug: w, dir, file: `atlas/${w}/index.md`, meta: idx.meta, body: idx.body, topics, patterns };
});
/* atlas-wide topic/pattern lookups — used only for [[wiki-link]] resolution below, which
   mirrors build.js's own topicWing/patternRef maps: those resolve a slug/code to whichever
   wing first defines it, not to the wing a page happens to declare, so a [[link]] is
   correctly wing-agnostic. */
const topicSlugs = new Set(wings.flatMap(w => w.topics.map(t => t.slug)));
const patternCodes = new Set(wings.flatMap(w => w.patterns.map(p => p.meta.pattern).filter(Boolean)));

/* per-wing topic/pattern lookups — used for the `topics:`/`patterns:` frontmatter fields,
   which AGENTS.md scopes explicitly ("from the wing's 20 core topics" / "the wing's pattern
   library"): an entry may only cite topics/patterns that live under its own declared wing. */
const wingTopicSlugs = Object.fromEntries(wings.map(w => [w.slug, new Set(w.topics.map(t => t.slug))]));
const wingPatternCodes = Object.fromEntries(wings.map(w => [w.slug, new Set(w.patterns.map(p => p.meta.pattern).filter(Boolean))]));
const topicOwnerWings = slug => wings.filter(w => w.topics.some(t => t.slug === slug)).map(w => w.slug);
const patternOwnerWings = code => wings.filter(w => w.patterns.some(p => p.meta.pattern === code)).map(w => w.slug);

/* ---------- [[wiki-link]] resolution, mirroring build.js's wikiKey ---------- */
const WIKI_RE = /\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g;
function wikiResolves(id) {
  id = id.trim();
  if (id.includes(':')) {
    const i = id.indexOf(':');
    const ns = id.slice(0, i), rest = id.slice(i + 1);
    if (ns === 'game') return !!gameBySlug[rest];
    if (ns === 'topic') return topicSlugs.has(rest);
    if (ns === 'pattern') return patternCodes.has(rest.toUpperCase());
    return false;
  }
  return patternCodes.has(id.toUpperCase()) || topicSlugs.has(id) || !!gameBySlug[id];
}
function checkLinks(file, body) {
  for (const m of (body || '').matchAll(WIKI_RE)) {
    if (!wikiResolves(m[1])) err(file, `unresolved link [[${m[1]}]] — no matching game, topic, or pattern`);
  }
}

/* ---------- ![...](sketches/...) resolution ---------- */
function checkSketches(file, body, game) {
  for (const m of (body || '').matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    const src = m[1].trim().split(/\s+/)[0]; // drop an optional "title" after the URL
    if (!src.startsWith('sketches/')) continue;
    const rel = src.slice('sketches/'.length);
    if (!game.sketches.includes(rel)) err(file, `sketch image not found: ${src}`);
  }
}

/* ---------- attribution heuristic for blockquotes (golden rule #2) ---------- */
function hasAttribution(quoteText, entryBody) {
  if (/[—–-]\s*[A-Z]/.test(quoteText)) return true;      // "…text." — Valve  (inside the quote)
  if (/\*cf\.[^*]*\*/i.test(entryBody)) return true;      // a `*cf. Author, Title.*` line anywhere in the entry
  return false;
}

/* ---------- per-entry checks ---------- */
function checkEntry(game, e) {
  const f = e.file;
  const body = e.body || '';

  if (e.meta.type && !TYPES.includes(e.meta.type)) err(f, `type "${e.meta.type}" is not one of ${TYPES.join(' | ')}`);
  if (e.meta.wing && !wingDirs.includes(e.meta.wing)) err(f, `wing "${e.meta.wing}" has no atlas/${e.meta.wing}/ folder`);
  if (e.meta.date && !/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?$/.test(e.meta.date))
    err(f, `date "${e.meta.date}" is not YYYY-MM-DD (optional " HH:MM")`);
  if (e.meta.author && !PEOPLE.includes(e.meta.author)) err(f, `author "${e.meta.author}" is not ${PEOPLE.join(" | ")}`);

  /* topics:/patterns: are scoped to the entry's own wing per AGENTS.md; fall back to the
     atlas-wide set only when the wing itself is missing/invalid (that's already a separate
     error above, and we don't want to also cascade a wrong-wing false-positive on top of it). */
  const ownWing = e.meta.wing && wingDirs.includes(e.meta.wing) ? e.meta.wing : null;
  for (const t of e.meta.topics || []) {
    const inScope = ownWing ? wingTopicSlugs[ownWing].has(t) : topicSlugs.has(t);
    if (inScope) continue;
    if (!ownWing) { err(f, `topic "${t}" has no page in any atlas/*/topics/`); continue; }
    const owners = topicOwnerWings(t);
    err(f, owners.length
      ? `topic "${t}" has no page in atlas/${ownWing}/topics/ — it belongs to ${owners.map(o => `atlas/${o}/topics/`).join(', ')}, not this entry's wing`
      : `topic "${t}" has no page in atlas/${ownWing}/topics/ (or anywhere else in the atlas)`);
  }
  for (const p of e.meta.patterns || []) {
    const inScope = ownWing ? wingPatternCodes[ownWing].has(p) : patternCodes.has(p);
    if (inScope) continue;
    if (!ownWing) { err(f, `pattern "${p}" has no page in any atlas/*/patterns/`); continue; }
    const owners = patternOwnerWings(p);
    err(f, owners.length
      ? `pattern "${p}" has no page in atlas/${ownWing}/patterns/ — it belongs to ${owners.map(o => `atlas/${o}/patterns/`).join(', ')}, not this entry's wing`
      : `pattern "${p}" has no page in atlas/${ownWing}/patterns/ (or anywhere else in the atlas)`);
  }
  for (const proto of e.meta.prototypes || [])
    if (!game.prototypes.includes(proto)) err(f, `prototype "${proto}" not found in games/${game.slug}/prototypes/`);

  checkLinks(f, body);
  checkSketches(f, body, game);

  /* --- warnings: quality nudges from AGENTS.md's rendering conventions --- */
  if (![...body.matchAll(WIKI_RE)].length) warn(f, 'no [[links]] — an unconnected entry defeats the point of the atlas');

  const numbered = [...body.matchAll(/^\s*\d+\.\s+(.*)$/gm)];
  if (!numbered.length) warn(f, 'no numbered observation list');
  else {
    const unbold = numbered.filter(m => !/^\*\*[^*]+\*\*/.test(m[1].trim()));
    if (unbold.length) warn(f, `${unbold.length} of ${numbered.length} numbered observation(s) don't lead with a **bold** phrase`);
  }

  const seq = body.match(/^##\s*Sequence\s*$/im);
  if (seq) {
    const after = body.slice(seq.index + seq[0].length);
    const nextBlock = after.split(/\n\s*\n/).find(b => b.trim()) || '';
    if (!nextBlock.includes('→')) warn(f, '"## Sequence" has no → arrows — won\'t render as a flow-line');
  }

  if (!/^###\s*New threads/im.test(body)) warn(f, 'no "### New threads" section — no forward hook');

  /* group contiguous `>` lines into blockquote blocks */
  const quoteBlocks = [];
  { let cur = null;
    for (const line of body.split('\n')) {
      if (/^\s*>/.test(line)) { const t = line.replace(/^\s*>\s?/, ''); cur = cur === null ? t : cur + ' ' + t; }
      else if (cur !== null) { quoteBlocks.push(cur); cur = null; }
    }
    if (cur !== null) quoteBlocks.push(cur);
  }
  for (const q of quoteBlocks) {
    const words = q.trim().split(/\s+/).filter(Boolean).length;
    if (!words) continue;
    if (words > 40) warn(f, `blockquote is ~${words} words — keep quotes short and attributed (copyright guardrail)`);
    else if (!hasAttribution(q, body)) warn(f, 'blockquote has no visible attribution (a dash-attribution, or a "*cf. …*" line)');
  }

  if (e.meta.status === 'draft' && e.meta.date) {
    const d = new Date(String(e.meta.date).slice(0, 10));
    if (!isNaN(d)) {
      const days = Math.floor((Date.now() - d.getTime()) / 86400000);
      if (days > 30) warn(f, `status: draft, dated ${days} days ago — finish it or drop the draft flag`);
    }
  }
  if (/<todo>/i.test(body)) warn(f, 'stray <todo> left in the body');
}

/* ---------- run over every game ---------- */
for (const g of games) {
  const gf = g.file;

  if (!g.meta.title) err(gf, 'missing required field "title"');
  if (!g.meta['added-by']) err(gf, 'missing required field "added-by"');
  else if (!PEOPLE.includes(g.meta['added-by'])) err(gf, `added-by "${g.meta['added-by']}" is not ${PEOPLE.join(" | ")}`);
  if (g.meta['recommended-by'] && !PEOPLE.includes(g.meta['recommended-by']))
    err(gf, `recommended-by "${g.meta['recommended-by']}" is not ${PEOPLE.join(" | ")}`);

  /* feel-vocabulary guardrail — was build.js's checkFeel(), now lives here */
  const moods = g.meta.mood || [];
  if (!moods.length) warn(gf, 'no mood set');
  for (const m of moods) if (!MOODS.includes(m)) warn(gf, `unknown mood "${m}" — not in the fixed vocabulary`);
  if (!g.meta.pace) warn(gf, 'no pace set');
  else if (!PACES.includes(g.meta.pace)) warn(gf, `unknown pace "${g.meta.pace}"`);
  if (!(g.meta.tags || []).length) warn(gf, 'no tags (genre) set');
  for (const t of g.meta.tags || []) if (!GENRES.includes(t)) warn(gf, `unknown genre "${t}" — not in the fixed vocabulary`);

  checkLinks(gf, g.body);
  checkSketches(gf, g.body, g);

  for (const e of g.entries) checkEntry(g, e);
}

/* ---------- links inside atlas pages themselves ---------- */
for (const w of wings) {
  checkLinks(w.file, w.body);
  for (const t of w.topics) checkLinks(t.file, t.body);
  for (const p of w.patterns) checkLinks(p.file, p.body);
}

/* ---------- report ---------- */
function printGrouped(heading, list) {
  if (!list.length) return;
  console.log(`\n${heading} (${list.length})`);
  const byFile = new Map();
  for (const { file, msg } of list) { if (!byFile.has(file)) byFile.set(file, []); byFile.get(file).push(msg); }
  for (const [file, msgs] of byFile) {
    console.log(`  ${file}`);
    for (const m of msgs) console.log(`    - ${m}`);
  }
}
printGrouped('✗ Errors', errors);
printGrouped('⚠ Warnings', warnings);

const entryCount = games.reduce((n, g) => n + g.entries.length, 0);
console.log(`\n${errors.length} error${errors.length === 1 ? '' : 's'}, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}`
  + ` across ${games.length} games, ${entryCount} entries.`);

process.exit(errors.length ? 1 : 0);
