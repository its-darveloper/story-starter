---
doc: prd
status: approved
---

# Sims 4 Story Starter (working title) — Product Requirements

A guided, pack-aware story planner that interviews a Sims 4 player about how they like to start a story and hands them a starting plan (as a deck of cards) to take into Create-a-Sim.
Source: `scope.md > The Core Loop`, `scope.md > The Unique Kernel`, `scope.md > What "Working" Looks Like`.

Guiding principle (from the learner): **human-centered design, low cognitive load, plain language, nothing that makes anyone say "wait, what?"**

## The Core Journey
Source: `scope.md > The Core Loop`

1. **Welcome.** The player lands on an intro that says what this is, how to use it, what they'll end up with, and why it exists.
2. **Pick a starting style.** They click one card describing the kind of player they are. Each card explains in plain words what that style means.
3. **Yap.** A big, friendly open box invites them to say whatever they imagine (about characters, if they picked character-driven). They can type or use their device's dictation. Small tappable prompts sit beside the box.
4. **Reflect and follow up.** The app reflects back what it heard and asks a few follow-up questions about the gaps.
5. **Pick packs.** They click the packs they own (as many as they want) or skip. *(Moved before the dials during the build, so the supernatural checkbox already knows which packs were picked.)*
6. **Set the dials.** They set drama and predictability.
7. **Get the plan.** The starting plan appears as a stack of cards, led by what they chose in step 2.
8. **Walk away** knowing who to create, the starting plotline, the kinds of lots and world, and the season to start in.
9. **Come back later.** The plan is saved on the same device, so they can reopen it while playing or when a story needs shaking up.

## Screens and Layout
Source: `scope.md > The POC Boundary`

- **Welcome screen:** what this is, how to use it, what you end up with, why it's built.
- **Starting-style screen:** a small set of cards, each with a title and a plain-language description.
- **Yap screen:** one large open text box, tappable nudge prompts beside it, a clearly visible way to continue.
- **Follow-up screen:** the app's short reflection of what it heard, then a few questions.
- **Packs screen:** a grid of pack cards, multi-select, with a visible skip.
- **Dials screen:** four sliders (drama, predictability, relationship planning, pace) with live descriptions, plus an opt-in supernatural checkbox.
- **Plan screen:** a stack/deck of cards (see Plan Cards below).

Navigation is one step at a time, forward through the flow, with the ability to go back.

**Where it runs:** a separate app that sits beside the game (second screen, phone, or a window the player flips to), not inside the game's Create-a-Sim screen. It must be comfortable at phone-screen size. *(Decided with the learner; an in-game mod is a long-term dream, deferred.)*

## Look and Feel
Source: `scope.md > Inspiration & Identity`

Established by the learner:
- **Vibe:** My Scene and Polly Pocket, early-2000s / Y2K websites: glossy, bubbly, playful, colorful, nostalgic.
- **Metaphor:** a world you peek into, with cards you open; a tarot / Yu-Gi-Oh "pull from a deck" feel is a possible fit.
- **Priority:** it should look and feel good, and low cognitive load wins over decoration.

Not yet established (open to research): exact colors and fonts, and how much of the card/tarot metaphor to use in the PoC.

## Features and Behavior

### Starting-style choice
Source: `scope.md > The Core Loop`

The player selects how they like to start a story. Options are described in plain language so each reads as "this is what this means if you're this kind of player."

Starting set (from the learner's own play): character-driven, plot-driven, "I just have an idea or a vibe," recreating a favorite movie or book, and building around a theme or pack. The set must feel well-rounded and cover how different people play; the learner expects to research gaps. Includes an "I'm not sure / something else" choice.

- As a player, I want to pick my starting style from clear descriptions so that I'm not confused about what I'm choosing.
  - [ ] Every option shows a title and a plain-language description of what it means for the player
  - [ ] An "I'm not sure / something else" option is present
  - [ ] After choosing, the next screen is shaped by the choice (e.g., character-driven prompts differ from plot-driven)

### The yap
Source: `scope.md > The Core Loop`

A single open box for stream-of-consciousness input. Typing and dictation are equals; accessibility is a requirement, not an extra. Short input is as welcome as long input.

- As a player, I want to say what I imagine in my own words so that the app builds on my ideas instead of making up generic ones.
  - [ ] The box accepts typed text of any length, including a few words
  - [ ] The screen works with the device's own dictation (no typing is required if the person can't or won't type, and no speaking is required if the person can't speak)
- Tappable nudge prompts add to the yap and make a character feel real rather than "just some Sims thing." Examples from the learner: who do they clash with, pet peeves, favorite thing, obsessions, celebrity crush.
  - [ ] Nudges are visible beside the box and can be ignored
  - [ ] Tapping a nudge helps the person respond to it (it does not force a long answer)

### Reflect and follow up
Source: `scope.md > The Unique Kernel`

After the yap, the app reflects back what it heard in plain words and asks a few follow-up questions about the gaps, the way a good interviewer would.

- As a player, I want the app to confirm what it understood and ask about what's missing so that the plan reflects my story.
  - [ ] The reflection mentions specifics from what the person actually said
  - [ ] Follow-ups target gaps (what wasn't covered), not what was already said
  - [ ] The number of follow-ups is small (a few)

### Dials
Source: `scope.md > The Unique Kernel`

Four sliders and one opt-in checkbox. Each slider shows a plain-language description of its current position that changes as the person moves it, so the person always understands what they've chosen. Descriptions are written as the *result* (for example, "a sweet, cozy storyline" through "reality-TV-level chaos"), not just a single word.

- **Drama:** from happy ending to reality-TV-level drama.
- **Predictability:** from "I choose" to "surprise me."
- **Relationship planning:** from "leave it open and see what happens" to "set up who's drawn to whom." Addresses the learner's tension about forcing pairings.
- **Pace:** from slow burn to things happening quickly.
- **Add supernatural elements** (opt-in checkbox): a layer on top of any style or other setting (e.g., romance plus supernatural). Not a slider. Only available if the person has selected at least one supernatural-capable pack: **Werewolves, Realm of Magic, Vampires, Paranormal Stuff, or the pack that has aliens (Get to Work).** Otherwise it is grayed out and not clickable, with a short visible explanation next to it (not hover-only, since phones have no hover) such as "Pick a pack with supernatural content to turn this on."

Tone was considered and left out because it overlaps with drama.

  - [ ] Each slider's description changes as it moves, and the descriptions are understandable without explanation
  - [ ] Changing a slider visibly changes the plan produced (the "oh, that's cool" beat)
  - [ ] Ticking the supernatural checkbox adds supernatural elements without changing the other settings
  - [ ] With no supernatural-capable pack selected (or packs skipped), the checkbox is grayed out, can't be clicked, and a visible note explains why

### Pack selection
Source: `scope.md > The POC Boundary`

The player clicks pack cards for the packs they own: as many as they want, including a partial list, with a visible skip.

  - [ ] Multiple packs can be selected and unselected
  - [ ] Skip is always available and moves forward without selecting anything
  - [ ] The resulting plan reflects selected packs (e.g., a horror/supernatural pack can bring vampires, werewolves, or witches into the plan)

### Plan Cards
Source: `scope.md > What "Working" Looks Like`

The starting plan appears as a stack of cards, **led by the style the person chose** (character-driven opens on characters; plot-driven opens on plot). Closed, each card shows a headline; the person opens a card for detail, so nothing arrives as a wall of text.

Card contents (starting set):
- **Characters** (one card each): personality details from the yap and follow-ups, and how they connect to the others. Each ends with a compact **For Create-a-Sim** checklist: orientation, jealousy and romantic boundaries, likes and dislikes, turn-ons and turn-offs (when Lovestruck is picked), and a pet (when Cats & Dogs or My First Pet Stuff is picked), using only options that exist in the game. *(Added during the build at the learner's request.)*
- **Plotline:** the starting storyline and a loose, non-specific goal (it must not force an ending).
- **World and lots:** the kind of world, the kinds of lots needed, and the season to start in.
- **Premise:** a short vivid summary of the story.

  - [ ] The first card shown matches the style the person chose
  - [ ] Every card is readable at a glance and expands for detail
  - [ ] The plan contains who to create, the starting plotline, the kinds of lots and world, and a starting season
  - [ ] The goal is loose (e.g., not a fixed end state)

## States and Boundaries

- **First use:** the welcome screen explains what, how, what you get, and why.
- **Skipped packs:** the plan is still produced, using general (not pack-specific) content, and the supernatural checkbox is unavailable with a visible explanation. *(Assumption: general content is base-game-friendly; confirm in review.)*
- **Almost-empty yap:** a few words or only tapped nudges are enough to continue; the follow-up step fills the gaps.
- **"I'm not sure" style:** the flow still works and helps them find a starting point.
- **Saved plans:** a finished plan is saved on the device the person used and can be reopened later on that same device. Cross-device sync and sharing are not in the PoC.
- **Phone-sized screen:** every step and the card stack must be usable on a phone-sized screen.

## Product Decisions

- **Choice cards over a blank slate for the starting style** — lower cognitive load; fits the human-centered principle. The set must feel well-rounded.
- **Open yap box plus nudges, with typing and dictation as equals** — gets stream-of-consciousness while acknowledging accessibility.
- **Reflect back and ask follow-ups** — mirrors the flipped-interaction approach; keeps the player authoring the story.
- **Cards, not one scrolling page** — one long page adds cognitive load.
- **Cards led by the chosen style** — "I want to see what I chose first."
- **Pack selection by clicking cards, with skip** — quick, not a chore; people with large collections can pick as many as they want.
- **Four sliders plus a supernatural opt-in** — supernatural is a layer you add, not a point on a scale; tone dropped as redundant with drama.
- **Unavailable options are grayed out, not hidden** — the person sees what they're missing and why, rather than wondering where it went.
- **Loose goal** — a specific goal feels like forcing the game toward an ending.
- **Separate app beside the game, phone-friendly** — an in-game mod is much heavier than a proof of concept; the player wants to avoid leaving the game screen, so a second screen or phone is the practical answer.
- **Plans saved on the same device** — people return to update a story or shake it up when it goes stale; same-device is enough for now.
- **Pack list comes from the learner's pack folders** — the `The Sims 4 Packs` folder is the true list of what they own; folder names identify packs (see `data/pack-codes.md`).
- **Use descriptive pack information** — the plan draws on what each pack brings (traits, careers, worlds, story hooks) written in our own words, not raw game data. Deeper data extraction is parked for the spec.
- **Y2K / My Scene / Polly Pocket look** — the learner's identity for the product.

## What We're Building
- Welcome screen
- Starting-style choice with plain-language options
- Yap box with tappable nudge prompts
- Reflect-and-follow-up step
- Four sliders (drama, predictability, relationship planning, pace) with descriptions that change as they move, plus an opt-in supernatural checkbox
- Pack selection by clicking, with skip
- Plan delivered as a stack of cards led by the chosen style
- Save a plan on the same device and reopen it later
- Layout that works on a phone-sized screen

## Deferred From the POC
- **Pack-list upload (CSV or file):** a player's pack folder names identify their packs (`data/pack-codes.md`), so this looks feasible, but clicking is enough for the PoC.
- **Mid-game "what happens next" mode and the D&D-style roll:** the second use case from `scope.md > Later`.
- **Reading save files / game data:** unknown availability; heavy.
- **Cross-device sync and sharing plans with others:** same-device saving is enough for the PoC; sharing (e.g., gameplay challenges) comes later.
- **Playing inside the game (mod in Create-a-Sim):** much heavier than a PoC; long-term dream.
- **Raw game-data extraction (tuning, "Sims math"):** parked; the PoC uses written descriptions.

## Possible Later Enhancements
- Tarot / Yu-Gi-Oh "draw a card" interaction tied to the roll.
- Voice input inside the app as a dedicated control.
- Custom content / mods awareness (cut in scope; maybe v2).

## Non-Goals
- Not a game or a replacement for Create-a-Sim; it plans, you play.
- No custom content / mod support.
- No account system.
- Does not force a specific story ending.

## Open Questions
- **Resolved: how the plan is used in game.** Separate app beside the game, phone-friendly, plans saved on the same device.
- **Resolved: persistence.** Plans are saved on the same device.
- **Resolved (direction): pack data.** Descriptive information (traits, careers, worlds, hooks) in our own words; sources discussed: the learner's own pack and game text, the Sims wiki, and community guides. Exact approach is a `4-spec` decision. Must be addressed in `4-spec`.
- **What starting styles are missing?** Research needed so the option set feels well-rounded. Can be investigated during the build; the starting set above is enough for the PoC.
- **Skill vs. app vs. other medium.** The learner wants something usable soon and something non-technical people can open. Must be decided in `4-spec`.
- **Resolved: dial controls.** Four sliders with live descriptions plus a supernatural opt-in checkbox. The exact wording for each position is written in the build.
- **Resolved: skipped packs.** The plan is general; supernatural is grayed out with a visible explanation until a supernatural-capable pack is selected. Supernatural-capable packs (decided by the learner): Werewolves, Realm of Magic, Vampires, Paranormal Stuff, and the pack with aliens (Get to Work).
- **How should the PoC prove the output isn't generic/repeating?** Candidate: dial and pack changes visibly change the plan. Confirm at review.
