---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [x] **1. Type a story idea and get a plan back as cards**
  Becomes usable: Start the server, open the page on the laptop or phone, type a few sentences about your Sims in the yap box, tap "Make my plan," and see a real Claude-written plan (premise, characters, plotline, world/lots/season) as a stack of tap-to-open cards.
  Why now: The Claude API call is the riskiest unknown (the spec flags the headers and response shape as unverified), and every later step depends on it. This slice also builds the server, the page shell, the Y2K base styles, and the plan structure check, so every later slice has somewhere to land.
  PRD ref: `prd.md > The Core Journey` (steps 3, 7, 8), `prd.md > Features and Behavior > Plan Cards`
  Spec ref: `spec.md > Stack`, `spec.md > External Services and Dependencies`, `spec.md > File Structure`, `spec.md > Components > Plan writer (server)`, `spec.md > Components > Plan cards and saved plans (the page)`, `spec.md > Look and Feel`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Create `server/server.js` (serves `public/`, routes `/api/plan`, prints the Wi-Fi address), `server/claude.js` (one Messages API call), `server/prompt.js` (plan prompt asking for the fixed plan shape as JSON, loose goal), structure check with one retry; `public/index.html`, `css/styles.css` (palette, pills, tiles, cards), `js/app.js`, `js/api.js`, a yap screen and a plan-card screen in `js/screens.js`; `.env.example`; friendly loading and retry message on failure.
  Verify (mechanical): Run `node --env-file=.env server/server.js` and confirm it starts and prints an address; `curl` the page (200) and `POST /api/plan` with a sample yap and confirm the reply parses as JSON with premise, characters, plotline (with goal), and world/lots/season; confirm the key never appears in any file under `public/`.
  Learner check: Start the server, open the address it prints (on your phone if you can), type a short idea about a Sim or two, make the plan, and open each card. Does it read like your idea, and does the look feel like the start of the Y2K vibe?
  Commit: `Yap box to Claude-written plan cards`

- [x] **2. Picked packs shape the plan (the anti-generic draw)**
  Becomes usable: A packs screen with cards for every pack you own, multi-select plus Skip. Picking Vampires (for example) pulls vampire-specific hooks, twists, and places into the plan; skipping still gives a base-game-friendly plan.
  Why now: This is the unique kernel — Sims knowledge plus code-driven randomness instead of "AI, give me ideas." It goes second so the rest of the build is shaped around it, and the pack notes need your review, which is the slowest feedback loop.
  PRD ref: `prd.md > Features and Behavior > Pack selection`, `prd.md > States and Boundaries` (skipped packs)
  Spec ref: `spec.md > Components > Pack picker`, `spec.md > Components > Ingredient draw (server)`, `spec.md > Data Model`, `spec.md > Decisions and Open Issues`
  Build: Draft `data/pack-notes.json` entries for Vampires, Realm of Magic, Paranormal Stuff, and Get to Work in our own words (using `tools/read_packs.py` on your pack text plus general knowledge), plus "coming soon" entries for the other packs you own from `data/pack-codes.md`; write `data/general-notes.json`; build `server/draw.js` (random, seedable); feed drawn ingredients into the plan prompt; add the packs screen with Skip and a "coming soon" label.
  Verify (mechanical): Run the draw with a fixed seed twice (same result) and two different seeds (different results); confirm picking Vampires draws only from Vampires notes and skipping draws from general notes; call `/api/plan` with Vampires selected and confirm the plan mentions at least one drawn ingredient.
  Learner check: Read the Vampires pack note and say whether it's true to the pack. Then make the same idea twice — once with Vampires picked, once skipping packs — and compare the plans.
  Commit: `Pack picker and seeded ingredient draw`

- [x] **3. Dials and the supernatural switch change the plan**
  Becomes usable: Four sliders (drama, predictability, relationship planning, pace) with descriptions that change as you move them, and an "Add supernatural elements" checkbox that is grayed out with a visible note until a supernatural-capable pack is picked. Moving drama from cozy to reality-TV visibly changes the plan.
  Why now: This completes the kernel — the "oh, that's cool" beat that the plan responds to your settings. It's the best moment for your early feedback, while there's still time to retune what the dials do.
  PRD ref: `prd.md > Features and Behavior > Dials`
  Spec ref: `spec.md > Components > Dials`, `spec.md > Components > Ingredient draw (server)`, `spec.md > Decisions and Open Issues` (slider-to-ingredient bias)
  Build: Write `data/dials.json` (five plain-language descriptions per slider); add the dials screen with live labels and the supernatural checkbox rule; bias the draw by slider (e.g., high drama favors "messy" twists, high predictability favors surprise twists); put slider meanings and the supernatural flag into the plan prompt.
  Verify (mechanical): With a fixed seed, run the draw at drama 1 vs drama 5 and confirm the ingredient mix shifts; call `/api/plan` at both extremes and confirm the plans differ in tone; load the page and confirm the checkbox is disabled with the note when no supernatural pack is picked, and enabled when Vampires is.
  Learner check: Move each slider and read the descriptions — do they make sense without explanation? Make the same idea at low drama and high drama and say whether the difference feels real.
  Commit: `Dials and supernatural switch shape the plan`

