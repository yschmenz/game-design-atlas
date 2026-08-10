---
title: "SP-04 — Navigation by Ear"
pattern: SP-04
group: C. Space
wing: sound-design
---

**Experiment brief:** Find the goal with audio only — bell, river, echo. The sound twin of level design PP-02.

## What it is

The sound-only version of [[PP-02]] — no light, no terrain, no visual landmark. The player has exactly one channel to the goal: a directional sound source. If this pattern works, sound alone is enough; if it doesn't, that's the finding too.

## How it works

Nothing in the Atlas has tested this in isolation yet. The one entry that touches this territory, [[half-life-2]]'s canal-navigation entry (tagged [[PP-02]]), used sound alongside terrain and light and concluded terrain was doing most of the actual work — not sound. That's exactly the gap this pattern exists to close: build a space where sound is the only cue, and see whether it holds up on its own or was always going to need a visual backup.

## Trade-offs

Harder to build correctly than it sounds. It needs a real spatial/3D mix — stereo panning alone reads as "left or right," not "over there, get closer" — and a quiet-enough scene that the target sound isn't masked by ambience or music. It also fails silently for anyone with a hearing impairment or playing muted, worth naming as a real accessibility cost, not just a design trade-off, if this pattern is ever used outside a controlled prototype.

## Related patterns

- [[PP-02]] — same idea, tested (so far) with a visual/light backup rather than in isolation.

<!-- Findings from running this experiment. Prototypes tagged `patterns: [SP-04]` are auto-listed here. -->
