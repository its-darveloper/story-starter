// The ingredient draw: before Claude writes anything, the code randomly picks a few
// story ingredients from the selected packs' notes. The randomness comes from here,
// not from the AI's habits, so the same inputs can still produce different plans.
// Pass a `seed` to repeat a draw exactly (for demos and checks).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), 'data');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8'));

export const general = readJson('general-notes.json');
export const packs = readJson('pack-notes.json').packs;
export const casOptions = readJson('cas-options.json');
const nameBank = readJson('names.json');
export const styles = readJson('starting-styles.json').styles;
export const nudges = readJson('nudges.json').nudges;

const hasNotes = (p) => Array.isArray(p.hooks) && p.hooks.length > 0;

// How many of each ingredient go into one plan.
const COUNTS = { characterTypes: 2, hooks: 2, twists: 1, settings: 1 };

// Small seedable random number generator (mulberry32): same seed, same sequence.
function makeRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const dials = readJson('dials.json');

export const DEFAULT_SETTINGS = { drama: 3, predictability: 3, relationships: 3, pace: 3, supernatural: false };

// Clean up whatever the page sent: each dial is a whole number 1-5, supernatural is true/false.
export function readSettings(input = {}) {
  const settings = { ...DEFAULT_SETTINGS };
  for (const d of dials.dials) {
    const v = Math.round(Number(input[d.id]));
    if (v >= 1 && v <= 5) settings[d.id] = v;
  }
  settings.supernatural = input.supernatural === true;
  return settings;
}

const tagsOf = (item) => (typeof item === 'string' ? [] : item.tags || []);
const isSupernatural = (item) => tagsOf(item).includes('supernatural');

// How much each dial favors ingredients with a given tag. Each dial runs 1-5;
// 3 is neutral, so the pull goes from -2 (left end) to +2 (right end).
const DIAL_PULL = {
  drama: { messy: 1, rivalry: 0.5, cozy: -1 },
  predictability: { surprise: 1 },
  relationships: { romance: 1 },
  pace: { fast: 1, slow: -1 },
};

// An ingredient's chance of being drawn, given the dials. 1 is ordinary; matching
// the dials makes it up to ~3x likelier, fighting them makes it much less likely.
function weight(item, settings) {
  const tags = tagsOf(item);
  let pull = 0;
  for (const [dial, byTag] of Object.entries(DIAL_PULL)) {
    for (const [tag, strength] of Object.entries(byTag)) {
      if (tags.includes(tag)) pull += strength * (settings[dial] - 3);
    }
  }
  return Math.max(0.15, 1 + 0.5 * pull);
}

// Take one item out of the list, favoring heavier ones.
function weightedTake(list, settings, random) {
  const weights = list.map((i) => weight(i, settings));
  let r = random() * weights.reduce((a, b) => a + b, 0);
  let i = 0;
  while (i < list.length - 1 && (r -= weights[i]) > 0) i++;
  return list.splice(i, 1)[0];
}

export function drawIngredients({ packCodes = [], seed, settings = DEFAULT_SETTINGS } = {}) {
  seed = Number.isInteger(seed) ? seed : Math.floor(Math.random() * 2 ** 31);
  const random = makeRandom(seed);

  // Supernatural is off: leave out vampires, spellcasters, ghosts, and aliens.
  const allowed = (item) => settings.supernatural || !isSupernatural(item);
  const toSource = (name, note) => ({
    source: name,
    pools: Object.fromEntries(Object.keys(COUNTS).map((k) => [k, (note[k] || []).filter(allowed)])),
  });

  const chosen = packs.filter((p) => packCodes.includes(p.code));
  const sources = chosen.filter(hasNotes).map((p) => toSource(p.name, p))
    .filter((s) => Object.values(s.pools).some((pool) => pool.length));
  // General notes back up any kind of ingredient the packs can't supply (or everything, with no packs).
  const backup = toSource('General', general);

  // Packs take turns across ALL the picks (not restarting for each kind of ingredient),
  // in a random order, so every selected pack contributes before any pack gets a second turn.
  const order = [...sources];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  let turn = 0;
  const drawn = {};
  for (const [kind, n] of Object.entries(COUNTS)) {
    drawn[kind] = [];
    while (drawn[kind].length < n) {
      const live = sources.some((s) => s.pools[kind].length);
      const s = live ? order[turn++ % order.length] : backup;
      if (!s.pools[kind].length) {
        if (!live) break;
        continue;
      }
      const item = weightedTake(s.pools[kind], settings, random);
      drawn[kind].push({ source: s.source, ...(typeof item === 'string' ? { text: item } : item) });
    }
  }

  // Supernatural is on but the luck of the draw left nothing supernatural on the menu
  // (e.g. Get to Work's careers came up instead of its aliens): swap the twist for one that is.
  const anySupernatural = Object.values(drawn).flat().some(isSupernatural);
  if (settings.supernatural && !anySupernatural) {
    const candidates = sources.flatMap((s) => s.pools.twists.filter(isSupernatural).map((t) => ({ source: s.source, ...t })));
    if (candidates.length) drawn.twists[0] = candidates[Math.floor(random() * candidates.length)];
  }

  // A fresh batch of name suggestions, so plans don't keep reusing Claude's favorites.
  const pickNames = (list, n) => {
    const pool = [...list];
    return Array.from({ length: Math.min(n, pool.length) }, () => pool.splice(Math.floor(random() * pool.length), 1)[0]);
  };
  const names = {
    female: pickNames(nameBank.female, 6),
    male: pickNames(nameBank.male, 6),
    unisex: pickNames(nameBank.unisex, 4),
    last: pickNames(nameBank.last, 10),
    pet: pickNames(nameBank.pet, 4),
  };

  // Note: `drawn.settings` is the drawn *setting ingredient* (a place); the dial settings
  // are not returned here, to keep the two from colliding.
  return {
    seed,
    packs: chosen.map((p) => ({ code: p.code, name: p.name, summary: p.summary || null, hasNotes: hasNotes(p), supernatural: p.supernatural })),
    ...drawn,
    names,
  };
}

// Pack list for the page's pack picker.
export function packList() {
  return packs.map((p) => ({ code: p.code, name: p.name, type: p.type, supernatural: p.supernatural, hasNotes: hasNotes(p) }));
}
