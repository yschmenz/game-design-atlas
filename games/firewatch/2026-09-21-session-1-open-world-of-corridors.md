---
title: "Session 1 — an open world made of corridors"
type: reverse-engineering
wing: level-design
topics: [navigation, player-guidance, open-world-structure, environmental-storytelling]
patterns: [PP-01, PP-05, PP-11, PP-14, PP-25]
author: jachym
date: 2026-09-21
status: done
---

Source: audio commentary, revisited a session played the day before — partly replayed
specifically to test how invisible walls and navigation cues read on a second pass, once
they're no longer a surprise. Also played in part by my girlfriend, a non-gamer, to see how
well the level design holds up for someone not used to coordinating a first-person camera
and movement independently — noted directly where relevant. Focus throughout is level
design and level art; narrative and dialogue are mentioned only where they explain a
spatial decision.

## Sequence

Truck in the parking lot (light-guided) → trail gate, first invisible wall → national park
intro, day/night foreshadowing → tower arrival (moonlit, high-ground reveal) → lookout room,
radio taught → first task: locate fireworks (landmark navigation) → return path blocked
(rope breaks), forced detour → short cave, disorientation → back at the tower, second task:
find the broken cable (landmark navigation reprised)

## Observations

1. **A red truck in an empty lot.** The very first navigational beat in the whole game is
   the simplest possible version of [[PP-01]]: one lit, distinctly colored object (the only
   red truck in the lot) in an otherwise plain space. Camera, movement, and interaction are
   all taught in the walk toward it.
2. **An open world made of corridors.** The map is shown whole from minute one, and the
   tower reveal later shows the entire park at a glance — both classic open-world signals —
   but nearly every path is a single, invisible-wall-gated corridor. Replaying specifically
   to probe the walls, they hold up even on a deliberate second attempt to break them. The
   trick is that the map itself fills in like an open-world map (regions revealed as
   visited, your own path drawn in) even though the actual traversal graph underneath is
   linear.
3. **Invisible walls dressed as terrain, not doors.** Rather than a locked gate or a hard
   stop, backward progress is blocked by something that reads as a believable obstacle — a
   bush, a slope — never as an obvious wall. Replaying with the specific intent to walk
   backward, it still feels natural rather than restrictive, because nothing about it
   announces itself as a barrier.
4. **A lookout tower lit by the moon.** [[PP-01]] again, at a larger scale: the tower and
   specifically its staircase are deliberately the brightest things in the frame at night,
   with the moon positioned directly behind the tower — monumentality and light stacking so
   there's no ambiguity about which way is up.
5. **The reveal from the top.** Climbing the tower hides the wider park until the very top,
   where the whole visible landscape opens up at once — a clean [[PP-11]] beat doing double
   duty: a payoff in its own right, and the thing that sells the open-world illusion, since
   the game wouldn't show all those places if none were ever reachable (even though the
   story gates them one chapter at a time).
6. **Navigating by what's actually happening, not a marker.** The first real task — find
   whoever's setting off fireworks — is solved by spotting smoke on the horizon from the
   tower, not a waypoint on a map. [[PP-05]] almost exactly as its own brief describes it:
   one visible landmark, and the player has to actually look for it.
7. **A diegetic compass, sized to stay out of the way.** The compass/map overlay used while
   walking toward the fireworks takes up a genuinely small, deliberately tested fraction of
   the screen — small enough that the environment stays the primary thing on screen, with no
   time pressure forcing reliance on it instead of looking around.
8. **Toggleable guidance, unlike some.** The interactable-highlight overlay taught early on
   can be turned off in settings for players who want less hand-holding — worth flagging
   next to [[control]]'s equivalent layer, which has no such option. Firewatch's version
   doesn't seem to hurt immersion much either way, but making it optional at all is itself a
   design decision worth noting.
9. **A door shut by circumstance, not by hand.** A rope breaking on the way down is what
   actually forces a detour back through new territory — the original path is never blocked
   outright, the tool that would let you use it is just removed, which reads as far less
   restrictive than an invisible wall alone.
10. **A short cave, engineered to feel like getting lost.** The cave's exit sits above the
    camera's natural sightline on the way in, so it's easy to walk right past it, get turned
    around in a genuinely tiny space, and feel briefly and harmlessly lost. [[PP-14]] used
    almost playfully, at a scale where the trick carries zero real risk.
11. **The same stones, recognized on the way back.** The return route reuses climbable
    stones already established on the way out — spotting the one with a faint discoloration
    (implying past hands on it) is what confirms "yes, this is the way." A clean instance of
    [[PP-25]]: the same space, revisited, now legible because of what was learned the first
    time through.
12. **Watched, without being told.** Whether the player bothers to put out an abandoned
    campfire or pick up litter around it is tracked somewhere the game never explains — for
    roughly half the game it stays unclear whether any of it matters at all. A reward-loop
    question distinct from the navigation patterns above: hidden, unconfirmed reactivity as
    its own immersion tool.
13. **Designed for someone who isn't used to a mouse and camera.** Watching a non-gamer play
    the same sections: the slow pace, absence of fail states, and constant diegetic
    confirmation (which stones are climbable, which objects react) reads as calibrated for
    exactly this audience — tense in an engaged way, never a frustrated one, despite no prior
    experience with first-person controls.

### New threads

- **Linear-as-open-world, as its own pattern** — nothing in PP-01 through PP-25 quite names
  this directly: a fully-visible, fillable-in map plus a high-ground reveal, laid over a
  strictly linear traversal graph underneath. Probably deserves its own pattern page rather
  than folding into [[PP-11]] or [[PP-05]] alone, since it's really the *cartography*
  selling a freedom the level graph doesn't actually have.
- **Circumstantial gating vs. the invisible wall** — observations 3 and 9 do the same job
  (stop backward progress) through two different tools: a wall that simply refuses you,
  versus removing the means (a broken rope) so refusal is never explicit. Worth a
  side-by-side prototype testing which one a player notices and resents more.
- **Optional vs. forced guidance UI, a live comparison** — Firewatch's togglable
  interactable-highlight sits right next to [[control]]'s non-togglable equivalent, flagged
  in that entry's own New Threads. Two shipped, well-regarded games taking opposite defaults
  on the same UI decision — worth a short comparison entry once a third example turns up.
- **Unconfirmed reactivity** — observation 12's hidden trash/campfire tracking has no clean
  pattern-library home yet; distinct from a normal reward loop because the player isn't even
  sure a loop exists.

## Conclusion

<todo — jachym: first session only, up through the second tower task. Curious whether the
linear-dressed-as-open-world illusion holds up as the map fills in further, or whether the
corridor becomes more visible as fewer regions stay unexplored. Continue next session.>
