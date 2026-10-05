---
title: "Session 1: two patterns hiding in a puzzle game"
type: reverse-engineering
wing: level-design
topics: [player-guidance, scale, affordance, emergent-play]
patterns: []
author: jachym
date: 2026-08-12
status: draft
---

Not a chronological session like the others. Viewfinder is a small-scale spatial /
environmental puzzle game — close cousin to [[portal-series|Portal]] and Superliminal —
and going in, the plan was straightforward reverse engineering: watch the level design,
name the guiding decisions. Instead the interesting result was how hard that turned out
to be, and how that difficulty pointed at two patterns worth naming on their own:
**spatial expansion** and **playful environment modularity**. Source: audio commentary.

recording:

https://youtu.be/w0Sh0BNZixg?si=ZCdLAb2ds6b-1nYh

## Sequence

Enter a small level → read the open, lit space → snap a photo of something in it →
place the photo elsewhere → step into the photo → exit teleports onward

## Observations

1. **Affordance, relearned in minutes.** Coming back to the game after time away, the
   simple environmental code for what's interactable (which material takes a photo,
   which doesn't) took only a couple of minutes to re-internalize — a sign it was taught
   cleanly the first time, even though the underlying mechanic (photograph → placeable
   3D object) is unusual for a game to teach at all.
2. **Small, legible levels, still guided by light.** Each level is compact, opens into
   readable, open areas, and — like the [[indika]] entries keep noting elsewhere — light
   does real guidance work. The layout of a level is understood almost immediately,
   despite the underlying puzzle logic being genuinely hard to reverse-engineer.
3. **More placement freedom than Portal.** Portal restricts you to specific surfaces for
   its portals; Viewfinder lets you place a photo essentially anywhere and watch it
   reshape the accessible space around it — a meaningfully larger degree of environmental
   freedom than its closest genre neighbor.
4. **Getting stuck on purpose.** Players regularly get pulled off the critical path,
   placing photos in illogical spots just to see what happens, rather than beelining the
   solution — and this is read as a deliberate design win, not friction. Even hours in,
   messing around for its own sake stays fun.
5. **Playful environment modularity.** Naming the above pattern: the freedom to
   reshape the level like Lego bricks or a sand castle, inside otherwise small and
   constrained levels, resembles the openness of a children's building toy more than a
   typical puzzle game's single intended solution. It reframes the photo-placement
   mechanic from a neat gimmick into something the whole level design is built around.
6. **Solutions the developers probably didn't intend.** Because of that freedom, levels
   are frequently solved in ways that look unintended — visually messy or "wrong" —
   and still work. Compared to games that guide entirely through buttons, NPCs,
   dialogue, or blinking waypoint markers, being able to break or build the environment
   yourself reads as a genuine expansion of what counts as guidance, not a bypass of it.
7. **Spatial expansion.** The second named pattern: levels stay roughly the same
   physical footprint the whole way through — no sudden 10x-bigger areas — except that
   photographing something small (a painting, for instance) and stepping into the photo
   can make that painting's contents as large as an entire level. The scale of a space
   isn't fixed by its footprint; it's fixed by which photo you're currently standing
   inside. This keeps the same-scale repetition puzzle games usually settle into from
   ever fully setting in.
8. **The mechanic is diegetically load-bearing.** The sci-fi/virtual-reality framing
   isn't decoration on top of the photo mechanic — it's what makes photographing reality
   and stepping into the photograph feel physically believable rather than a cute trick,
   which in turn is what makes the spatial-expansion and modularity patterns land as real
   space rather than a UI gimmick.

<details>
<summary><strong>▸ Full walkthrough from the recording (structured notes)</strong></summary>

Jachym's commentary from the session recording, cleaned & structured — detail layer for
the observations above.

**Why not chronological (obs. overview).** Unlike the earlier sessions, this one
deliberately skips progression. Viewfinder is a spatial/environmental puzzle game in
the vein of Portal or Superliminal — most players already know roughly what to expect
going in: a sequence of small levels, each solved with one puzzle, loosely strung
together by a narrative that isn't the point here. Going in, the goal was to
reverse-engineer the level design decisions and how they guide the player. What was
actually interesting was discovering how hard those decisions were to spot — which
turned into the session's real subject.

