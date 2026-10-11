---
doc: scope
status: approved
---

# Sims 4 Story Starter (working title)

A guided, pack-aware story planner that interviews a Sims 4 player and hands them a concrete starting plan (characters, plot, place, time) so they can go into Create-a-Sim and play with a story already in hand.

## The Unique Kernel
Structure instead of "AI, give me ideas." The player chooses how they think (character-first, plot-first, or just a vague idea), sets dials such as drama (happy ending ↔ reality TV) and predictability (I choose ↔ surprise me), and the output is shaped by those dials and the packs they actually own. The long-term kernel is a D&D-style roll: when the player picks "surprise me," a roll with structure behind it decides the twist, so it doesn't regurgitate the same ideas.

## Who It's For
A Sims 4 player like the learner: character-first, loves building households and personalities, but stalls once gameplay starts and drifts toward "marry, have a kid, happily ever after." First for the learner, eventually other simmers, including people who don't know what a "skill" or "plugin" is. Today they brainstorm in their head or in Create-a-Sim, or ask generic AI, which doesn't understand Sims packs or mechanics.

## The Core Loop
Open it → it asks what kind of player you are (character-driven, plot-driven, or "I just have a vibe"), explained in plain, human language → a guided flow that adapts to that choice → set the dials (drama, predictability) and pick the packs you own → get a starting plan to use while creating the cast.

## Inspiration & Identity
Human-centered and intuitive: no jargon, nothing that makes the user (or the learner) go "wait, what?" Fun and creative in tone, like a game-night companion rather than a form. Their inspiration is the D&D feel of "roll and see." They have seen TikTok users using AI to generate gameplay and consider that approach repetitive and Sims-ignorant. Haven't looked at existing tools yet.

## Why This Matters to the Learner
"I wish I didn't have to leave the Sims screen." They want to pre-plan stories so that Create-a-Sim becomes execution, and they want gameplay to surprise them. It's useful to them first, and they'd like it to help other players eventually.

## What "Working" Looks Like
In a one-minute demo: open the app, answer "what kind of player are you?", walk through the guided flow (characters, time, place, plot, how it ties together, an open-ended goal), set the dials and packs, and end on a starting plan: who to create, the starting plotline, the kinds of lots and world, and the season to start in. The "oh, that's cool" beat: the plan reflects the packs they chose and the drama/surprise settings, and isn't generic.

## The POC Boundary
- A guided start-of-story flow that branches on how the player starts (character-driven / plot-driven / just an idea).
- Plain-language explanations of each starting style.
- Drama and predictability dials.
- Player selects which packs they own.
- Output: a starting plan covering characters (with backgrounds and how they connect), starting plotline, world/lot types, season, and a loose, non-specific goal (the goal must not force the story to an ending).
- Medium (skill, plugin, web page, other) to be decided in the spec.

## Later
- Mid-game mode: give it context (voice or notes about what happened, and eventually data from save files) and get new plotlines or surprises when play goes stale; the D&D-style "roll."
- Reading the player's pack list / game data from an uploaded file rather than selecting packs manually.
- Handling players who don't want surprises (the dial likely covers this).

## Explicitly Cut
- Custom content / mods support: more complicated; maybe v2.
- Save-file parsing and relationship/event data: unknown data availability, too heavy for the PoC.
