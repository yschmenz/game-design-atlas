# Roadmap

*A status board, not a plan document. The reasoning behind each item lives in the dated docs it links to — this file only tracks state. Update the relevant line as part of the commit that ships the change; don't let this drift.*

## Done

- Cover-grid consistency (uniform 2:3, typographic fallback for cover-less games) — `3f5cdd5`, see `design-critique-2026-07-27.md` §1
- Game-page info hierarchy (4 chip rows → 1 meta line) — `fdb3e59`, see `design-critique-2026-07-27.md` §2
- A11y pass: focus-visible rings, touch targets, text sizing — `20e2793`, `eb520b1`, see `design-critique-2026-07-27.md` §a11y
- Homepage identity line — `20e2793`
- To-Play as a cover-led view (was a table) — `d75034d`, `891e318`, `89c38aa`
- Per-item notes on lists (`- slug — why`) — `0ab77b1`
- `[[wiki-links]]` + backlinks ("Linked references") — `b92632d`
- Related-games strip on game pages — `9460e55`
- Cover thumbnails in search overlay — `6d16a22`
- Diary / Log page (full activity timeline) — shipped, see `improvements-spec-2026-07-27.md` §2
- Wander link (random game) — shipped, see `improvements-spec-2026-07-27.md` §1
- Content linter (`site/lint-content.js`, `npm run lint`) — `1c0646c`
- Warmer, status-aware empty state on stub game pages (hairline block, no chip/cover changes) — `1a46972`, see `design-critique-2026-07-27.md` §Game page

## Next

- **Fix `--faint` contrast** — measured ~3.6–3.9:1 against AA's 4.5:1 floor (flagged 2026-08-06). Open decision: restrict `--faint` to decorative text only, or lift smallest labels to `--mut`. Sitewide token change, not a two-element fix — worth a short design-critique pass first.
- **Pattern library → real pattern language** — give each pattern a consistent skeleton (what it is → how it works → trade-offs → related patterns via `[[wiki-links]]`). Highest-leverage content move per `research-game-design-tools.md` Tier 1A; unlocks reference-grade patterns.
- **`write-atlas-entry` authoring skill (Phase 2)** — the validator (Phase 1) shipped as `site/lint-content.js`; the skill that runs the interview → draft → lint workflow itself is still unbuilt. See `plan-authoring-skill.md` §Phase 2. Open question first: should the skill be allowed to create a new `games/<slug>/` folder, or only write entries into existing ones?

## Later

- Prototypes gallery, bound to the pattern it tests and the games it's drawn from — `research-game-design-tools.md` Tier 1B
- Diagrams in entries (Mermaid — progression graphs, economy loops, dungeon-flow maps) — `research-game-design-tools.md` Tier 1C
- Comparison view (side-by-side across games on a topic/pattern page) — Tier 2E
- Design-question index (browsable by the question each entry asks) — Tier 2F
- Glossary / vocabulary index (topics + patterns + moods, one line each) — Tier 3G
- Editorial type confidence on directory pages (Knowledge, Lists, wing landings)
- Per-wing "last updated" / recency hint on the Knowledge hub
- Sticky scroll-spy entry index on long game pages — `plan-connections-wayfinding.md` §1b
- "Related entries" (shared topic/pattern, surfaced while reading) — `plan-connections-wayfinding.md` §2b
- "Related topics" via co-occurrence on topic pages — distinct from the `[[wiki-link]]` backlinks already shipped; `plan-connections-wayfinding.md` §2c, also flagged in `design-critique-2026-07-27.md` §4
- CI lint gate (`npm run lint` in `deploy.yml`) — deliberately deferred until the content baseline is clean, per `plan-authoring-skill.md` §Phase 4
- Film/book expansion, shared tag universe across media, cross-media links — `meeting-notes-2026-07-07.md`

## Content cleanup

Tracked as GitHub Issues going forward, not duplicated here — content decisions involve jachym and kuzeycn directly, and an issue can be assigned/commented/closed by whoever owns that entry. Routine lint hits (missing topic pages, stale drafts, stray `<todo>`s) aren't worth a standing list either; `npm run lint` is the live source of truth for those.

- `templates/reverse-engineering.md` uses `## Sequence` for prose instead of the arrow flow-line syntax `AGENTS.md` defines — should rename to `## Scope`. Same file has an undocumented `game:` field and `status: draft | done` where the spec only defines `draft`. See `plan-authoring-skill.md` §"Fix on the way past".
- Vocabulary (`MOODS`/`PACES`/`GENRES`) is hand-duplicated across `site/build.js`, `CONTRIBUTING.md`, `AGENTS.md` — worth having lint print the canonical list so the prose copies can be regenerated instead of hand-maintained.

## Deliberately not doing

- Social features — likes, counts-as-clout, follower mechanics
- Rainbow colour-coding of genres/moods (colour is meaning, not decoration — `DESIGN.md`)
- Boxed covers, a third typeface
- Becoming a tracker (ratings, backlog-as-content, social logging) — the atlas is a pattern language + design journal + playable tests, not Letterboxd for games

---

*Source docs: `design-critique-2026-07-27.md`, `design-research-2026-07-27.md`, `research-game-design-tools.md`, `improvements-spec-2026-07-27.md`, `meeting-notes-2026-07-07.md`. Those stay as-is — this file summarizes, it doesn't replace them.*
