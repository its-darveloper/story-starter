# Story Starter

A pack-aware story planner for **The Sims 4**. Tell it how you like to start a story, spill your idea, answer a couple of questions, pick your packs, and set the mood. You get back a deck of cards: who to make in Create-a-Sim (down to turn-ons and pets), the starting plot and the first scene to play, and the world, lots, and season to start in. The ending is yours to play.

**Why it isn't generic:** before the AI writes anything, the code randomly draws story ingredients from hand-checked notes about the packs you picked, shaped by your mood dials. The plan follows a story frame (what the main Sim wants, the flaw in their way, an opponent with their own reasons, a day-one scene, and clues for any twist), and names are drawn from a large list each time. Trait, aspiration, turn-on, and pet options come from real game lists.

## Run it

You need [Node.js](https://nodejs.org/) 20 or newer and an [Anthropic API key](https://console.anthropic.com/). No packages to install.

1. Copy `.env.example` to `.env` and put your API key in it:
   ```
   ANTHROPIC_API_KEY=your-key-here
   ```
2. Start the server from this folder:
   ```bash
   npm start
   ```
3. Open the address it prints. `http://localhost:3000` works on the same computer. To use your phone, open the **"On your phone"** address while the phone is on the same Wi-Fi.

## Try it (the demo path)

1. On the welcome screen, tap **Start a new story**.
2. Pick **I start with characters** and write a sentence or two about a Sim. Tap a nudge if you're stuck.
3. Answer one or two of the follow-up questions.
4. Pick **Vampires** (or any pack), then on the mood screen slide **Drama** all the way up and tick **Add supernatural elements**.
5. Open the cards. Then go back to **My plans** on the welcome screen. The plan is saved on this device.

For the "it isn't generic" moment, make the same idea twice with Drama at 1 and then at 5, or with and without a pack.

## Phone troubleshooting

- **Phone can't load the page:** make sure the phone and computer are on the same Wi-Fi, the server is still running, and you typed the "On your phone" address exactly (including `:3000`). Some public or work networks block devices from talking to each other; a home network usually works.
- **Saved plans disappeared:** plans are saved in the browser, tied to the exact address you opened. If your computer's Wi-Fi address changes, plans saved at the old address won't show at the new one. Private browsing may not save plans at all.
- **"Couldn't reach the story server":** the server stopped. Run `npm start` again.

## How it's built

- `public/` is the page: plain HTML, CSS, and JavaScript, no framework.
- `server/` is a small Node server with no packages. It serves the page, holds the API key (the page never sees it), draws the story ingredients (`draw.js`), builds the instructions for Claude (`prompt.js`), and calls the Claude API (`claude.js`).
- `data/` holds the pack notes, mood dial wording, starting styles, nudges, Create-a-Sim options, and names.
- `tools/` has helper scripts for reading pack text from a local game install and rebuilding the name list.

## Credits and notes

- First names and surnames come from [Behind the Name](https://www.behindthename.com/), licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). `data/names.json` is a filtered adaptation shared under the same license; the original downloads are in `names/`.
- Pack notes are written in this project's own words. No game files, art, or text from The Sims 4 are included.
- The Sims is a trademark of Electronic Arts Inc. This is an unofficial fan project, not affiliated with or endorsed by EA.
