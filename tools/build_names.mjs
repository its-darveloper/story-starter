// Builds data/names.json from the Behind the Name downloads in names/.
// Run from the project folder: node tools/build_names.mjs
//
// Source: behindthename.com, licensed CC BY-SA 4.0. The output file is a derived
// work, so it carries the same license and attribution.

import fs from 'node:fs';

const GIVEN = 'names/btn_givennames.txt';
const SURNAMES = 'names/btn_surnames.txt';
const OUT = 'data/names.json';

const lines = (file) => fs.readFileSync(file, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));

// Keep names that read cleanly on a card and type easily in Create-a-Sim:
// one word, capitalized, 3-12 letters (accented Latin letters allowed).
const tidy = (n) => /^[A-Z][a-zà-öø-ÿ]{2,11}$/.test(n);

const female = [];
const male = [];
const unisex = [];
for (const line of lines(GIVEN)) {
  const [name, gender] = line.split('\t');
  if (!tidy(name)) continue;
  if (gender === 'f') female.push(name);
  else if (gender === 'm') male.push(name);
  else if (gender === 'mf' || gender === 'fm') unisex.push(name);
}
const last = lines(SURNAMES).filter(tidy);

// Pet names are our own (Behind the Name doesn't cover pets); keep them from the current file.
const current = JSON.parse(fs.readFileSync(OUT, 'utf8'));

const out = {
  attribution: 'First names and surnames from behindthename.com (https://www.behindthename.com/api/), licensed CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0). This file is a filtered adaptation and is shared under the same license. Pet names are original to this project.',
  note: 'Each plan draws a small random batch so Claude does not keep reaching for the same favorites. Rebuild with: node tools/build_names.mjs',
  female,
  male,
  unisex,
  last,
  pet: current.pet,
};

fs.writeFileSync(OUT, JSON.stringify(out) + '\n');
console.log(`Wrote ${OUT}: ${female.length} female, ${male.length} male, ${unisex.length} unisex, ${last.length} surnames, ${out.pet.length} pet names (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
