# AGENTS.md — authoring the Game Design Atlas with an AI

Instructions for any AI helping add content to this repo. Read this in full before creating or editing files. `CONTRIBUTING.md` is the human quick-guide; **this file is the complete spec.**

## What this is

A two-person games-pedia by **schmenz** and **jachym**: we play games, record what we learn about game design, and prototype the ideas worth keeping. It's a static site (one Node build script, `site/build.js`, reads markdown → writes `_site/`). You author markdown; the site renders it. Push to `main` and it rebuilds.

## Golden rules

1. **Never invent vocabulary.** Mood, pace, and genre come from the fixed lists below. The build prints a warning for anything off-list or missing (it never fails, but don't create drift).
2. **Own words only — never reproduce copyrighted text.** The game-design and narrative wings are built on books (Jesse Schell's *The Art of Game Design*, *The Game Narrative Toolbox*). Write concepts in our own words and point to the source with a quiet `*cf. Author, Title.*` line. Never paste book passages, long quotes, or song lyrics.
3. **Edit source files, never `_site/`.** `_site/` is generated build output — throwaway. Content lives in `games/`, `atlas/`, `lists/`. Cover images go next to a game's `index.md`, not in `_site/`.
4. **One change = one clear commit.** Don't push; the humans push via GitHub Desktop.

## Folder map

```
games/<slug>/index.md        one folder per game (frontmatter + optional notes)
games/<slug>/<entry>.md      entries about that game (the logs)
games/<slug>/cover.jpg        optional local cover (if not on Steam)
games/<slug>/prototypes/*.html  self-contained playable experiments
games/<slug>/sketches/*        images referenced from entries
atlas/<wing>/index.md         a "wing": level-design | game-design | sound-design | narrative-design
atlas/<wing>/topics/*.md      the 20 core topics per wing (living documents)
atlas/<wing>/patterns/*.md    the pattern library (PP-/GP-/SP-/NP- codes)
lists/*.md                    curated collections of games
templates/*.md                copy one to start a new entry
```

## Fixed vocabularies (source of truth)

**mood** — pick 1–3 that describe how the game *feels*:
`tense · eerie · oppressive · melancholic · lonely · contemplative · wondrous · dreamlike · cozy · playful · hopeful · tender`

**pace** — pick one: `slow · medium · fast`

**genre** (the `tags:` field) — the game's *form*, standard Steam/IGDB terms only:
`action · adventure · co-op · comedy · detective · driving · experimental · exploration · first-person · fishing · fps · historical · horror · immersive-sim · management · metroidvania · multiplayer · music · narrative · open-world · physics · platformer · point-and-click · post-apocalyptic · procedural · puzzle · roguelike · rpg · sci-fi · slice-of-life · survival · thriller · walking-sim`

A vibe (cozy, atmospheric, surreal) is a **mood**, not a genre. If a word is genuinely missing, a human adds it to the list in `site/build.js` first.

## Frontmatter by file type

### Game — `games/<slug>/index.md`
```yaml
---
title: Pentiment
status: to-play            # to-play | playing | recorded
added-by: schmenz          # schmenz | jachym
steam: 1205520             # Steam appid → cover art (omit if not on Steam; then add cover.jpg)
summary: "One sentence, own words — what it is and why it's interesting."
tags: [narrative, detective, historical]   # genre, from the list
mood: [contemplative, melancholic]
pace: slow
recommended-by:            # set to a name to flag it for the other one (see below)
recommend-note:            # one line on why they should play it
---
```
Only `title` and `added-by` are strictly required; everything else degrades gracefully. But **always fill mood, pace, and tags** (the build warns otherwise).

### Entry — `games/<slug>/2026-07-06-session-1.md`
```yaml
---
title: Session 2 — the hotel is the map
type: reverse-engineering   # reverse-engineering | rebuild-fragment | topic-case-study
wing: level-design          # level-design | game-design | sound-design | narrative-design
topics: [navigation, landmarks, verticality]   # kebab-case, from the wing's 20 core topics
patterns: [PP-12, PP-24]    # optional; codes from the wing's pattern library
author: jachym              # schmenz | jachym
date: 2026-07-07            # YYYY-MM-DD (add time "2026-07-07 23:00" to order same-day entries)
prototypes: [pp12-framing.html]   # optional; file must exist in the game's prototypes/ folder
status: draft               # optional; marks it a draft
---
```

### List — `lists/<slug>.md`
```yaml
---
title: Wayfinding without a map
by: jachym
summary: "One line on the theme."
games: [half-life-2, sable, outer-wilds]   # game slugs
---
Prose about the theme goes below.
```

### Recommend a game
On a game's `index.md`, set `recommended-by:` (you) and `recommend-note:` (one line on *why*). It leads the **To Play** page as a recommendation card.

## Entry body — the rendering conventions *(this is the part CONTRIBUTING omits)*

Below the frontmatter you have freedom, **but specific markdown triggers special layouts.** Use them — they're what make entries read well:

- **Numbered observations.** Any numbered list renders with quiet `01 / 02 / 03` markers. Lead each with a **bold** phrase so it's scannable:
  ```
  1. **Framed sightlines** — the doorway crops the view so the objective is always centred.
  2. **Light as a leash** — the only warm light in a grey room is where you're meant to go.
  ```
- **Sequence flow-line.** A heading exactly `## Sequence` followed by one paragraph using ` → ` arrows renders as a mono "map of the session":
  ```
  ## Sequence
  Spawn → framed corridor → first reveal → drop → landmark tower
  ```
- **Takeaway cards.** A heading starting `### New threads` followed by a bullet list renders the bullets as cards. Bold the lead of each:
  ```
  ### New threads
  - **Diegetic waypoints** — try replacing a HUD marker with an in-world light.
  - **Delayed reveal** — hold the vista until after the corridor.
  ```
- **Collapsible detail** (transcripts, long reference): `<details><summary><strong>▸ Full transcript</strong></summary> … </details>`
- **Draft note inline:** `<todo>still need to check the second playthrough</todo>`
- **YouTube:** a bare video URL on its own line auto-embeds (timestamps via `?t=` work).
- **Playable prototype:** put a single self-contained `.html` in the game's `prototypes/` folder and list it in the entry's `prototypes:` frontmatter — it embeds playable in the page.
- **`**bold**`** inside prose renders in the brighter ink colour — use it for the key term, not whole sentences.
- **Link to other pages with `[[…]]`.** `[[navigation]]` links to that topic, `[[portal-series]]` to that game, `[[PP-01]]` to that pattern; add an alias with a pipe: `[[navigation|wayfinding]]`. Use the **slug** (a game/topic) or **code** (a pattern) — an unresolved link is left as plain `[[text]]` so you notice and fix it. Every target page automatically grows a **"Linked references"** section listing what points to it — this reverse-linking is what makes the atlas a connected web, so link generously.

## The three entry types

- **reverse-engineering** — *How is it built? Why like this?* Observations of an existing game.
- **rebuild-fragment** — *Recreate a piece to find out why it works.* Often paired with a prototype.
- **topic-case-study** — *Recognise and remember,* tied to one of the 20 core topics.

Copy the matching file from `templates/` as your starting structure.

## Worked example — a good entry

`games/half-life-2/2026-07-canal-navigation.md`:
```markdown
---
title: How the canals stop me getting lost
type: reverse-engineering
wing: level-design
topics: [navigation, player-guidance, landmarks]
patterns: [PP-01]
author: jachym
date: 2026-07-06
---

The airboat canals are open enough to feel free but never actually ambiguous. A few
quiet tricks do the work.

## Sequence
Open water → framed bridge → gunfire ahead → forced turn → new landmark

1. **The water is a rail** — you can only go where the channel goes, so "explore"
   never means "get lost".
2. **Landmarks upstream** — a tower or a crashed truck sits at every branch, always
   visible before the split.
3. **Threat as a signpost** — the first shots come from the direction you should head,
   turning danger into guidance.

### New threads
- **Diegetic gating** — a lowered bridge blocks the wrong path without a wall.
- **Try it** — rebuild one branch and remove the landmark; does it fall apart?

*cf. Valve's developer commentary — the "breadcrumbing" idea, in my own words.*
```

## Do / don't

- **Do** fill mood, pace, and genre from the lists; use the entry conventions above; write in your own words; keep entries scannable (bold leads, short observations).
- **Don't** invent moods/genres, paste copyrighted text, edit `_site/`, add covers anywhere but the game folder, or push to `main` (leave that to the humans).
