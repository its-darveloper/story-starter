---
doc: spec
status: approved
---

# Sims 4 Story Starter (working title) — Technical Spec

## How This Works, In Plain Language

There are four pieces.

1. **The page.** A web page you open on your phone. It walks the player through the steps (pick a style, yap, answer follow-ups, set sliders, pick packs) and shows the finished plan as a stack of cards. It never talks to the AI itself.
2. **The little server.** A small program that runs on your laptop. It serves the page to your phone over home Wi-Fi, holds your secret AI key, and does the behind-the-scenes work. The page asks it for things; it replies.
3. **The pack notes.** One plain file of short, story-focused entries for each pack, written in our own words and reviewed by you. This is how the app knows Sims instead of guessing.
4. **The AI (Claude).** The server asks Claude to do the language work: reflect back what you said, ask follow-up questions, and write the plan.

**How a plan stays specific, not generic.** Before the AI writes anything, the server *randomly draws a few story ingredients* from the notes of the packs the player selected, filtered by the slider settings. Those ingredients, plus the player's own words, go to the AI. The randomness comes from the code, not the AI's habits, so the same inputs still produce different plans. This is a proof-of-concept version of the "roll" idea.

**Why this shape.** No accounts, no database, no framework, no hosting. The server holds the key because a key placed in a web page can be read by anyone who opens it. Plans are saved in the phone's browser, which is exactly what the PRD asks for ("same device").

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`

1. **Welcome** — the page shows intro text. Nothing is sent anywhere.
2. **Pick a style** — the page shows cards from a style list file. The choice is stored in the page's memory.
3. **Yap** — the player types or dictates into the box (the phone's own keyboard dictation). Tapped nudges add text to the box.
4. **Reflect and follow up** — the page sends the style and yap to the server (`POST /api/reflect`). The server asks Claude for a short reflection and a few follow-up questions about gaps, and returns them. The player answers.
5. **Set the dials** — four sliders and the supernatural checkbox. The page reads descriptions from a dials file and updates the label as the slider moves.
6. **Pick packs** — pack cards come from the pack notes file. If the player skips, no packs are sent.
7. **Make the plan** — the page sends everything to the server (`POST /api/plan`). The server (a) draws ingredients from the selected packs' notes (or the general notes if none), (b) builds a prompt with the player's words, answers, slider meanings, and ingredients, (c) calls Claude and asks for the plan in a fixed structure, (d) returns it.
8. **See the cards** — the page lays the plan out as cards, with the card matching the chosen style first.
9. **Save and reopen** — the page stores the plan in the browser's local storage. Next visit, a "My plans" list shows saved plans.

## Stack
- **Page:** plain HTML, CSS, and JavaScript, built mobile-first. No framework. Rationale: the learner wants a phone-friendly page that can become a PWA later; plain files are the least to debug and give full control of the Y2K look.
- **Server:** Node.js (installed locally: v23.11.0) using only built-in modules (`http`, `fs`, `fetch`). **No npm packages.** Rationale: one language across page and server, nothing to install.
- **AI:** Claude via the Anthropic Messages API, model `claude-sonnet-5-5` (listed on the API docs' model list). Rationale: the learner already works with Claude; the model is chosen once in a config line so it's easy to change.
- **Pack notes and style/dial text:** plain JSON files in `data/`.
- **Saved plans:** browser `localStorage`.
- **Docs:**
  - Messages API: https://platform.claude.com/docs/en/api/messages
  - Node.js: https://nodejs.org/docs/latest/api/
  - localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
  - PWA basics (later): https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- **Unverified, check early in the build:** the exact request headers (`x-api-key`, `anthropic-version: 2023-06-01`, `content-type: application/json`) and the response shape (`content[].text`). These are from general knowledge; the docs page I could read confirmed the endpoint path, the required `model` / `max_tokens` / `messages` fields, and the model ID, but cut off before the response section.

## Where It Runs and How Someone Tries It
- **Runtime:** a local Node.js process on the learner's laptop, plus a phone browser on the same Wi-Fi.
- **Requirements:** Node.js 20+ (this machine has 23.11.0) and an Anthropic API key in a local `.env` file (never committed).
- **Start:** `node --env-file=.env server/server.js`. The server prints the address, e.g. `http://192.168.x.x:3000`. Open it on the phone (or `http://localhost:3000` on the laptop).
- **Demo recording:** screen-record the phone or the laptop browser through the full flow (style → yap → follow-ups → sliders → packs → cards), then reopen to show the saved plan.
- **Submission:** a short demo video and a public GitHub repository are required. Deployment is optional and is not planned for the PoC. A public link comes later.

## Look and Feel
PRD ref: `prd.md > Look and Feel`

Direction from the learner's references (early-2000s doll-website style) and their stated priority that low cognitive load beats decoration.
- **Palette:** hot magenta and pink as the base; baby blue and lavender; aqua/teal accents; a white outer margin so the pinks pop. Gradients on tiles.
- **Navigation and buttons:** rounded pill buttons with colored outlines; a vertical stack of colorful icon tiles for steps.
- **Type:** rounded sans for UI; italic script-style headings on sticker-like tiles. System fonts or a web font with a system fallback so it works offline.
- **Details:** pixel-square mosaics in corners, speech/thought bubbles for the follow-up questions, pink name tags with arrows, sparkles, "+" marks.
- **Cards:** the plan is a stack/deck of cards that look like collectible tiles; closed cards show a headline.
- **Imagery:** interface decoration only (CSS and inline SVG). No illustrated characters or scenes in the PoC.
- **Original art only:** the style is recreated; no third-party logos, characters, or screenshots go in the repo.
- **Readability wins:** body text stays high-contrast and large enough on a phone; decoration never sits behind long text.

## Components

### Screen flow (the page)
Owns every screen from welcome to the plan, step navigation, and in-memory state for one run.
PRD ref: `prd.md > Screens and Layout`, `prd.md > The Core Journey`.

### Starting-style cards
Shows the list of styles from `data/starting-styles.json` (character-driven, plot-driven, "I just have a vibe," recreate a movie or book, build around a theme or pack, "I'm not sure / something else"). Each has a title and a plain description. The choice changes which nudges and follow-ups come next.
PRD ref: `prd.md > Features and Behavior > Starting-style choice`.

### Yap box and nudges
One large text box and tappable nudges from `data/nudges.json` (e.g., who do they clash with, pet peeves, favorite thing, obsessions, celebrity crush). Tapping a nudge inserts a prompt line into the box. Works with keyboard dictation; no custom speech code.
PRD ref: `prd.md > Features and Behavior > The yap`.

### Reflect and follow-up
Sends style and yap to `POST /api/reflect`. Shows the returned reflection and a few follow-up questions as speech bubbles; the player answers each (short answers are fine).
PRD ref: `prd.md > Features and Behavior > Reflect and follow up`.

### Dials
Four sliders (drama, predictability, relationship planning, pace), each with five positions and a plain-language description from `data/dials.json` that changes as it moves, plus the supernatural checkbox. The checkbox is disabled, with a visible note, unless a supernatural-capable pack is selected (Vampires, Realm of Magic, Paranormal Stuff, Get to Work, Werewolves).
PRD ref: `prd.md > Features and Behavior > Dials`.

### Pack picker
Shows pack cards from `data/pack-notes.json`, multi-select, with a visible Skip. Packs without notes yet are shown as "coming soon" and still selectable but contribute only general ingredients. *(Open for the build; see Decisions and Open Issues.)*
PRD ref: `prd.md > Features and Behavior > Pack selection`.

### Ingredient draw (server)
Chooses a handful of ingredients at random from the selected packs' notes (hooks, twists, relationship shapes, settings) and from the general notes when no pack is selected. Slider values bias the draw (for example, higher drama favors twists tagged "messy"). Accepts an optional `seed` so a demo or test can be repeated exactly.
PRD ref: `prd.md > Features and Behavior > Dials`, `prd.md > Features and Behavior > Pack selection`; `scope.md > The Unique Kernel`.

