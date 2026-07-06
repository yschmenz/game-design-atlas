# Game Design Atlas

A shared games-pedia by **schmenz** & **Jachym** — playing games we love (or always wanted to finish), recording what we learn about game design, and prototyping the ideas worth keeping.

## How it works

- **`games/`** — one folder per game. Entries in any of three forms (see below), plus sketches and playable prototypes.
- **`atlas/`** — the knowledge, organized by wing:
  - **`level-design/`** — the first wing: 20 core topics + a pattern library of 25 prototyping principles (PP-01…PP-25)
  - **`narrative-design/`** — empty slot, ready when we are
  - **`sound-design/`** — empty slot, ready when we are
- **`TO-PLAY.md`** — the shared queue + recommendations to each other
- **`templates/`** — copy one, fill it in

## The three entry types

| Type | Question | Template |
|---|---|---|
| Reverse Engineering | *How is it built? Why is it built like this?* | `templates/reverse-engineering.md` |
| Rebuilding as Fragments | *Why is it built like this? — recreate it and find out* | `templates/rebuild-fragment.md` |
| Topic Case Study | *Recognise and remember — tied to a core topic* | `templates/topic-case-study.md` |

Prototypes are single self-contained HTML files (`templates/prototype.html`) dropped into a game's `prototypes/` folder — the site embeds them playable in the browser.

## Workflow

play → write / sketch / prototype → commit → push → the other one sees it on the site.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the 2-minute how-to.

## Site

Every push to `main` rebuilds and deploys the atlas via GitHub Pages (`.github/workflows/deploy.yml`). Build locally with:

```bash
npm install
npm run build     # output in _site/
npm run serve     # preview at localhost:8080
```
