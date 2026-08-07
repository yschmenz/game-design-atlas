# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A games-pedia by **schmenz**, **jachym**, and **kuzeycn**: they play games, record what they learn about game design, and prototype the ideas worth keeping. It's a static site — one Node build script (`site/build.js`) reads markdown content and writes static HTML to `_site/`. Pushing to `main` triggers a GitHub Actions rebuild + deploy to GitHub Pages (`.github/workflows/deploy.yml`).

**Read `AGENTS.md` in full before creating or editing any content** (games, entries, lists, atlas topics/patterns). It is the complete content spec — frontmatter schemas, fixed vocabularies, and the markdown conventions that trigger special rendering (numbered-observation cards, `## Sequence` flow-lines, `### New threads` cards, `[[wiki-links]]`, etc). `CONTRIBUTING.md` is the shorter human how-to version of the same rules; `DESIGN.md` is the visual design system (tokens, type scale, patterns) for anyone touching `site/style.css`.

**Read `WORKING-AGREEMENT.md` in full before starting any task.** It governs *how* schmenz works with an AI on this repo — the GOAL/SCOPE/CONTEXT/ACCEPT/OUT prompt shape, which surface (Cowork vs. Claude Code) a given task belongs on, and when to flag token/credit-heavy work before doing it. The "never push" rule below is one line from that doc, not the whole of it.

## Commands

```bash
npm install
npm run build     # runs `node site/build.js`, output in _site/
npm run serve     # serves _site/ at localhost:8080 via http-server
```

There is no test suite, linter, or type checker — `npm run build` is the only validation step. It never fails on content problems; it prints warnings to the console instead (unknown mood/pace/genre, etc). Always run a build after editing `site/build.js` and check the console output for new warnings.

## Architecture

Everything is driven by one script, `site/build.js` (~850 lines, single file, no modules). Structure to know before editing it:

1. **Content ingestion** (top of the file) — walks `games/`, `atlas/`, `lists/` off disk, parses YAML-ish frontmatter with a hand-rolled `parseFrontmatter`, and builds in-memory arrays: `games`, `allEntries`, `wings` (the atlas sections), `lists`. Cross-reference maps are built here too: `gameBySlug`, `topicWing`, `patternRef`, `listsForGame`.
2. **Vocabulary validation** — `MOODS`, `PACES`, `GENRES` are the canonical controlled vocabularies (also duplicated in prose form in `AGENTS.md`/`CONTRIBUTING.md`). Games using an off-list word get a console warning, never a build failure. **If you add a word to these arrays, update the prose lists in `AGENTS.md` and `CONTRIBUTING.md` to match** — they're the source of truth for content authors and must stay in sync with the code.
3. **Rendering helpers** (middle of the file) — `md2html` (marked + custom `embedYouTube` preprocessing), `dressEntry` (post-processes rendered HTML for the special layouts: observation cards, sequence flow-lines, takeaway cards), `linkWiki`/`scanLinks`/`backlinkBlock` (the `[[wiki-link]]` resolution + reverse "Linked references" system), `coverUrl`/`coverImg`/`coverTile` (Steam appid → cover art, or local `cover.jpg` fallback), `relatedGames`, `dateSpan`.
4. **Page assembly** (bottom of the file) — a sequence of `write(path.join(OUT, ...), page(...))` calls, one block per route: game index, each game page, each atlas wing/topic/pattern page, `to-play.html`, `diary.html`, `lists.html` + each list page, plus `search-index.js` (a flat JSON blob consumed client-side by `site/search.js`) and `.nojekyll`.

`site/style.css` and `site/search.js` are hand-written, not generated. `site/style.css` implements the token system documented in `DESIGN.md` — treat those tokens (`--bg`, `--panel`, `--ink`, `--ember`, `--sage`, etc.) as the only palette; the design doc's anti-patterns list (no gradients, no box borders around covers, no moved/scaled hover effects) is enforced by convention, not by tooling.

## Content structure

```
games/<slug>/index.md          one folder per game (frontmatter + optional notes)
games/<slug>/<entry>.md        dated entries about that game (the actual logs)
games/<slug>/cover.jpg         optional local cover (used when no `steam:` appid)
games/<slug>/prototypes/*.html self-contained playable experiments, embedded in the game page
games/<slug>/sketches/*        images referenced from entries
atlas/<wing>/index.md          a "wing": level-design | game-design | sound-design | narrative-design
atlas/<wing>/topics/*.md       the 20 core topics per wing (living documents, findings accrue over time)
atlas/<wing>/patterns/*.md     the pattern library (PP-/GP-/SP-/NP- codes)
lists/*.md                     curated collections of games, either plain (`games: [...]`) or annotated (`- slug — why`)
templates/*.md                 copy one of these to start a new entry/list
```

Only `atlas/level-design/` is populated; the other three wings are empty slots reserved for future use.

## Working conventions specific to this repo

- **`_site/` is generated output — never hand-edit it.** It's rebuilt from source on every push to `main`.
- **Never invent vocabulary.** `mood`, `pace`, and `tags` (genre) values must come from the fixed lists in `site/build.js` (`MOODS`/`PACES`/`GENRES`). Add new terms there (and the docs) before using them in content.
- **Own words only.** The game-design and narrative wings draw on published books (Jesse Schell's *The Art of Game Design*, *The Game Narrative Toolbox*); never reproduce copyrighted text — paraphrase and cite with a `*cf. Author, Title.*` line.
- **Never `git push`.** Per `WORKING-AGREEMENT.md`, commits are fine when asked but pushing to `main` is left to the humans.
- **One change = one clear commit.**
