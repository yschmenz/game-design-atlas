# Game Design Atlas — Design System

Philosophy: the games and the writing are the interface. Chrome earns its place or stays hidden.
Inspired by mymind's restraint (content-first, summoned UI, quiet type) — not its look.
Where mymind is cool and blue, the atlas is **dark and warm**: candlelight, not moonlight.

## Principles

1. **Covers speak, text whispers.** Game art fills its card edge-to-edge; titles sit below as
   quiet captions. No boxes around content that is already visual.
2. **UI is summoned, not permanent.** Filters, actions, metadata appear when asked for
   (toggle, hover) and get out of the way otherwise.
3. **Color is meaning.** The palette is warm greys on warm black. Chromatic color appears
   only where it carries information: status (sage = playing, ember = recorded), drafts,
   active states. Never decoration. No color "identity" — the type is the identity.
4. **Two voices.** Georgia (serif) for everything that speaks — titles, prose, entries.
   Monospace for everything that functions — meta, chips, counts, nav. Never swap roles.
5. **Motion is a whisper.** Opacity and border-color, ≤ .15s ease. Nothing moves position.

## Tokens

```css
--bg:      #0f0d0b;   /* warm near-black (page) */
--panel:   #1a1713;   /* raised surface: composer, filter panel, image placeholder */
--line:    #2b261f;   /* hairlines */
--ink:     #e7e1d4;   /* warm off-white — headings, hover states */
--mut:     #a89d8a;   /* warm grey — body-adjacent UI, nav */
--faint:   #776e5f;   /* captions, metadata; the default text voice of the grid */
--ember:   #c96342;   /* terracotta — recorded status, attention moments ONLY */
--sage:    #7fb4a2;   /* playing status, prototype markers ONLY */
--draft:   #c98a8a;   /* draft markers */
```

Contrast floor: --faint on --bg ≈ 4.6:1 — never use it below 12px.

## Type scale

| Role | Font | Size / weight |
|---|---|---|
| Page title | Georgia | 1.7rem / 400, --ink |
| Section heading | Georgia | 1.2rem / 400, --mut, no rules/borders |
| Card caption | Georgia | 14px / 400, --faint; --ink on card hover |
| Body prose | Georgia | 16px / 1.65, --ink |
| Meta, chips, nav | monospace | 12–13px, --faint / --mut |
| Wordmark | monospace | 13px, letter-spaced, --mut (not colored) |

## Patterns

- **Card**: no background, no border. Cover (2:3, radius 6px) → caption below
  (title, then one 12px mono meta line). Status = small dot before meta text.
  Hover: caption brightens to --ink, cover gains 1px --line ring. Transition .15s.
- **Latest entries**: horizontal cards — cover thumb left (56px wide), entry title
  (serif, --ink) + game/author/date (12px mono --faint) right. These lead the homepage.
- **Filters**: hidden by default behind a mono "filter ▸" toggle beside the section
  heading. Panel is a --panel surface, radius 8px. Deep links auto-open it.
- **Chips**: 12px mono, no fill, 1px --line border, radius 4px, --faint text.
  Colored only when meaningful (status, draft, proto).
- **Radii**: 6px images/cards, 8px surfaces, 4px chips. Nothing else.

## Anti-patterns (do not)

- No amber/gold identity color; no colored wordmark or links-as-decoration
- No filled chip backgrounds except status dots
- No borders around covers at rest; no card boxes
- No new fonts, no bold-weight serif headings, no text-shadows, no gradients
- No hover effects that move or scale elements
