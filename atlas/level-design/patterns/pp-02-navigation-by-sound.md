---
title: "PP-02 — Navigation by Sound"
pattern: PP-02
group: A. Navigation
wing: level-design
---

**Experiment brief:** Hide the destination completely. The player finds it by: church bells, river, voices, hammering, waterfall.

## What it is

Remove the destination from view and let a directional sound — bells, running water, voices, machinery — carry the player toward it instead. The pattern isolates sound as the wayfinding signal, with no light or terrain cue backing it up.

## How it works

The one entry in the Atlas that touches this so far, [[half-life-2]]'s canal chapter, paired it with [[PP-01]] rather than testing it alone — the entry's own conclusion was that terrain was doing the actual guiding, with light and sound only reinforcing a direction the water already gave. That's a real result, not a guess: sound-as-navigation is easy to add to a space, harder to prove is load-bearing on its own without something else already doing the work. [[SP-04]] is written to isolate that question directly — a build with sound as the *only* cue, nothing else backing it up.

## Trade-offs

Needs a real spatial mix to read as "coming from there" — in a flat stereo prototype, or a scene with competing ambience, the cue can wash out and fail quietly, with nobody noticing until a playtest. It also demands active listening: a player not paying attention to sound, or playing muted, gets nothing from it. Best run as one layer among several rather than the sole guide, unless testing wayfinding-by-sound in isolation is the actual point of the build.

## Related patterns

- [[PP-01]] — the light-based sibling this pattern has so far only been tested alongside, not on its own.
- [[SP-04]] — the sound-design wing's dedicated version of the same question, still untested (no entries yet).

<!-- Findings from running this experiment. Prototypes tagged `patterns: [PP-02]` are auto-listed here. -->
