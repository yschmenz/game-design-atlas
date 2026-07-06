---
title: How the canals stop me getting lost
game: half-life-2
type: reverse-engineering
wing: level-design
topics: [navigation, player-guidance]
patterns: [PP-01, PP-02]
prototypes: [pp01-navigation-by-light.html]
author: jachym
date: 2026-07-06
status: done
---

## Sequence

Canal chapter (Route Kanal / Water Hazard).

## Question

How do they stop me getting lost?

## Hypothesis

Electric poles, water, enemy sounds, lighting.

## Test

Remove lighting (mentally / replay ignoring light). Would it still work?

## Conclusion

**Water was actually the main guide.** The canal itself is the path — light and sound only reinforce a direction the water already gives. The poles are rhythm, not navigation.

<!-- Next: run PP-02 (Navigation by Sound) as a prototype to isolate the sound layer. -->
