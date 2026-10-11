// Builds the prompts sent to Claude, and checks that a plan came back in the right shape.

import { general, dials, casOptions } from './draw.js';

export const PLAN_SYSTEM = `You help a Sims 4 player plan the start of a story before they open Create-a-Sim.
Build on the player's own ideas; never replace them with generic ones.
Be specific and vivid, and use real Sims 4 things (traits, aspirations, careers, worlds, lot types) where they fit.
Only name traits that really exist. Use these base-game traits: ${general.traits.join(', ')}.
If you want a quality that isn't on that list, describe it in plain words instead of inventing a trait name.
Only name aspirations that really exist: these base-game ones (${general.aspirations.join(', ')}), or ones named in the selected packs' notes. Careers are not aspirations.
Only mention pack features (worlds, careers, life states) from packs the player selected; otherwise stay base-game.
The goal must stay loose: a direction to play toward, never a fixed ending (no "they get married and live happily ever after").
Reply with JSON only, no other text.`;

// Which optional Create-a-Sim details the picked packs unlock.
function casPacks(packCodes) {
  return {
    lovestruck: packCodes.includes('EP16'),
    pets: ['EP04', 'SP14'].filter((c) => packCodes.includes(c)),
  };
}

function casShape(packCodes) {
  const { lovestruck, pets } = casPacks(packCodes);
  return `{
        "lifeStage": "one life stage from the allowed list",
        "orientation": "who they're attracted to romantically and for WooHoo, or exploring, or not interested in romance",
        "boundaries": "whether they get jealous, and what they'd accept from a partner with other Sims",
        "likes": "2-3 likes from the allowed lists",
        "dislikes": "1-2 dislikes from the allowed lists"${lovestruck ? `,
        "turnOns": "2-3 turn-ons from the Lovestruck lists",
        "turnOffs": "1-2 turn-offs from the Lovestruck lists"` : ''}${pets.length ? `,
        "pet": "their pet, or 'none'. For a cat or dog: name, cat or dog (and size), age, and 2-3 pet traits, then one personality note"` : ''}
      }`;
}

// The real Create-a-Sim options Claude may use, limited to what the picked packs allow.
function describeCas(packCodes) {
  const { base, packs: byPack } = casOptions;
  const { lovestruck, pets } = casPacks(packCodes);
  const lines = [
    'Create-a-Sim details for every character (the "cas" block). Use only real options:',
    `- Life stage: ${base.lifeStages.join(', ')}. Pick what fits the story; romance, jobs, and WooHoo only make sense for Young Adults and older (Teens can date). For a Baby, Infant, Toddler, or Child, write "not applicable" for orientation, boundaries, turn-ons, and turn-offs.`,
    `- Orientation: ${base.orientation.describe}`,
    `- Boundaries: ${base.boundaries.describe}`,
    `- Likes and dislikes: pick from colors (${base.likesDislikes.colors.join(', ')}), music (${base.likesDislikes.music.join(', ')}), and activities (${base.likesDislikes.activities.join(', ')}).`,
  ];
  if (lovestruck) {
    const t = byPack.EP16.turnOnCategories;
    lines.push(`- Turn-ons and turn-offs (Lovestruck): characteristics (${t.characteristics.join(', ')}); skills (${t.skills.join(', ')}); status (${t.status.join(', ')}); romance styles (${t.romanceStyles.join(', ')}); fashion (${t.fashion.join(', ')}); or ${t.looks.join(' or ')}.`);
  }
  if (pets.length) {
    const options = pets.flatMap((c) => byPack[c].pets);
    lines.push(`- Pets: ${options.join('; ')}. Not every household needs one; give a pet only where it adds to the story. A pet is never a character of its own: put it in the "pet" field of ONE owner's card (other characters, even in the same household, get "none").`);
    if (pets.includes('EP04')) {
      lines.push(`- Cats and dogs: age is ${byPack.EP04.petAges.join(', ')}; pet traits come only from ${byPack.EP04.petTraits.join(', ')}. Pets don't use Sim traits.`);
      lines.push(`- With Cats & Dogs, the Sim traits ${byPack.EP04.traits.join(' and ')} are also allowed.`);
    }
  } else {
    lines.push('- No pets: the player did not pick a pet pack.');
  }
  lines.push('Make these details serve the story: orientation must make every attraction in the plot possible, and boundaries and turn-ons should create or ease the central conflict where they can.');
  return lines.join('\n');
}

// Names drawn at random for this plan, so Claude doesn't keep reusing its favorites.
function describeNames(names) {
  return `Names for this plan, drawn at random from a large international list. Pick every character's first and last name from these, choosing ones that suit each character and the story's world (family members can share a last name):
- Usually feminine first names: ${names.female.join(', ')}
- Usually masculine first names: ${names.male.join(', ')}
- Either: ${names.unisex.join(', ')}
- Last names: ${names.last.join(', ')}
- Pet names: ${names.pet.join(', ')}
Don't use any other names.`;
}