- [x] **4. Character cards carry the Create-a-Sim details**
  Becomes usable: Every character card ends with a compact "For Create-a-Sim" checklist: orientation, jealousy and romantic boundaries, likes and dislikes, plus turn-ons and turn-offs when Lovestruck is picked and a pet when Cats & Dogs or My First Pet Stuff is picked — all using options that really exist in the game.
  Why now: Learner request at the early checkpoint; it deepens the cards that already work, and it shapes the plan structure that saved plans (slice 6) will store, so it belongs before saving.
  PRD ref: `prd.md > Features and Behavior > Plan Cards`
  Spec ref: `spec.md > Components > Plan writer (server)`, `spec.md > Data Model`
  Build: Write `data/cas-options.json` (base-game orientation, romantic boundaries, likes/dislikes; Lovestruck turn-ons/offs and Cats & Dogs / My First Pet Stuff pets drawn from the learner's game text); add a per-character `cas` block to the plan shape and structure check; give Claude only the option lists the picked packs allow; render a compact checklist at the bottom of each character card.
  Verify (mechanical): Call `/api/plan` with and without Lovestruck and Cats & Dogs picked; confirm every character has orientation, boundaries, likes, and dislikes; confirm turn-ons/offs and pets appear only when their pack is picked and use names from the options file; confirm attractions in the plot are possible given each character's orientation.
  Learner check: Make a plan with Lovestruck and Cats & Dogs picked and open a character card. Could you build this Sim in Create-a-Sim straight from the checklist, and do the options match what you see in the game?
  Commit: `Create-a-Sim details on character cards`

- [x] **5. Your starting style shapes the questions and the cards**
  Becomes usable: Pick a starting style from plain-language cards; the yap screen shows nudges that fit it; after the yap, Claude reflects back what it heard and asks a few follow-up questions as speech bubbles; your answers go into the plan; the card stack opens on the card that matches your style.
  Why now: Builds on a working plan engine. The interview layer is what makes the plan feel like yours rather than generic, but it depends on the plan path being solid first.
  PRD ref: `prd.md > Features and Behavior > Starting-style choice`, `prd.md > Features and Behavior > The yap`, `prd.md > Features and Behavior > Reflect and follow up`, `prd.md > Features and Behavior > Plan Cards`
  Spec ref: `spec.md > Components > Starting-style cards`, `spec.md > Components > Yap box and nudges`, `spec.md > Components > Reflect and follow-up`, `spec.md > The Core Journey Through the System`
  Build: Write `data/starting-styles.json` and `data/nudges.json`; add the style screen; make nudges tappable and style-aware; add `POST /api/reflect` and its prompt; add the follow-up screen with bubbles and answer boxes; pass style and answers into the plan; order cards by style.
  Verify (mechanical): `POST /api/reflect` with a sample yap and confirm the reply names specifics from it and returns 2–4 questions; call `/api/plan` with style "plot-driven" and confirm the plotline card is first, and with "character-driven" a character card is first; confirm an almost-empty yap still continues.
  Learner check: Go through the flow as "character-driven" with a short yap. Does the reflection sound like it actually heard you, and do the follow-ups ask about things you didn't say?
  Commit: `Starting styles, nudges, and reflect-and-follow-up`

- [x] **6. The full journey: welcome, back buttons, and saved plans**
  Becomes usable: The whole flow from welcome screen to cards, with back buttons on every step, works comfortably on a phone. Finished plans save on that device, and a "My plans" list on the welcome screen reopens (or deletes) them later.
  Why now: Polish and persistence come last because they wrap a working journey; nothing earlier depends on them. Includes the README you'll need for the demo.
  PRD ref: `prd.md > The Core Journey` (steps 1, 9), `prd.md > Screens and Layout`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components > Screen flow (the page)`, `spec.md > Components > Plan cards and saved plans (the page)`, `spec.md > Data Model`, `spec.md > Important Failure Modes`, `spec.md > Look and Feel`
  Build: Welcome screen (what, how, what you get, why); step navigation with back; `public/js/store.js` for saved plans in local storage; "My plans" list with reopen and delete; decoration pass (sparkles, mosaics, name tags) that keeps text readable; README with run steps and phone troubleshooting.
  Verify (mechanical): Start the server and walk the full flow in the browser pane at phone width; confirm no console errors, back works on every step, a finished plan appears in "My plans" after reload, and delete removes it.
  Learner check: On your phone, go from the welcome screen to a finished plan, close the tab, reopen the address, and open your saved plan from "My plans."
  Commit: `Welcome, navigation, and saved plans`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 3 (packs and dials shaping the plan). Learner: dials feel right; asked for real aspirations and a fixed vampire-garlic setting (both done), and proposed richer character details (see Revisions).
- [x] Final kick-the-tires exploration and feedback completed — learner explored the full flow on their phone; feedback led to the welcome-copy and collage-restyle items below

## Final Review

- [x] Rewrite the welcome copy: shorter, plain, not salesy (learner: "too wordy and salesy")
- [x] Restyle to a handmade street-art collage look (learner references: the Beautiful Losers cover, a patterned tile panel, a cut-paper assemblage): off-white paper, chunky hand-cut display type, op-art patterned tiles in brick red / orange / cobalt / green / black, wood-frame edges; with fun, smooth, human interactions (plan cards dealt in as a collage, stamp-down tiles, sticker nudges, patterned dials), readable text, and reduced-motion support. Replaces the Y2K look in `prd.md` / `spec.md > Look and Feel`.
- [x] Final review complete — feedback resolved and learner confirms ready to ship (learner: "i love it as v1")

## Code Tour and App Map

- [x] Learning activity complete — prior practice connected (focused alternative)
- [x] Optional edit and transfer reflection addressed — edit not applicable; reflection already covered by the learner's own "am I over engineering?" check, transfer question offered
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Focused alternative, prior practice connected. During the build the learner asked "am I over engineering?" about the proposed story frame; it was checked against `scope.md > The Unique Kernel`, kept as a lean version (frame in `server/prompt.js`; cards show only Wants / Holding them back / Day one), and recorded under Revisions. Takeaway: when an idea grows mid-build, check it against the kernel and build the smallest version that serves it.
Route and stops: Reference route only (not toured): `server/draw.js` drawIngredients → `server/prompt.js` buildPlanPrompt / DIAL_EFFECTS / "How to build the plan" → `public/js/screens.js` planCards (+ `public/js/store.js` savePlan).
Edit outcome: Not applicable.
Reflection: Transfer question offered; not required.
Activity mode: Prior practice connected, plus the app map.

## Revisions

- Claude calls now use `max_tokens: 16000` and `effort: medium` (plus server-side refusal fallback) instead of a 2000-token cap — the build found this model always thinks first, and that thinking counts toward the cap, so richer slice-2 prompts got cut off mid-plan.
- The plan prompt now lists real base-game trait names and tells Claude not to invent traits — the learner's first plan contained a made-up trait ("Gloomy-turned-Cheerful"), the exact "AI doesn't know Sims" problem the kernel exists to fix.
- All four supernatural pack notes expanded to ~10–12 character types and hooks each, built from each pack's real gameplay systems (ranks, powers, weaknesses, schools of magic, careers, aspirations, named residents) — the learner's review found the first drafts too thin to give real variety between draws.
- Drawn ingredients became a menu instead of a checklist: Claude first names one central conflict ("heart"), then uses only the 1–2 ingredients that sharpen it (at least one from the player's packs when picked), reports which it used, and ties every character to that conflict — the learner found "weave every ingredient in" produced crowded plans with no central theme, unlike the focused slice-1 sisters story. Tradeoff accepted by the learner: with many packs picked, any one plan uses only one or two of them.
- Packs screen now comes before the dials (PRD Core Journey and spec journey updated) — the PRD's own rule that the supernatural checkbox unlocks only after a supernatural pack is picked couldn't work with dials first; learner chose the swap.
- Dial positions now carry firm, concrete instructions at each end (e.g. drama 4–5 requires a betrayal, exposed secret, or public blowup), and supernatural ON requires a supernatural main character and guarantees a supernatural ingredient on the menu — with soft wording, Claude anchored on the player's idea and drama 5 read almost like drama 3. Character types and settings in the four pack notes gained `supernatural` tags so the switch can filter them.
- New slice 4 added (Create-a-Sim details on character cards: orientation, jealousy/romantic boundaries, likes/dislikes, turn-ons/offs with Lovestruck, pets with Cats & Dogs or My First Pet Stuff); old slices 4–5 became 5–6 — the learner noticed at the early checkpoint that plans skip the CAS choices they actually make, and agreed to the cost (option lists from game text, longer plans, one more slice).
- Slice 4 grew during the learner check: life stage for every Sim, real pet ages and pet traits (from Cats & Dogs game text), pets kept on one owner's card, and a random name batch per plan drawn from Behind the Name (CC BY-SA 4.0, ~27k first names and ~7k surnames; attribution in `data/names.json`, raw downloads in `names/`, rebuilt by `tools/build_names.mjs`) — the learner noticed missing ages and pet details, and repeated names ("Marisol Vega", "Biscuit") across plans. NameDB (no stated license) and name-dataset (built from the Facebook leak) were considered and rejected. The README in slice 6 must credit Behind the Name.
- Plans now follow a story frame drawn from the learner's three story-craft sources (NowNovel, Archway, Scribophile): protagonist want + linked inner flaw, opposition with its own reason, a day-one inciting incident, personal stakes, seeded clues instead of unexplained twists, a protagonist who acts, and a dramatic question in place of an ending (the player plays the resolution). Lean version chosen by the learner: the frame is worked out in the prompt; cards show only "Wants", "Holding them back", and "Day one" — the learner found a plan with vivid characters but a flat, reactive story. Plans take ~20s instead of ~15s.
- Pack picker lists the 26 owned packs whose names are known (high/medium confidence in `data/pack-codes.md`); four low-confidence kits (SP29, SP40, SP43, SP46) are left off until identified — showing a guessed name would add a "wait, what?" moment.

