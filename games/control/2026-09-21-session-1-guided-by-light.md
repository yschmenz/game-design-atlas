---
title: "Session 1 — guided by light through a bureaucratic labyrinth"
type: reverse-engineering
wing: level-design
topics: [player-guidance, navigation, environmental-storytelling, combat-spaces, architecture]
patterns: [PP-01, PP-02, PP-08, PP-19, PP-20]
author: jachym
date: 2026-09-21
status: done
---

Source: audio commentary, revisited and re-narrated shortly after roughly an hour and a
half of first-time play — not live, so these are already a first pass of reflection, not
raw in-the-moment reaction. Level art and level design get treated as one thing throughout,
because in this game they clearly are one decision, not two. Focus is on how the player is
guided through a multi-layered environment; story beats are mentioned only where they
explain a spatial decision. Honest caveat up front: by the end of the hour the loop was
starting to feel repetitive — noted properly in observation 16.

## Sequence

Cinematic intro (FBC lobby) → light-guided round hallway → janitor NPC (light + sound) →
space betrayal, back at the lobby → elevator to the waiting hall → director's office + map
reveal → crystal dream test-chamber (combat tutorial) → hallway ambush (floating figures) →
cover-combat hall → vault → verticality combat hall → boss → clear-and-loop back to the hub

## Observations

1. **Monumental architecture, mundane bureaucracy.** The Federal Bureau of Control reads as
   an allegory for state administration — brutalist concrete, cathedral-scaled lobby —
   furnished with the most mundane office debris imaginable: a framed "employee of the
   month"-style portrait, loose paperwork, a plain reception desk. The whole atmosphere runs
   on the gap between those two registers, closer to *Severance*, *Twin Peaks*, and Kafka's
   bureaucratic nightmares than to a typical shooter's establishing area.

2. **A guidance layer with no off switch.** An interactable-highlighting UI overlay runs
   constantly and there's no setting to disable it. It earns its keep as an opening
   tutorial, but once the environment is already doing so much guiding work on its own (see
   3–4), it starts to feel like belt-and-braces the game won't let the player remove —
   worth testing what actually breaks if it's stripped away once light and sound are
   established. [[player-guidance]]

3. **Light as the default thread.** The first hallway is a looping, non-obvious layout —
   glass-walled offices left and right, no straight line to follow — solved entirely by
   picking the one lit room out of several identical dark ones. This repeats as the primary
   guidance tool through the whole opening. [[PP-01]]

4. **Sound picks up where light leaves off.** Approaching the first named NPC (a janitor),
   the light shifts from tutorial-white to a dim blue-grey and a barely-audible hummed tune
   becomes the actual guide — his back is turned, so sound rather than sight is what
   confirms "go here." It doesn't quite match [[PP-09]]'s brief (an NPC giving directions
   elsewhere) — he isn't directing the player anywhere, he *is* the destination — so this
   reads as light and sound stacking on a landmark rather than a distinct wayfinding pattern
   of its own. [[PP-02]]

5. **Light's color carries state, not just a path.** Bright white reads as "safe, go here,
   explore"; the same trick rendered in dim blue-grey reads as "story beat ahead, approach
   carefully." Same mechanism, different meaning purely from color temperature.

6. **The building lies about its own layout.** After looping back to the same lobby the
   player started in, a doorway that was open on the way in is now a solid wall with a
   couch in front of it. Easy to miss entirely, and not a bug — it's the first proof,
   delivered spatially rather than through dialogue, that the building doesn't hold still.
   [[environmental-storytelling]]

7. **Physics as foreshadowing.** Every loose object in the abandoned wing — boxes, pipes,
   scattered paperwork — reacts to physics well before the player has any tool that uses it.
   It reads as scene-setting first, but it's really pre-loading the telekinesis mechanic
   (throwing objects as weapons) several rooms before it's actually taught.

8. **A map that reveals the game, not the building.** The first map screen shows a
   non-Euclidean, crystal-like growth pattern instead of a normal floor plan, well before
   there's any narrative reason to expect that. It does double duty: foreshadowing the
   story's spatial instability, and telling the player the game will be hub-and-spoke with
   fast travel rather than one linear corridor, before either mechanic is introduced.