### Plan writer (server)
Builds the prompt (player's words, follow-up answers, slider meanings, ingredients, instructions to keep the goal loose), calls Claude, and asks for a fixed structure: premise, characters (each with personality details and connections), plotline with a loose goal, world and lot types, season. Checks the structure before returning it.
PRD ref: `prd.md > Features and Behavior > Plan Cards`.

### Plan cards and saved plans (the page)
Renders the structure as cards, leading with the card that matches the chosen style. Saves to local storage and lists saved plans on return.
PRD ref: `prd.md > Features and Behavior > Plan Cards`, `prd.md > States and Boundaries`.

## Data Model

| Data | Where it lives | Updated how | When the player leaves and returns |
|---|---|---|---|
| Current run (style, yap, answers, sliders, packs) | Page memory | As the player moves through steps | Lost on refresh (a run is short); the finished plan is what persists |
| Saved plans | Browser local storage on that device | Written when a plan is created; can be deleted by the player | Still there on the same browser and address |
| Pack notes, styles, dials, nudges | JSON files in `data/` | Edited by hand (with AI help) in the repo | Always available to the server and page |
| API key | `.env` on the laptop | Set once by the learner | Never sent to the page |

Plan shape (saved and returned):
```
{ id, createdAt, style, premise,
  characters: [{ name, headline, personality, connections }],
  plotline: { headline, body, goal },
  world: { world, lots, season },
  settings: { drama, predictability, relationships, pace, supernatural },
  packs: [codes] }
```

Pack note shape (one per pack):
```
{ code, name, supernatural, summary,
  characterTypes: [text], hooks: [{ text, tags }],
  twists: [{ text, tags }], settings: [text],
  sourceNote }
```

## File Structure
```
sims-skill-gameplay/
├── server/
│   ├── server.js          # starts the server, serves the page, routes /api calls
│   ├── draw.js            # ingredient draw (random, seedable, slider-biased)
│   ├── prompt.js          # builds the prompts for reflect and plan
│   └── claude.js          # one function that calls the Messages API
├── public/
│   ├── index.html         # the page shell
│   ├── css/styles.css     # palette, pills, tiles, bubbles, cards
│   ├── js/
│   │   ├── app.js         # screen flow and in-memory run state
│   │   ├── screens.js     # welcome, style, yap, follow-up, dials, packs, plan
│   │   ├── store.js       # saved plans in local storage
│   │   └── api.js         # calls to /api/reflect and /api/plan
│   └── img/               # original SVG decoration only
├── data/
│   ├── pack-notes.json    # reviewed pack entries (first: 4 owned supernatural packs)
│   ├── general-notes.json # general, base-game-friendly ingredients
│   ├── starting-styles.json
│   ├── nudges.json
│   ├── dials.json         # five descriptions per slider
│   └── pack-codes.md      # existing code→name table
├── tools/
│   └── read_packs.py      # existing: reads local pack text for drafting notes
├── devpost/               # Devpost learning workspace
├── .env                   # API key (git-ignored)
├── .gitignore
└── README.md              # how to run and what to show in the demo
```

## External Services and Dependencies
- **Anthropic Messages API**
  - Call: `POST https://api.anthropic.com/v1/messages`
  - Headers: `x-api-key: <key>`, `anthropic-version: 2023-06-01`, `content-type: application/json` *(verify early)*
  - Body: `{ model: "claude-sonnet-5-5", max_tokens, system?, messages: [{ role: "user", content }] }`
  - Response: text in `content[].text` *(verify early)*
  - Key: required, stored in `.env`. Cost: pay-per-use; a PoC demo is a few cents.
  - Docs: https://platform.claude.com/docs/en/api/messages
- **No other services.** No database, no hosting, no accounts.

## Important Failure Modes
- **The AI call is slow or fails** → the page shows a friendly loading state with a retry button and keeps everything the player entered.
- **The AI returns something not in the expected structure** → the server retries once; if it still fails, the page shows a plain "that didn't come out right, try again" message.
- **No pack selected, or a selected pack has no notes yet** → the draw uses `general-notes.json`, and the plan is still produced.
- **Phone can't reach the laptop** → the README lists the checks (same Wi-Fi, correct address, laptop awake); the demo can fall back to the laptop browser.
- **The laptop's address changes** → saved plans are tied to the address the page was opened from, so plans saved at one address won't appear at another. Noted for the build; to be fixed when there's a stable public address.

## What Was Simplified and Why
- **Plain page and built-in Node modules** instead of a framework and packages — nothing to install, fewer unfamiliar error messages; the fuller version would add a build step.
- **Browser storage** instead of accounts and a database — matches "same device"; the fuller version would add sign-in and a hosted database.
- **Four packs' notes written first** instead of all 30 — each entry needs a review from the learner; the rest follow the same format.
- **Interface decoration only** instead of illustrated characters or scenes — delivers the Y2K feel with the least asset work.
- **Laptop server** instead of a hosted service — free and simple; a public link comes later and needs rate limits and key handling.
- **Plan-time ingredient draw** instead of the full mid-game "roll" — proves the anti-generic idea at the start of a story only.

## Decisions and Open Issues

### Decisions
- **Web page, phone-first, PWA later** — learner's choice; tradeoff: no in-game integration.
- **Laptop first, public link later** — learner's choice; tradeoff: only the learner can use it for now.
- **Plain HTML/CSS/JS, Node server with no packages, Claude** — recommended and accepted by the learner; tradeoff: more hand-built UI than a framework.
- **Pack notes: drafted from game text and community sources, reviewed by the learner, written in our own words** — learner agreed; tradeoff: a review pass per pack.
- **First notes: Vampires, Realm of Magic, Paranormal Stuff, Get to Work** — the supernatural packs the learner owns. Werewolves is on the supernatural-capable list but the learner does not own it, so it gets no notes yet.
- **Random ingredient draw before the AI writes** — recommended and accepted; supports `scope.md > The Unique Kernel`.
- **Decoration only for imagery; original SVG/CSS art** — learner's choice.

### Learner uncertainty and what clarified it
- **"Where does the pack content come from and who writes it?"** — clarified by explaining three options (hand-written, drafted-and-reviewed, AI general knowledge); the learner chose drafted-and-reviewed. Check during the build: the first entry should read as true to the learner on review.
- **"Could imagery need generated images or SVGs?"** — clarified: SVG/CSS decoration is enough for the PoC; image generation is not needed.

### Open issues
- **Slider-to-ingredient bias:** how strongly each slider changes the draw is tuned during the build by checking that moving a slider visibly changes the plan.
- **Notes for packs without entries:** shown as selectable with general ingredients only; confirm this reads clearly.
- **Starting-style coverage:** the starting set may miss ways people play; research continues (`prd.md > Open Questions`).
- **Verify early:** the API headers and response shape noted under Stack.
