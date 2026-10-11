---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [ ] **1. Type a story idea and get a plan back as cards**
  Becomes usable: Start the server, open the page on the laptop or phone, type a few sentences about your Sims in the yap box, tap "Make my plan," and see a real Claude-written plan (premise, characters, plotline, world/lots/season) as a stack of tap-to-open cards.
  Why now: The Claude API call is the riskiest unknown (the spec flags the headers and response shape as unverified), and every later step depends on it. This slice also builds the server, the page shell, the Y2K base styles, and the plan structure check, so every later slice has somewhere to land.
  PRD ref: `prd.md > The Core Journey` (steps 3, 7, 8), `prd.md > Features and Behavior > Plan Cards`
  Spec ref: `spec.md > Stack`, `spec.md > External Services and Dependencies`, `spec.md > File Structure`, `spec.md > Components > Plan writer (server)`, `spec.md > Components > Plan cards and saved plans (the page)`, `spec.md > Look and Feel`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Create `server/server.js` (serves `public/`, routes `/api/plan`, prints the Wi-Fi address), `server/claude.js` (one Messages API call), `server/prompt.js` (plan prompt asking for the fixed plan shape as JSON, loose goal), structure check with one retry; `public/index.html`, `css/styles.css` (palette, pills, tiles, cards), `js/app.js`, `js/api.js`, a yap screen and a plan-card screen in `js/screens.js`; `.env.example`; friendly loading and retry message on failure.
  Verify (mechanical): Run `node --env-file=.env server/server.js` and confirm it starts and prints an address; `curl` the page (200) and `POST /api/plan` with a sample yap and confirm the reply parses as JSON with premise, characters, plotline (with goal), and world/lots/season; confirm the key never appears in any file under `public/`.
  Learner check: Start the server, open the address it prints (on your phone if you can), type a short idea about a Sim or two, make the plan, and open each card. Does it read like your idea, and does the look feel like the start of the Y2K vibe?
  Commit: `Yap box to Claude-written plan cards`

- [ ] **2. Picked packs shape the plan (the anti-generic draw)**
  Becomes usable: A packs screen with cards for every pack you own, multi-select plus Skip. Picking Vampires (for example) pulls vampire-specific hooks, twists, and places into the plan; skipping still gives a base-game-friendly plan.
  Why now: This is the unique kernel — Sims knowledge plus code-driven randomness instead of "AI, give me ideas." It goes second so the rest of the build is shaped around it, and the pack notes need your review, which is the slowest feedback loop.
  PRD ref: `prd.md > Features and Behavior > Pack selection`, `prd.md > States and Boundaries` (skipped packs)
  Spec ref: `spec.md > Components > Pack picker`, `spec.md > Components > Ingredient draw (server)`, `spec.md > Data Model`, `spec.md > Decisions and Open Issues`
  Build: Draft `data/pack-notes.json` entries for Vampires, Realm of Magic, Paranormal Stuff, and Get to Work in our own words (using `tools/read_packs.py` on your pack text plus general knowledge), plus "coming soon" entries for the other packs you own from `data/pack-codes.md`; write `data/general-notes.json`; build `server/draw.js` (random, seedable); feed drawn ingredients into the plan prompt; add the packs screen with Skip and a "coming soon" label.
  Verify (mechanical): Run the draw with a fixed seed twice (same result) and two different seeds (different results); confirm picking Vampires draws only from Vampires notes and skipping draws from general notes; call `/api/plan` with Vampires selected and confirm the plan mentions at least one drawn ingredient.
  Learner check: Read the Vampires pack note and say whether it's true to the pack. Then make the same idea twice — once with Vampires picked, once skipping packs — and compare the plans.
  Commit: `Pack picker and seeded ingredient draw`

