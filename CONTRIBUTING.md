# How to add stuff (2-minute guide)

## Add a game

Copy any game folder in `games/`, rename it, edit `index.md`. **Only `title` and
`added-by` matter — everything else is optional** and the site degrades gracefully
(no cover, no summary line — never an error). The optional fields:

- `steam: <appid>` → cover art. The ID is in every store URL: `store.steampowered.com/app/`**`1574240`**`/...`
- `summary: "one sentence, own words"` + `tags: [rpg, open-world]` → shown on the game page, tags are clickable filters
- `mood: [tense, lonely]` + `pace: slow` → the *feel* axis, filterable on the homepage (see the fixed list below)
- Not on Steam? Drop a `cover.jpg` into the game folder instead of `steam:`

Leave fields empty guilt-free — anyone can fill them in later.

### Mood & pace — the fixed vocabulary

Use only these words so the filter stays coherent (and so it lines up with film/books later). Pick 1–3 moods that describe how the thing *feels*, plus one pace.

- **mood:** `tense` · `eerie` · `oppressive` · `melancholic` · `lonely` · `contemplative` · `wondrous` · `dreamlike` · `cozy` · `playful` · `hopeful` · `tender`
- **pace:** `slow` · `medium` · `fast`

If a word is genuinely missing, we add it here first, then use it — never invent one-off moods in a single file. The build **warns** (never fails) if a game has no mood/pace or uses a word off this list, so drift and typos get caught before they ship.

### Genre — standard terms only

`tags:` is the game's **genre** (its form), drawn from a controlled list of recognised Steam/IGDB terms — not moods (use `mood:`), not vibes. Same rule as moods: add a term to the list below first, then use it; the build warns on anything off-list.

> action · adventure · co-op · comedy · detective · driving · experimental · exploration · first-person · fishing · fps · historical · horror · immersive-sim · management · metroidvania · multiplayer · music · narrative · open-world · physics · platformer · point-and-click · post-apocalyptic · procedural · puzzle · roguelike · rpg · sci-fi · slice-of-life · survival · thriller · walking-sim

Feels like a game's vibe (cozy, atmospheric, surreal)? That's a **mood**, not a genre — it goes in `mood:`.

Not sure which moods fit? Add the game with just `title`/`steam`, then ask Claude to draft moods from the summary — eyeball and commit. Never start from a blank field.

## Add an entry about a game

1. Find the game's folder in `games/` (e.g. `games/half-life-2/`). If it's missing, copy any existing game folder, edit `index.md`, and set `added-by:` to yourself.
2. Copy the matching template from `templates/` into that folder. Name it something like `2026-07-canal-navigation.md`.
3. Fill in the frontmatter (the `---` block at the top) — it powers search and filtering on the site:
   - `type`: `reverse-engineering` | `rebuild-fragment` | `topic-case-study`
   - `wing`: `level-design` (later: `narrative-design`, `sound-design`)
   - `topics`: from the 20 core topics, kebab-case (e.g. `[navigation, curiosity]`)
   - `patterns`: related prototyping principles (e.g. `[PP-02]`)
   - `author`: `schmenz` or `jachym`
   - `date`: `YYYY-MM-DD`, optionally with time (`2026-07-06 23:00`) — time decides the order in "Latest entries" when several land on one day
4. Below the frontmatter: total freedom. Text, images, YouTube links (they auto-embed, timestamps work). Link to another game/topic/pattern inline with `[[slug]]` (e.g. `[[navigation]]`, `[[portal-series]]`, `[[PP-01]]`) — the target page auto-lists everything that links to it under "Linked references". Capture a short quote with a `>` blockquote (keep it brief and attributed — no long copyrighted passages).
   Long reference material (full transcripts, walkthroughs) goes in a collapsible block so the entry stays scannable:
   `<details><summary><strong>▸ title</strong></summary>` … `</details>`
5. Commit + push.

## Add a sketch

Drop the image/photo into the game's `sketches/` folder, reference it from the entry:
`![my sketch](sketches/canal-flow.jpg)`

## Add a prototype

1. Copy `templates/prototype.html` into the game's `prototypes/` folder, rename it (e.g. `pp02-navigation-by-sound.html`).
2. Everything lives in that one file. Keep it tiny — it's an experiment, not a game.
3. Reference it from your entry's frontmatter (`prototypes: [pp02-navigation-by-sound.html]`) — the site embeds it playable.
4. Outgrew one file? Build it in Godot/Unity, put a link in the entry instead.

## Recommend a game

In the game's `index.md`, set `recommended-by:` (you) and `recommend-note:` (one line on *why* the other one should play it). It leads the **To Play** page as a recommendation card. Update `status:` as you go: `to-play` → `playing` → `recorded`.

```yaml
recommended-by: schmenz
recommend-note: "Every track has a diegetic source — study how score and architecture fuse."
```

## Update a topic or pattern page

Topic pages (`atlas/level-design/topics/`) and pattern pages (`atlas/level-design/patterns/`) are living documents — add distilled findings there once a principle shows up across multiple games. Entries tagged with a topic/pattern are auto-listed on its page.

## Rules

There is exactly one rule: push to `main`, no ceremony. If we ever conflict, last writer wins and we talk about it.
