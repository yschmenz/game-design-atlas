# Roadmap review against the master's thesis — 2026-08-10

*Prompted by the collaborative MA thesis planning (`Game_Design_Atlas_Thesis_One_Pager.md`, `Individual_Thesis_Interview_Log.md`, `Gundolf_Pitch_Draft.md` — all in the Master Thesis folder). Basis: a grill-me pass triaging `ROADMAP.md`'s "Next" list against what the thesis actually needs, plus a fact-check of the live Atlas content rather than assumptions about it.*

---

## Why this review happened

schmenz's individual RQ ("How does exposure to a self-built, literature-grounded sound-design pattern library shape sound-design decisions made under fast, jam-speed prototyping constraints?") depends on the Atlas's pattern system genuinely surfacing continuities across titles. The team's shared timeline names a hard prerequisite: the sound-design wing has to be populated with real content *before* the jam/prototyping phase starts (not built in parallel) — see `Individual_Thesis_Interview_Log.md`. That's a real deadline attached to specific roadmap-adjacent work, which the existing roadmap didn't reflect at all.

## Ground rules that came out of the grill-me pass

- **Deadline breaks ties.** Between an item that serves schmenz's individual RQ and one that serves the shared team Atlas, weight them equally *except* when one has an actual date attached — right now that's only the sound-design wing prerequisite.
- **Don't force thesis-only instrumentation into the generalist product.** The Atlas may become a tool for other designers eventually (undecided, contingent on how well it works for the three of you) — schmenz's own falsifiability mechanism (logging predicted patterns before a jam build, checking against what's actually found) stays **outside** the Atlas entirely (a personal log, not a schema field), because nobody else on the team needs that concept. Naming choices for anything that *is* generalist (see the pattern-page split below) should stay portable rather than baked to the current team's specific workflow.
- **Verify before prioritizing.** Several assumed gaps turned out to already be solved by existing, shipped features: the audio-notable corpus is just a `lists/*.md` entry (per-item notes already shipped, `0ab77b1`); the sound-design wing already renders automatically the moment content exists (`build.js` walks `atlas/` generically, no per-wing code). Both were removed from consideration as "build" work — they're just writing.

## What the actual content audit found (2026-08-10)

54 games logged, only 13 with a dated entry (8 jachym, 5 schmenz, 0 kuzeycn — matches the still-open "onboard Kuzey" item from the 2026-08-03 meeting). Every topic and pattern page in every wing, sound-design included, was still template-stub shape — no wing had real accrued findings yet, contrary to `CLAUDE.md`'s claim that only level-design is populated (stale; low-priority fix, not done as part of this review). Only 13 entries anywhere tagged a pattern, all `PP-` except one `GP-01`; zero `SP-`/`NP-` usage. Only 1 real prototype `.html` file exists across all 54 games. This grounded two decisions: the pattern-page continuity list (below) has nothing real to differentiate yet, so its rendering code was deferred; and "pattern library → real pattern language" was picked as the first concrete move because it's the one item that's simultaneously thesis-critical and identically true for all four wings.

## The pattern-page continuity gap (new finding, not previously on the roadmap)

Checking what the Atlas's "cross-referencing system" (which the RQ names directly) actually does: each pattern page already lists every entry across the Atlas tagged with that code — that mechanism *is* the continuity-surfacing the RQ depends on, and it predates any thesis planning. But it's a flat, undifferentiated list — no distinction between entries about established/studied games and entries about the team's own jam output. Confirmed as a real, generalist gap (not sound-specific — Jachym's level-design and Kuzey's procedural work would benefit from the same split), but it needs a team pitch before wider rollout: bring a live example, not an abstract pitch, to the next natural Monday sync. Naming should stay portable ("established games" / "our builds," not "jam output," in case the tool ever serves someone outside this team's own jam-based workflow).

## What shipped today

- `Harden the content linter against silent render failures` — done in full, all three sub-gaps from `design-critique-2026-08-08-entries.md` §1/§2/§5 fixed (bare `<todo>` and `<todo — …>` both now errors; Sequence-arrow check bounded to next-heading instead of first-block-only, to avoid false negatives from unrelated `→` usage elsewhere in an entry). Commit `53cbf2d`.
- First real instance of `Pattern library → real pattern language`: a `templates/sound-case-study.md` template (Function/Atmosphere split, operationalizing schmenz's Layer A/B blueprint without inventing a new entry `type:` — stays within `AGENTS.md`'s four fixed types) and a full what-it-is/how-it-works/trade-offs/related-patterns skeleton on the PP-02/SP-04 sound-twin pattern pair, cross-linked and grounded in the one real entry that touches this territory (`games/half-life-2/2026-07-canal-navigation.md`). Commit `2a8bf55`. The rest of the pattern library still needs this treatment — this is a precedent, not a finished item.

## Sequencing decided for what's left

1. **Citizen Sleeper 2 pilot entries** (content, not a roadmap item) — using the new template; CS2 was picked because schmenz had already set himself up, in an existing CS1 entry dated the day before this review, to track CS2's audio deliberately. Expect a run of entries here, not just one — this is the real practice ground for shaping the blueprint. Literature review (Collins, Schafer, LaBelle, Redecker, Alexander, etc.) happens in parallel and refines the template/framework as it goes, not as a blocking prerequisite.
2. **Sticky/scroll-aware entry index** — reconsidered upward. Already flagged in `design-critique-2026-08-08-entries.md` §3 as arguably the single biggest structural gap on the site (6,751 words on one scroll, Indika). The CS2 entry run is about to reproduce that exact failure mode on a page that matters to the thesis. Do this once a few CS2 entries exist and the page has visibly gotten long — not before, and not indefinitely deferred either.
3. **`write-atlas-entry` authoring skill** — reconsidered, conditionally. Could speed up the CS2 writing run, but building it before writing anything by hand risks designing it around the wrong assumptions. Do this after 2–3 manual CS2 entries, once what's actually repetitive is clear.
4. **Established/jam-output pattern-page split** — pitch at the next natural Monday sync using the PP-02/SP-04 pair as the live example; no special meeting scheduled for it.
5. **Genuinely lower priority, revisit after the Aug–Sep content sprint settles**: `--faint` contrast fix, despelote's missing `<details>` collapse (`design-critique-2026-08-08-entries.md` §4), the docs-drift cleanup items already listed under "Content cleanup," and everything already in "Later."

Nothing above was dropped from consideration — see `ROADMAP.md`'s "Next" and "Later" sections for the full standing list; this doc only explains *why* the order changed and what's shipped.