- [ ] **3. Dials and the supernatural switch change the plan**
  Becomes usable: Four sliders (drama, predictability, relationship planning, pace) with descriptions that change as you move them, and an "Add supernatural elements" checkbox that is grayed out with a visible note until a supernatural-capable pack is picked. Moving drama from cozy to reality-TV visibly changes the plan.
  Why now: This completes the kernel — the "oh, that's cool" beat that the plan responds to your settings. It's the best moment for your early feedback, while there's still time to retune what the dials do.
  PRD ref: `prd.md > Features and Behavior > Dials`
  Spec ref: `spec.md > Components > Dials`, `spec.md > Components > Ingredient draw (server)`, `spec.md > Decisions and Open Issues` (slider-to-ingredient bias)
  Build: Write `data/dials.json` (five plain-language descriptions per slider); add the dials screen with live labels and the supernatural checkbox rule; bias the draw by slider (e.g., high drama favors "messy" twists, high predictability favors surprise twists); put slider meanings and the supernatural flag into the plan prompt.
  Verify (mechanical): With a fixed seed, run the draw at drama 1 vs drama 5 and confirm the ingredient mix shifts; call `/api/plan` at both extremes and confirm the plans differ in tone; load the page and confirm the checkbox is disabled with the note when no supernatural pack is picked, and enabled when Vampires is.
  Learner check: Move each slider and read the descriptions — do they make sense without explanation? Make the same idea at low drama and high drama and say whether the difference feels real.
  Commit: `Dials and supernatural switch shape the plan`

- [ ] **4. Your starting style shapes the questions and the cards**
  Becomes usable: Pick a starting style from plain-language cards; the yap screen shows nudges that fit it; after the yap, Claude reflects back what it heard and asks a few follow-up questions as speech bubbles; your answers go into the plan; the card stack opens on the card that matches your style.
  Why now: Builds on a working plan engine. The interview layer is what makes the plan feel like yours rather than generic, but it depends on the plan path being solid first.
  PRD ref: `prd.md > Features and Behavior > Starting-style choice`, `prd.md > Features and Behavior > The yap`, `prd.md > Features and Behavior > Reflect and follow up`, `prd.md > Features and Behavior > Plan Cards`
  Spec ref: `spec.md > Components > Starting-style cards`, `spec.md > Components > Yap box and nudges`, `spec.md > Components > Reflect and follow-up`, `spec.md > The Core Journey Through the System`
  Build: Write `data/starting-styles.json` and `data/nudges.json`; add the style screen; make nudges tappable and style-aware; add `POST /api/reflect` and its prompt; add the follow-up screen with bubbles and answer boxes; pass style and answers into the plan; order cards by style.
  Verify (mechanical): `POST /api/reflect` with a sample yap and confirm the reply names specifics from it and returns 2–4 questions; call `/api/plan` with style "plot-driven" and confirm the plotline card is first, and with "character-driven" a character card is first; confirm an almost-empty yap still continues.
  Learner check: Go through the flow as "character-driven" with a short yap. Does the reflection sound like it actually heard you, and do the follow-ups ask about things you didn't say?
  Commit: `Starting styles, nudges, and reflect-and-follow-up`

- [ ] **5. The full journey: welcome, back buttons, and saved plans**
  Becomes usable: The whole flow from welcome screen to cards, with back buttons on every step, works comfortably on a phone. Finished plans save on that device, and a "My plans" list on the welcome screen reopens (or deletes) them later.
  Why now: Polish and persistence come last because they wrap a working journey; nothing earlier depends on them. Includes the README you'll need for the demo.
  PRD ref: `prd.md > The Core Journey` (steps 1, 9), `prd.md > Screens and Layout`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components > Screen flow (the page)`, `spec.md > Components > Plan cards and saved plans (the page)`, `spec.md > Data Model`, `spec.md > Important Failure Modes`, `spec.md > Look and Feel`
  Build: Welcome screen (what, how, what you get, why); step navigation with back; `public/js/store.js` for saved plans in local storage; "My plans" list with reopen and delete; decoration pass (sparkles, mosaics, name tags) that keeps text readable; README with run steps and phone troubleshooting.
  Verify (mechanical): Start the server and walk the full flow in the browser pane at phone width; confirm no console errors, back works on every step, a finished plan appears in "My plans" after reload, and delete removes it.
  Learner check: On your phone, go from the welcome screen to a finished plan, close the tab, reopen the address, and open your saved plan from "My plans."
  Commit: `Welcome, navigation, and saved plans`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 3 (packs and dials shaping the plan)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions

