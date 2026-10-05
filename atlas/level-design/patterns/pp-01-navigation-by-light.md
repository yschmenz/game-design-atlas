---
title: "PP-01 — Navigation by Light"
pattern: PP-01
group: A. Navigation
wing: level-design
---

**Experiment brief:** Remove every landmark. Can the player reach the destination using only: sunlight, torches, illuminated windows, reflections?

## What it is

Remove every other landmark and let light alone — a lit window, a bright doorway, a torch, a single lit room among dark ones — mark the way. The player never gets a map, a compass, or a verbal direction; they learn "go toward brightness" as the wayfinding rule and the level is built so that rule is always enough.

## How it works

Four entries across two games have run into this pattern so far, all independently, none as a deliberate isolated test — which makes them a useful natural sample rather than a designed experiment. [[indika]] is the strongest case: three separate sessions ([[indika]] 1, 2, and 3) each lean on a single lit window or lit spot as the terminal cue, and by session 3 the entry says so directly — *"a single lit window is the only signal needed to find the way out — the game trusts this cue completely by now, no other markers required."* That's close to a clean, isolated run of the pattern: no map, no waypoint, nothing but light, and it holds up. Session 2 pushes it further, using light not just to mark an exit but to mark *which* of three interactable objects in one room matter — the pattern doing double duty on both "which way" and "which thing."

[[control]]'s first session uses the same base mechanic — a looping, non-obvious hallway solved by picking the one lit room out of several identical dark ones — but never isolates it: light runs underneath a persistent UI highlight layer the entry itself flags as possibly redundant once light is already doing the job. That's a genuinely useful negative data point, not a weaker example: it shows what happens when the pattern is *not* tested alone, and it's exactly the kind of layering [[PP-02]]'s page already warns about from the other direction — easy to add a guiding cue, harder to know it's load-bearing when something else is guiding too.

## Trade-offs

The pattern trains a rule fast, and that's also its failure mode: once a player has learned "lit means correct," any non-critical lit object becomes noise, and any correct-but-unlit path reads as wrong even when it isn't. None of the entries so far test that negative case deliberately — worth a prototype that teaches the rule, then deliberately breaks it, to see how much trust the player actually built up. It's also hard to tell whether light is truly load-bearing or just reinforcing something else already guiding the player (terrain, a corridor's own shape, a persistent UI marker) unless the build strips those away — [[control]]'s entry is the clearest in-Atlas example of this ambiguity, precisely because it wasn't trying to test the pattern in isolation.

## Related patterns

- [[PP-02]] — the sound-based sibling; same caution about layering vs. isolation applies in both directions.
- [[PP-09]] — where a landmark is a person rather than a light source; [[control]]'s session 1 sits close to both without cleanly matching either, light and sound stacking on an NPC-as-destination rather than an NPC giving directions.

<!-- Findings from running this experiment. Prototypes tagged `patterns: [PP-01]` are auto-listed here. -->
