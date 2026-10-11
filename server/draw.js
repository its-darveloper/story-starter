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

const randomItem = (list, random) => list.splice(Math.floor(random() * list.length), 1)[0];

export function drawIngredients({ packCodes = [], seed } = {}) {
  seed = Number.isInteger(seed) ? seed : Math.floor(Math.random() * 2 ** 31);
  const random = makeRandom(seed);

  const chosen = packs.filter((p) => packCodes.includes(p.code));
  const withNotes = chosen.filter(hasNotes);
  // No packs, or only packs without notes yet: fall back to the general notes.
  const sources = (withNotes.length ? withNotes.map((p) => ({ source: p.name, note: p })) : [{ source: 'General', note: general }])
    .map((s) => ({ source: s.source, pools: Object.fromEntries(Object.keys(COUNTS).map((k) => [k, [...(s.note[k] || [])]])) }));

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
    while (drawn[kind].length < n && sources.some((s) => s.pools[kind].length)) {
      const s = order[turn++ % order.length];
      if (!s.pools[kind].length) continue;
      const item = randomItem(s.pools[kind], random);
      drawn[kind].push({ source: s.source, ...(typeof item === 'string' ? { text: item } : item) });
    }
  }

  return {
    seed,
    packs: chosen.map((p) => ({ code: p.code, name: p.name, summary: p.summary || null, hasNotes: hasNotes(p) })),
    ...drawn,
  };
}

// Pack list for the page's pack picker.
export function packList() {
  return packs.map((p) => ({ code: p.code, name: p.name, type: p.type, supernatural: p.supernatural, hasNotes: hasNotes(p) }));
}