const planShape = (packCodes) => `{
  "heart": "the one central conflict or theme, in one short line (e.g. 'Two sisters who can't stand each other are stuck sharing a failing farm')",
  "ingredientsUsed": [the numbers of the 1 or 2 ingredients you used],
  "premise": "2-3 vivid sentences summarizing the story",
  "characters": [
    {
      "name": "full Sim name",
      "headline": "one short line, e.g. 'The burnt-out barista with a secret'",
      "personality": "traits, quirks, aspiration, career, in a few sentences",
      "connections": "how this Sim connects to the others",
      "cas": ${casShape(packCodes)}
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

function describePacks(ingredients) {
  if (!ingredients.packs.length) return 'The player skipped pack selection. Keep everything base-game friendly.';
  return 'Packs the player owns and selected:\n' + ingredients.packs
    .map((p) => `- ${p.name}${p.summary ? `: ${p.summary}` : ''}`)
    .join('\n');
}

// All drawn ingredients in one numbered list, so Claude can say which ones it used.
export function numberedIngredients(ingredients) {
  const kinds = [
    ['characterTypes', 'character type'],
    ['hooks', 'story hook'],
    ['twists', 'twist (set it up; don\'t resolve it)'],
    ['settings', 'setting'],
  ];
  return kinds.flatMap(([kind, label]) => ingredients[kind].map((i) => ({ ...i, label })));
}

// The player's dial settings, in the same plain words the page showed them.
// What each dial must visibly do to the plan at its low (1-2) and high (4-5) ends.
// Without this, Claude anchors on the player's idea and treats the dials as background.
const DIAL_EFFECTS = {
  drama: [
    'Conflicts are gentle and fixable: misunderstandings, stubbornness, hurt feelings. No betrayals, no cruelty. The tone is warm.',
    'Make it loud and messy: the plotline must include a betrayal, an exposed secret, or a public blowup, and at least one character actively schemes against another. The tone is juicy, like reality TV.',
  ],
  predictability: [
    'Lay everything out plainly. No hidden secrets the player doesn\'t know about; the twist, if any, is small and stated.',
    'Plant a real twist that could change where the story goes, and keep its outcome open. Hint at something the player will want to find out.',
  ],
  relationships: [
    'Do not plan any romance or pairings. Leave every Sim\'s love life open for the player to discover.',
    'Spell out who is attracted to whom, who stands in the way, and why. Romance or attraction should be part of the plotline.',
  ],
  pace: [
    'The opening is quiet: daily life and slow build-up, with the first big moment weeks in.',
    'Something big happens on the very first day of play, and the plotline keeps moving.',
  ],
};

function describeSettings(settings) {
  const lines = dials.dials.map((d) => {
    const v = settings[d.id];
    const effect = v <= 2 ? DIAL_EFFECTS[d.id][0] : v >= 4 ? DIAL_EFFECTS[d.id][1] : null;
    return `- ${d.label}: ${v} of 5 ("${d.positions[v - 1]}").${effect ? ` ${effect}` : ''}`;
  });
  lines.push(settings.supernatural
    ? '- Supernatural: ON. At least one main character MUST be a supernatural being from the selected packs (a vampire, spellcaster, ghost, or alien), and it must matter to the central conflict. Pick at least one ingredient marked "supernatural" on the menu.'
    : '- Supernatural: OFF. No vampires, spellcasters, ghosts, aliens, or magic anywhere in the plan, even if a supernatural pack is selected. Everyone is an ordinary Sim.');
  return `How the player set the story dials. These are requirements, not suggestions: two plans from the same idea with different dials must read noticeably different.\n${lines.join('\n')}`;
}

function describeIngredients(ingredients) {
  const fromPacks = numberedIngredients(ingredients).some((i) => i.source !== 'General');
  const menu = numberedIngredients(ingredients)
    .map((i, n) => `${n + 1}. [${i.label}, from ${i.source}${(i.tags || []).includes('supernatural') ? ', supernatural' : ''}] ${i.text}`)
    .join('\n');
  return `A menu of story ingredients, drawn at random for this plan:
${menu}

These are a menu, not a checklist. Pick only the 1 or 2 that best sharpen the central conflict, and leave the rest out.${
  fromPacks ? '\nAt least one ingredient you pick must come from one of the player\'s packs, so the plan reflects what they own.' : ''}`;
}

export function buildPlanPrompt({ yap, ingredients, dialSettings }) {
  return `Here is what the player imagines, in their own words:
"""
${yap}
"""

${describePacks(ingredients)}

${describeSettings(dialSettings)}

${describeIngredients(ingredients)}

${describeCas(ingredients.packs.map((p) => p.code))}

${describeNames(ingredients.names)}

How to build the plan:
1. First, decide the ONE central conflict or theme, grown from the player's idea. Everything else serves it.
2. Weave in the 1 or 2 ingredients you picked so they deepen that conflict, not sit beside it.
3. Every character must be tied to the central conflict. No side businesses, side careers, or separate plotlines that don't feed it.
4. Keep it focused enough that someone could explain the story in one breath.

Write a starting plan with 2-4 characters. Use this exact JSON shape:
${planShape(ingredients.packs.map((p) => p.code))}`;
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
    filled(plan.heart) &&
    Array.isArray(plan.ingredientsUsed) &&
    filled(plan.premise) &&
    Array.isArray(plan.characters) && plan.characters.length > 0 &&
    plan.characters.every((c) => filled(c.name) && filled(c.headline) && filled(c.personality) && filled(c.connections) &&
      c.cas && filled(c.cas.lifeStage) && filled(c.cas.orientation) && filled(c.cas.boundaries) && filled(c.cas.likes) && filled(c.cas.dislikes)) &&
    plan.plotline && filled(plan.plotline.headline) && filled(plan.plotline.body) && filled(plan.plotline.goal) &&
    plan.world && filled(plan.world.world) && filled(plan.world.lots) && filled(plan.world.season);
  return ok ? plan : null;
}