**Affordance (obs. 1–2).** Coming back into a level after a break, the environmental
"code" for what's interactable versus not — texture, material — took only a few minutes
to re-learn. The core loop is simple once it clicks: take a photo, place it somewhere
else in the environment, and the photo becomes a 3D space you can walk into, helping
orient and progress. Every level runs point A to point B, ending in an exit/teleporter
to the next level.

**Freedom of placement (obs. 3–4).** The level of freedom given is called incredible —
arguably pushed further than Portal, where portals only go on specific approved
surfaces. Here a photo can go almost anywhere, reshaping what's accessible. This
regularly produces moments where players get stuck experimenting, placing photos in
illogical spots and doing "crazy stuff" purely for fun, instead of progressing —
flagged as a genuinely good addition, since it keeps things engaging even hours into
play, independent of actual level progress.

**Playful environment modularity (obs. 5–6).** Naming this pattern directly: the
freedom given resembles children's construction toys — Lego, building blocks — even
though play happens inside small, constrained levels. That constrained-but-moldable
feeling is satisfying specifically because most games guide through buttons, NPCs,
dialogue, weapons, blinking markers, and yellow lines — being able to break the
environment like Lego bricks, or build with it like a sand castle, feels refreshing.
Often the "intended" solution is obvious in hindsight, but just as often a level gets
solved in a way that clearly wasn't the intended one — ugly or illogical-looking, but
functional — and that adds its own extra satisfaction. This is treated as evidence the
developers built the game as a deliberate playground, not just a puzzle box, which
raises what the mechanic offers level design as a discipline more broadly.

**Spatial expansion (obs. 7).** A more specific, separate observation: levels stay
roughly the same physical size and time investment throughout, similar to Portal —
until the photo mechanic is used to jump inside a picture (a painting is the example
given) and suddenly that picture's contents are as large as an entire level. This
change of perspective keeps the game from feeling repetitive at a fixed scale, and it
ties directly into the mechanics and narrative simultaneously — not just a "pay
attention" trick, but a genuine, reproducible way of playing with digital space that
real-world architecture can't offer. Framed as a pattern with clear potential in other
genres entirely, not just puzzle games.

**Grounding the mechanic (obs. 8).** All of this works, and feels real rather than
gimmicky, because of the full sci-fi/virtual-reality framing around it — the fiction
makes changing physical space through photography feel plausible rather than just
funny. That fit between fiction and mechanic is called out as something the game gets
right about merging level design with a fully digital world.

**Closing note.** The plan going forward is to go level by level in more depth, since
each small "playground" appears to have its own way of introducing a new challenge
without ever losing the player inside an unfamiliar system.

</details>

### New threads

- **Spatial expansion (candidate pattern)** — a level's physical footprint stays
  constant, but stepping into a placed photo can make its contents full level-scale.
  Worth prototyping directly: rebuild one small room, then let the player photograph
  and "enter" a single object in it — how much bigger can that object's interior get
  before orientation breaks down?
- **Playful environment modularity (candidate pattern)** — freedom to reshape the level
  itself (not just navigate it) reframed as a toy-like affordance rather than a puzzle
  mechanic. Compare against [[indika]]'s much more restrictive, corridor-driven guidance
  — near-opposite ends of the same "how much do you let the player touch the level"
  question.
- **Unintended solutions as a feature, not a bug** — worth checking whether the level
  geometry is specifically built to tolerate "wrong" solutions, or whether that's an
  emergent side effect of giving so much placement freedom.
- **Affordance legibility after a break** — quick re-onboarding after time away is
  worth its own short note; compare against how other games (re-)teach interactable
  surfaces.

<todo>go level-by-level next session instead of staying at the pattern level — pick two or
three levels and map exactly where light, affordance cues, and photo-placement freedom
each do their share of the guidance.</todo>
