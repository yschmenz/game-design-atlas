# Plan — a shareable authoring skill for atlas entries

*Draft plan, 2026-08-03. Nothing built yet — this is the agreed shape before we write code.*

## The question

> Can we write a skill the team shares that makes every AI produce perfect entries — or is `AGENTS.md` already that?

**`AGENTS.md` is already ~80% of the *content*. It is not the right *vehicle*.**

| | `AGENTS.md` | Skill |
|---|---|---|
| How it loads | Passive ambient context, whole file, every task | Triggered when the task matches; can be invoked by name |
| Who reads it | Tools that look for it (Codex, Cursor). Claude Code wants `CLAUDE.md`. A Cowork/desktop chat reads **neither** unless told | Any Claude surface — Cowork, Claude Code, desktop |
| Can it run things | No | Yes — bundles scripts, templates, reference files |
| Sharing with jachym & kuzeycn | "git pull and hope your tool reads it" | Install once, works everywhere |

So: keep `AGENTS.md` as the canonical spec, and add a skill that **executes** the spec rather than restating it.

## Architecture — one source of truth, three consumers

The failure mode to design against is drift. The vocabulary already lives in **three** places (`site/build.js` constants, `CONTRIBUTING.md`, `AGENTS.md`); a fourth copy inside a skill would guarantee they disagree within a month.

```
site/build.js          MOODS / PACES / GENRES  ← the one true vocabulary (exported)
      │
      ├── site/lint-content.js   imports it, validates every content file
      ├── AGENTS.md              the spec, prose, for humans + any AI
      └── skill                  the procedure: read spec → draft → run lint → fix
```

The skill contains **workflow, not facts**. It says "read `AGENTS.md` at the repo root, then follow it" and "run `npm run lint` and fix every warning before you finish". Facts stay in one place; the skill can never go stale.

## Phase 1 — the validator (`site/lint-content.js`)

This is the actual quality lever. An instruction is a suggestion; a failing check is not. `npm run lint`, exits non-zero on errors, prints warnings.

**Errors** (structurally wrong — the site renders badly):

- entry `type` not one of the three; `wing` not one of the four
- `date` not `YYYY-MM-DD` (optional ` HH:MM`)
- `author` / `added-by` not `schmenz` | `jachym` | `kuzeycn`
- `topics:` naming a topic with no page in `atlas/<wing>/topics/`
- `patterns:` naming a code with no page in that wing's `patterns/`
- `prototypes:` naming a file not present in the game's `prototypes/`
- `![...](sketches/…)` pointing at a missing image
- unresolved `[[link]]` — no matching game slug, topic, or pattern code
- entry sitting in a `games/<slug>/` folder that has no `index.md`

**Warnings** (renders fine, reads poorly — the "perfect entry" nudges):

- game missing `mood` / `pace` / `tags`, or using an off-list word *(already in `build.js`, moves here)*
- entry with **zero `[[links]]`** — an unconnected entry defeats the point of the atlas
- entry with no numbered observation list, or numbered items whose leads aren't **bold**
- `## Sequence` present but with no ` → ` arrows (won't render as a flow-line)
- no `### New threads` section — no forward hook
- blockquote longer than ~40 words, or unattributed → copyright guardrail, golden rule #2
- entry `status: draft` older than 30 days, or a stray `<todo>` left in

**Also**: `--fix` for the safe mechanical stuff (date normalising, trimming, kebab-casing topics), and a `--baseline` run over the ~50 existing games so we see where we already stand before we hold new entries to it.

## Phase 2 — the skill

`.claude/skills/write-atlas-entry/` — committed to the repo, so Claude Code picks it up automatically.

```
SKILL.md          the workflow (below)
reference/        entry-conventions.md — the rendering triggers, with before/after examples
```

Description line has to trigger on how we actually talk: *"write, draft, or review an entry for the Game Design Atlas — session notes, reverse-engineering studies, rebuild fragments, topic case studies"*.

The workflow it enforces:

1. **Locate** the game folder; create it from an existing one if missing.
2. **Read `AGENTS.md`** in full — the spec, not a paraphrase.
3. **Interview before drafting.** Never write from a blank prompt. Which game, which session, which of the three types, what surprised you. Bad entries come from the AI inventing observations it didn't watch.
4. **Copy the matching `templates/` file**, don't improvise structure.
5. **Draft** — own words, bold leads, `## Sequence` as an arrow line, `### New threads` to close, `[[links]]` generously.
6. **Run `npm run lint`. Fix every error and every warning, or say why a warning stands.**
7. **Report** the file path and the links created. Never `git push`.

Step 6 is the whole point. Steps 1–5 are what the AI does anyway; step 6 is what makes it verifiable.

## Phase 3 — distribution

- **Claude Code**: automatic once `.claude/skills/` is committed. jachym and kuzeycn pull, done.
- **Cowork / desktop**: zip the skill folder as `write-atlas-entry.skill`, install once. It reads `AGENTS.md` from the mounted repo at runtime, so it never drifts from the committed version.
- **`CLAUDE.md`** at the repo root: three lines pointing at `AGENTS.md` and the skill, so Claude Code loads the spec even when the skill doesn't trigger.
- **`AGENTS.md`** gains a short "if your tool supports skills, use `write-atlas-entry`" note at the top.

## Phase 4 — CI (optional, decide later)

`- run: npm run lint` in `deploy.yml` before the build. Errors fail the deploy, warnings just print. Worth it only once the baseline is clean — otherwise we start with a red repo and learn to ignore it.

## Fix on the way past

Found while reading the repo — small, real, worth cleaning up as part of Phase 1:

1. `templates/reverse-engineering.md` uses `## Sequence` for prose ("which chapter / area"), but `AGENTS.md` reserves `## Sequence` for the ` → ` arrow flow-line. The template teaches the wrong thing. Rename the prose one to `## Scope`.
2. Same template has a `game:` field that the spec doesn't document, and `status: draft | done` where the spec says status only marks drafts. Pick one and make both files agree.
3. Vocabulary lists are duplicated in `build.js`, `CONTRIBUTING.md`, and `AGENTS.md`. Consider having lint print the canonical list so the prose copies can be regenerated rather than hand-maintained.

## Open questions

- Should the skill be allowed to **create** a game folder, or only entries? (Creating means guessing `mood`/`pace`/`steam` — arguably a human call.)
- Do we want a second, lighter skill later for *reviewing* an existing entry against the spec? Deferred for now — entries first.

## Definition of done

Jachym, on his machine, with no setup beyond `git pull`, asks Claude "write up tonight's Indika session" — and gets a file that lints clean, links into the atlas, and reads like the Half-Life 2 worked example in `AGENTS.md`.
