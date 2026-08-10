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
- Harden the content linter against silent render failures (bare `<todo>` + `<todo — …>` now errors, not warnings; Sequence-arrow check bounded to next-heading instead of first-block-only) — `53cbf2d`, see `design-critique-2026-08-08-entries.md` §1, §2, §5
- Sound-case-study entry template + first pattern skeleton pair (PP-02/SP-04, what-it-is/how-it-works/trade-offs/related) — `2a8bf55`, first instance of "Pattern library → real pattern language" below, see `thesis-roadmap-review-2026-08-10.md`

## Next

*Reordered 2026-08-10 against the collaborative MA thesis timeline — reasoning in `thesis-roadmap-review-2026-08-10.md`, this list still tracks state only.*

- **Established-title vs. our-own-build split on pattern pages** — each pattern page's "which entries use this" list is currently flat, no distinction between entries about existing/studied games and entries about the team's own jam-built prototypes. Confirmed as a real, generalist gap (not sound-specific), found while auditing the pattern system against the thesis RQ. Needs a live-example pitch at the next Monday sync before wider rollout — see `thesis-roadmap-review-2026-08-10.md`.
- **Sticky/scroll-aware entry index on long game pages** — already scoped in `plan-connections-wayfinding.md` §1b; `design-critique-2026-08-08-entries.md` §3 gives it a concrete case (one game, 4 entries, 6,751 words, one continuous scroll). Reconsidered upward 2026-08-10: the incoming sound-design entry run is about to reproduce the same failure mode on a thesis-relevant page. Do once a few of those entries exist and the page has visibly grown, not before — worth a short design pass first (sidebar vs. top bar, mobile behaviour).
- **Pattern library → real pattern language** — give each remaining pattern the same consistent skeleton (what it is → how it works → trade-offs → related patterns via `[[wiki-links]]`) as the PP-02/SP-04 pair above. Highest-leverage content move per `research-game-design-tools.md` Tier 1A; unlocks reference-grade patterns.
- **`write-atlas-entry` authoring skill (Phase 2)** — the validator (Phase 1) shipped as `site/lint-content.js`; the skill that runs the interview → draft → lint workflow itself is still unbuilt. See `plan-authoring-skill.md` §Phase 2. Reconsidered 2026-08-10: worth building once a few sound-design corpus entries have been written by hand and the repetitive parts are clear, not before. Open question first: should the skill be allowed to create a new `games/<slug>/` folder, or only write entries into existing ones?
- **Fix `--faint` contrast** — measured ~3.6–3.9:1 against AA's 4.5:1 floor (flagged 2026-08-06). Open decision: restrict `--faint` to decorative text only, or lift smallest labels to `--mut`. Sitewide token change, not a two-element fix — worth a short design-critique pass first. Lower priority until the Aug–Sep content sprint settles.

## Later

- Prototypes gallery, bound to the pattern it tests and the games it's drawn from — `research-game-design-tools.md` Tier 1B
- Diagrams in entries (Mermaid — progression graphs, economy loops, dungeon-flow maps) — `research-game-design-tools.md` Tier 1C
- Comparison view (side-by-side across games on a topic/pattern page) — Tier 2E
- Design-question index (browsable by the question each entry asks) — Tier 2F
- Glossary / vocabulary index (topics + patterns + moods, one line each) — Tier 3G
- Editorial type confidence on directory pages (Knowledge, Lists, wing landings)
- Per-wing "last updated" / recency hint on the Knowledge hub
- "Related entries" (shared topic/pattern, surfaced while reading) — `plan-connections-wayfinding.md` §2b
- "Related topics" via co-occurrence on topic pages — distinct from the `[[wiki-link]]` backlinks already shipped; `plan-connections-wayfinding.md` §2c, also flagged in `design-critique-2026-07-27.md` §4
- CI lint gate (`npm run lint` in `deploy.yml`) — deliberately deferred until the content baseline is clean, per `plan-authoring-skill.md` §Phase 4
- Film/book expansion, shared tag universe across media, cross-media links — `meeting-notes-2026-07-07.md`

## Content cleanup

Tracked as GitHub Issues going forward, not duplicated here — content decisions involve jachym and kuzeycn directly, and an issue can be assigned/commented/closed by whoever owns that entry. Routine lint hits (missing topic pages, stale drafts, stray `<todo>`s) aren't worth a standing list either; `npm run lint` is the live source of truth for those.

- `templates/reverse-engineering.md` uses `## Sequence` for prose instead of the arrow flow-line syntax `AGENTS.md` defines — should rename to `## Scope`. Same file has an undocumented `game:` field and `status: draft | done` where the spec only defines `draft`. `AGENTS.md`'s own "worked example" for half-life-2 doesn't match either the template or the actual entry — same drift, one fix. See `plan-authoring-skill.md` §"Fix on the way past" and `design-critique-2026-08-08-entries.md` §6.
- Vocabulary (`MOODS`/`PACES`/`GENRES`) is hand-duplicated across `site/build.js`, `CONTRIBUTING.md`, `AGENTS.md` — worth having lint print the canonical list so the prose copies can be regenerated instead of hand-maintained.
- Despelote's transcript label is plain bold text instead of a `<details>` collapse, unlike Indika's precedent — `design-critique-2026-08-08-entries.md` §4. Small, isolated, no dependency on anything else.

## Deliberately not doing

- Social features — likes, counts-as-clout, follower mechanics
- Rainbow colour-coding of genres/moods (colour is meaning, not decoration — `DESIGN.md`)
- Boxed covers, a third typeface
- Becoming a tracker (ratings, backlog-as-content, social logging) — the atlas is a pattern language + design journal + playable tests, not Letterboxd for games

---

*Source docs: `design-critique-2026-07-27.md`, `design-critique-2026-08-08-entries.md`, `design-research-2026-07-27.md`, `research-game-design-tools.md`, `improvements-spec-2026-07-27.md`, `meeting-notes-2026-07-07.md`, `thesis-roadmap-review-2026-08-10.md`. Those stay as-is — this file summarizes, it doesn't replace them.*
