---
title: What I remember, two years later
type: reverse-engineering
wing: level-design
topics: [reward-loops, quest-structure, emotional-design]
patterns: []
author: schmenz
date: 2026-08-09
---

Played and finished Citizen Sleeper in two sittings back in 2024. Total playtime sits
around 30 hours, and the playthrough itself took less than that — so I went back in once
or twice after "finishing," without ever fully committing to a proper replay. Writing
this from memory, the night before starting
[[citizen-sleeper-2|Citizen Sleeper 2]], so it's really a record of what stuck rather
than a session log.

1. **The day is the clock, not a UI element** — dice rolls define how many actions you
   get before the cycle ends, and that single constraint is what makes every choice feel
   urgent. It's a resource-management loop wearing a narrative costume.
2. **More arcs than you can carry** — nearly everyone on the station has a problem, and
   helping them is how you access their story. There is structurally more content than
   one playthrough can hold, so triage isn't optional flavor — it's the actual skill the
   game is testing. Deciding who *not* to help is the real decision.
3. **The unfinished feeling is a designed outcome, not a failure state** — I finished
   the game and still walked away wondering what I'd missed. That residue is doing work:
   it's what made me open to a sequel and to the idea that Citizen Sleeper 1 might have
   "unfinished business" bleeding into it.
4. **Almost nothing moves, and it doesn't matter** — static illustrated portraits
   (Guillaume Singelin's art, comic-adjacent but not graphic-novel) carried more
   emotional weight than animation would have. The stillness reads as restraint, not
   limitation.
5. **Music is the actual UI layer** — the interface itself is sparse (menus, a station
   map, dice), so the score is doing the emotional signaling that animation or voice
   acting would elsewhere. A handful of audio cues mark quest pop-ups, urgency, day-end.
   Literally true, not a figure of speech: I finished the whole game in two single
   nights, and didn't notice either one passing.
6. **The station is a level that unlocks, then consolidates** — you don't start with the
   full map; sections open as you earn access. But it stays one continuous place rather
   than a hub-and-spoke of separate zones — which from what I've heard is exactly what
   changes in Citizen Sleeper 2 (travel between locations instead of one station).
7. **False freedom via introduced timers** — an NPC arrives, sets a deadline ("in X
   days, this happens"), and suddenly the open-feeling world has a direction forced on
   it. You can ignore it, but ignoring it has teeth — I hit a genuine game-over state
   from letting one of these lapse.
8. **Light RPG systems, no filler** — skill points, leveling, unlockable actions
   (hacking, forcing doors), but no cosmetics, no systems that exist just to pad
   playtime. Everything present felt mechanically load-bearing.
9. **The writing runs on lived experience, not academic research** — Gareth Damian
   Martin (solo writer/designer) has said the disposable-labor and transhumanism themes
   came directly out of their own experience with depression, depersonalisation, gender
   dysphoria, and gig work — not a research project. Named influences: *Cowboy Bebop*'s
   "gig-work and loneliness" mood, and
   [[diaries-of-a-spaceport-janitor|Diaries of a Spaceport Janitor]] (already in our
   atlas), which is what convinced them the concept could work at all. *cf. interviews
   with Gareth Damian Martin, GamesHub and Rascal.*
10. **A team of essentially one, working apart** — one person (writing, design,
    engine) collaborating remotely with a composer and an illustrator who, as far as I
    know, never worked in the same room. The game's consistency of voice probably owes
    something to that single point of authorship.

### New threads
- **Same clock, new shape?** — check tonight whether Citizen Sleeper 2 keeps the
  day/dice cycle as the core loop, or restructures it now that travel between locations
  is possible.
- **Does the station's "unfinished business" actually carry over**, or is this
  deliberately a soft reboot to onboard players who skipped the first game?
- **Pay attention to the audio layer on purpose this time** — first time through I
  absorbed it passively; worth actively tracking what triggers what.
- **Revisit the timer-as-freedom-illusion pattern** — [[reward-loops]] — worth checking
  whether this shows up again and whether it still produces the same urgency once you
  expect it.
- **Track systems by name, not by vibe** — tonight's goal is to name the specific
  mechanism at the moment I notice it, rather than log a general impression afterward.

## Why we keep coming back to this game

Citizen Sleeper is turning into a default reference point for our own prototypes, on
a few specific axes:

- **Animation-light interface design** — if what we're building leans on UI rather than
  animated scenes to carry emotion, this is the game to study first.
- **Systems that generate narrative, rather than narrative bolted on top of systems** —
  the dice-and-day mechanics aren't just pacing; they're the actual mechanism producing
  branching outcomes. Worth tracing which system drives which layer: what drives
  narrative branching, what drives character development, what carries atmosphere,
  what carries the writing.
- **A small-team scope benchmark** — one person plus a couple of outside collaborators
  (composer, illustrator) reaching this level of polish in writing, art, and music is a
  realistic ceiling to point our own prototypes at, given we're a comparably small team.
- **A "does what it promises" case study** — niche, text-heavy, won't be for everyone,
  but mechanically it delivers exactly what it sets out to and keeps you hooked start to
  finish. Worth understanding why that promise-keeping works.

> I quickly realized there were more story arcs than I could actually do, which left me,
> even after finishing, with the feeling I'd missed something.