9. **A shooting range disguised as a dream.** The first combat tutorial doesn't look like a
   test chamber — it's staged as a dreamlike, floating-crystal-island space, reusing the
   same crystal material seeded in observation 7. Because it's diegetically framed as a
   vision rather than a training room, it teaches jump, climb, melee and ranged combat
   without the progression ever feeling paused.

10. **Enemies arrive as a teaching curriculum, not a fight.** The tutorial's enemy waves are
    sequenced deliberately: one unarmed enemy alone, then three unarmed enemies together,
    then two armed enemies using cover for the first time. Each wave adds exactly one new
    thing to react to.

11. **The fast-travel beam is narrative glue, not just a menu.** Using the beam-exit for the
    first time returns the player to the exact office where the gun was picked up — learning
    to shoot and learning to fast-travel happen in the same beat, and the geometry itself
    confirms "you're back where the story left off."

12. **Threats are foreshadowed in plain sight, then dropped.** Floating human figures are
    visible ahead of time in several rooms before they activate — a player not looking up
    would miss the warning entirely and get ambushed the moment they cross into range,
    clearly by design (the game replays the same figures dropping in full light once you're
    past them).

13. **Cover reads through material, not markers.** Solid cover (concrete blocks, cabinets, a
    central structural column) fully blocks enemy fire; soft cover (office tables, glass)
    blocks sightlines but not shots. The distinction is entirely legible from what the
    object is made of, no icon or highlight required. This sits close to [[PP-20]] but is
    about cover *type*, not density — flagged rather than force-fit, see New threads.
    [[combat-spaces]]

14. **High ground as a free scouting phase.** At least one combat room is entered from a
    floor above rather than at floor level, which hands the player a beat to read the cover
    layout and enemy positions before anything triggers — a plain instance of [[PP-19]]
    rather than a difficulty gimmick.

15. **The boss inherits the room's own rules.** The first boss fights using the same
    solid-cover objects the player has been trained to use, rather than a special-cased
    arena — the fight reads as an extension of the combat grammar already taught, not a new
    one.

16. **One kit, redressed per room.** Each cleared area gets its own small, distinct
    furniture and color identity (one hall is named on its own map marker, "central
    executive"), but the underlying grammar repeats exactly: clear the crystal, the room
    reverts to office lighting, the pyramid husk stays visible as a scar. Efficient, and
    also where the session's own energy started to flag — recognizable after an hour as the
    same loop in new dressing.

### New threads

- **Space betrayal** — a spatial-memory trick (a walked-through door becomes a wall) with no
  clean analog yet in the pattern library. [[PP-01]]/[[PP-02]] are about earning the
  player's trust in a direction; this is closer to withdrawing it after the fact. Candidate
  for a new pattern code once a second example turns up elsewhere.
- **Guidance redundancy as a testable question** — light, sound, and a permanent UI hint
  layer are all doing the same job in the opening hour. A stripped-down prototype (light and
  sound only, hint layer off) would show whether the redundancy is padding or genuinely
  load-bearing for a general audience.
- **Cover legibility by material, not by density** — [[PP-20]]'s own brief is about *how
  much* cover is in a room; this session is about *what kind*, signalled by material alone.
  Possibly deserves its own pattern rather than being folded into PP-20.
- **Diegetic tutorial-as-dream** — worth a topic-case-study on its own: the combat tutorial
  never breaks the fiction because it's framed as a vision, not a menu screen.

The tonal mix of high seriousness and office-life absurdity is the same trick [[bioshock]],
[[portal-series]], and [[the-stanley-parable]] each run in their own way — worth a
comparison pass later. Also reads like Twin Peaks and David Lynch generally, and Kafka's
bureaucratic nightmares in prose form; neither is in the atlas, noted here for my own
memory.

## Conclusion

<todo — jachym: this was the first hour only. Curious whether the level design escalates
once telekinesis and the rest of the kit are unlocked, or whether the repetition flagged in
observation 16 gets addressed as the building's geometry gets stranger. Continue next
session.>
