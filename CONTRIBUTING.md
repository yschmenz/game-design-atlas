# How to add stuff (2-minute guide)

## Add an entry about a game

1. Find the game's folder in `games/` (e.g. `games/half-life-2/`). If it's missing, copy any existing game folder, edit `index.md`, and set `added-by:` to yourself.
2. Copy the matching template from `templates/` into that folder. Name it something like `2026-07-canal-navigation.md`.
3. Fill in the frontmatter (the `---` block at the top) — it powers search and filtering on the site:
   - `type`: `reverse-engineering` | `rebuild-fragment` | `topic-case-study`
   - `wing`: `level-design` (later: `narrative-design`, `sound-design`)
   - `topics`: from the 20 core topics, kebab-case (e.g. `[navigation, curiosity]`)
   - `patterns`: related prototyping principles (e.g. `[PP-02]`)
   - `author`: `schmenz` or `jachym`
4. Below the frontmatter: total freedom. Text, images, YouTube links (they auto-embed, timestamps work).
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

In the game's `index.md`, set `recommended-by:` and add a line why. It shows up in the TO-PLAY queue on the site. Update `status:` as you go: `to-play` → `playing` → `recorded`.

## Update a topic or pattern page

Topic pages (`atlas/level-design/topics/`) and pattern pages (`atlas/level-design/patterns/`) are living documents — add distilled findings there once a principle shows up across multiple games. Entries tagged with a topic/pattern are auto-listed on its page.

## Rules

There is exactly one rule: push to `main`, no ceremony. If we ever conflict, last writer wins and we talk about it.
