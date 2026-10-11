// Builds the prompts sent to Claude, and checks that a plan came back in the right shape.

export const PLAN_SYSTEM = `You help a Sims 4 player plan the start of a story before they open Create-a-Sim.
Build on the player's own ideas; never replace them with generic ones.
Be specific and vivid, and use real Sims 4 things (traits, aspirations, careers, worlds, lot types) where they fit.
The goal must stay loose: a direction to play toward, never a fixed ending (no "they get married and live happily ever after").
Reply with JSON only, no other text.`;

const PLAN_SHAPE = `{
  "premise": "2-3 vivid sentences summarizing the story",
  "characters": [
    {
      "name": "full Sim name",
      "headline": "one short line, e.g. 'The burnt-out barista with a secret'",
      "personality": "traits, likes/dislikes, quirks, aspiration, career, in a few sentences",
      "connections": "how this Sim connects to the others"
    }
  ],
  "plotline": {
    "headline": "one short line",
    "body": "the starting storyline in a few sentences",
    "goal": "a loose direction to play toward, not an ending"
  },
  "world": {
    "world": "which world and why",
    "lots": "the kinds of lots to build or find",
    "season": "the season to start in and why"
  }
}`;

export function buildPlanPrompt({ yap }) {
  return `Here is what the player imagines, in their own words:
"""
${yap}
"""

Write a starting plan with 2-4 characters. Use this exact JSON shape:
${PLAN_SHAPE}`;
}

// Pull the JSON object out of Claude's reply and check it has every part of a plan.
// Returns the plan, or null if anything is missing.
export function parsePlan(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  let plan;
  try {
    plan = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
  const filled = (s) => typeof s === 'string' && s.trim().length > 0;
  const ok =
    filled(plan.premise) &&
    Array.isArray(plan.characters) && plan.characters.length > 0 &&
    plan.characters.every((c) => filled(c.name) && filled(c.headline) && filled(c.personality) && filled(c.connections)) &&
    plan.plotline && filled(plan.plotline.headline) && filled(plan.plotline.body) && filled(plan.plotline.goal) &&
    plan.world && filled(plan.world.world) && filled(plan.world.lots) && filled(plan.world.season);
  return ok ? plan : null;
}
