// Draws the app's decorative SVGs: tileable op-art patterns and cut-paper shapes.
// All original geometry, with a little seeded wobble so edges look hand-cut.
// Run from the project folder: node tools/make_svgs.mjs

import fs from 'node:fs';

const OUT = 'public/img';
fs.mkdirSync(OUT, { recursive: true });

const C = {
  ink: '#1d1a17', brick: '#a8352a', orange: '#e8582b', cobalt: '#2f55d4', green: '#6cbf4a',
  sky: '#8fd3e8', sand: '#f0d9a8', paper: '#f2ede3', peach: '#f4a582', plum: '#6b4fa8',
};

// Seedable random (mulberry32), so the "hand-cut" wobble is the same every build.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Math.round(n * 100) / 100;
const pts = (list) => list.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
const poly = (list, fill, extra = '') => `<polygon points="${pts(list)}" fill="${fill}"${extra}/>`;
const svg = (w, h, body, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${f(w)}" height="${f(h)}" viewBox="0 0 ${f(w)} ${f(h)}"${extra}>${body}</svg>\n`;
const write = (name, content) => fs.writeFileSync(`${OUT}/${name}`, content);

// ---------- Tileable patterns ----------

// Tumbling blocks: hexagons split into three rhombi (light top, mid left, dark right).
function cubes(name, [top, left, right], r = 14) {
  const w = Math.sqrt(3) * r;
  const h = 3 * r;
  const centers = [[0, 0], [w, 0], [w / 2, 1.5 * r], [0, h], [w, h], [w / 2, -1.5 * r], [w / 2, h + 1.5 * r]];
  let body = '';
  for (const [cx, cy] of centers) {
    const T = [cx, cy - r], UR = [cx + w / 2, cy - r / 2], LR = [cx + w / 2, cy + r / 2];
    const B = [cx, cy + r], LL = [cx - w / 2, cy + r / 2], UL = [cx - w / 2, cy - r / 2], M = [cx, cy];
    body += poly([T, UR, M, UL], top) + poly([UL, M, B, LL], left) + poly([M, UR, LR, B], right);
  }
  write(name, svg(w, h, body));
}

// Rows of equilateral triangles. Each triangle's color comes from its position
// modulo the tile (3 across, 2 rows), so the pattern repeats without seams.
function triangles(name, colors, s = 22) {
  const h = (s * Math.sqrt(3)) / 2;
  const N = 3;
  const mod = (a, n) => ((a % n) + n) % n;
  let body = '';
  for (let row = 0; row < 2; row++) {
    const shift = row % 2 ? s / 2 : 0;
    for (let col = -1; col <= N; col++) {
      const x = col * s + shift;
      const y = row * h;
      const k = mod(col, N);
      body += poly([[x, y + h], [x + s / 2, y], [x + s, y + h]], colors[(row * 2 + k) % colors.length]);
      body += poly([[x + s / 2, y], [x + s * 1.5, y], [x + s, y + h]], colors[(row * 2 + k + N) % colors.length]);
    }
  }
  write(name, svg(s * N, h * 2, body));
}

// Fine zigzag lines on paper, like hand-ruled op-art.
function zigzag(name, line, bg, step = 8, amp = 6) {
  const w = step * 4, h = 12;
  const zig = (y) => {
    const p = [];
    for (let x = -step; x <= w + step; x += step) p.push([x, y + ((x / step) % 2 ? amp / 2 : -amp / 2)]);
    return `<polyline points="${pts(p)}" fill="none" stroke="${line}" stroke-width="2"/>`;
  };
  write(name, svg(w, h, `<rect width="${w}" height="${h}" fill="${bg}"/>${zig(h / 2)}`));
}

// Chevron bands (">" shapes) in three colors. Each band bends at mid-height and
// returns to where it started, so the tile meets itself top to bottom.
function chevrons(name, colors, s = 16) {
  const w = s * colors.length, h = s * 2;
  let body = '';
  for (let i = -1; i <= colors.length; i++) {
    const x = i * s;
    body += poly([[x, 0], [x + s, 0], [x + s * 1.6, h / 2], [x + s, h], [x, h], [x + s * 0.6, h / 2]],
      colors[((i % colors.length) + colors.length) % colors.length]);
  }
  write(name, svg(w, h, body));
}

// Bow-tie squares: two triangles meeting in the middle, red on paper.
function bowties(name, ink, bg, s = 24) {
  const body = `<rect width="${s}" height="${s}" fill="${bg}"/>`
    + poly([[2, 2], [s - 2, 2], [s / 2, s / 2]], ink)
    + poly([[2, s - 2], [s - 2, s - 2], [s / 2, s / 2]], ink);
  write(name, svg(s, s, body));
}

// Vertical bars, like a painted color chart.
function bars(name, colors, bw = 9) {
  const body = colors.map((c, i) => `<rect x="${i * bw}" width="${bw}" height="40" fill="${c}"/>`).join('');
  write(name, svg(colors.length * bw, 40, body));
}

// Faint paper grain (used under everything).
function grain(name) {
  write(name, svg(160, 160,
    '<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>'
    + '<feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.16  0 0 0 0 0.1  0 0 0 0.09 0"/></filter>'
    + '<rect width="160" height="160" filter="url(#n)"/>'));
}

cubes('pat-cubes-warm.svg', [C.sand, C.orange, C.ink]);
cubes('pat-cubes-cool.svg', [C.sky, C.cobalt, C.ink]);
cubes('pat-cubes-green.svg', [C.sand, C.green, C.brick]);
triangles('pat-triangles.svg', [C.cobalt, C.orange, C.sand, C.ink, C.sky, C.brick]);
zigzag('pat-zigzag.svg', C.orange, C.paper);
zigzag('pat-zigzag-blue.svg', C.cobalt, C.paper);
chevrons('pat-chevrons.svg', [C.green, C.orange, C.ink]);
bowties('pat-bowties.svg', C.brick, C.paper);
bars('pat-bars.svg', [C.ink, C.paper, C.brick, C.green, C.brick, C.paper, C.ink, C.paper]);
grain('grain.svg');

// ---------- Cut-paper shapes (one file each, so CSS and <img> can use them) ----------

// Nudge every point a little so straight edges look cut by hand.
const wobble = (list, amt, rand) => list.map(([x, y]) => [x + (rand() - 0.5) * amt, y + (rand() - 0.5) * amt]);

// An organic blob, like a scissor-cut paper shape.
function blob(name, color, seed, n = 7) {
  const rand = rng(seed);
  const p = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 26 + rand() * 22;
    p.push([50 + Math.cos(a) * r, 50 + Math.sin(a) * r]);
  }
  // Smooth closed curve through the points (Catmull-Rom to Bezier).
  let d = `M${f(p[0][0])},${f(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  write(name, svg(100, 100, `<path d="${d}Z" fill="${color}"/>`));
}

// Spray can with a zigzag-striped body.
function can(name, stripe, cap, seed) {
  const rand = rng(seed);
  let lines = '';
  for (let y = 34; y < 116; y += 6) lines += `<polyline points="${pts([[14, y], [22, y - 3], [30, y], [38, y - 3], [46, y]])}" fill="none" stroke="${stripe}" stroke-width="2.2"/>`;
  const body = poly(wobble([[12, 28], [48, 28], [48, 120], [12, 120]], 2, rand), C.paper, ` stroke="${C.ink}" stroke-width="2"`)
    + `<g clip-path="url(#b)">${lines}</g>`
    + poly(wobble([[16, 16], [44, 16], [48, 28], [12, 28]], 1.5, rand), '#b9b2a6')
    + poly(wobble([[25, 6], [35, 6], [35, 16], [25, 16]], 1, rand), cap);
  write(name, svg(60, 126, `<defs><clipPath id="b"><rect x="13" y="29" width="34" height="90"/></clipPath></defs>${body}`));
}

// Hourglass made of nested striped triangles.
function hourglass(name, color) {
  let body = '';
  for (let i = 0; i < 4; i++) {
    const k = i * 6;
    body += `<polygon points="${pts([[6 + k, 6 + k * 0.6], [94 - k, 6 + k * 0.6], [50, 60 - k * 0.9]])}" fill="none" stroke="${color}" stroke-width="3"/>`;
    body += `<polygon points="${pts([[6 + k, 114 - k * 0.6], [94 - k, 114 - k * 0.6], [50, 60 + k * 0.9]])}" fill="none" stroke="${color}" stroke-width="3"/>`;
  }
  write(name, svg(100, 120, body));
}

// Octagon ring of parallel stripes.
function ring(name, color) {
  let body = '';
  for (let i = 0; i < 5; i++) {
    const k = i * 5;
    const o = [[30 + k, 8 + k], [130 - k, 8 + k], [152 - k, 40], [130 - k, 72 - k], [30 + k, 72 - k], [8 + k, 40]];
    body += `<polygon points="${pts(o)}" fill="none" stroke="${color}" stroke-width="3"/>`;
  }
  write(name, svg(160, 80, body));
}

// Sunburst / starburst sticker.
function burst(name, color, seed, spikes = 14) {
  const rand = rng(seed);
  const p = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const r = i % 2 ? 30 + rand() * 4 : 48 + rand() * 4;
    p.push([50 + Math.cos(a) * r, 50 + Math.sin(a) * r]);
  }
  write(name, svg(100, 100, poly(p, color)));
}

// A wonky hand-cut arrow.
function arrow(name, color, seed) {
  const rand = rng(seed);
  write(name, svg(120, 60, poly(wobble([[4, 22], [76, 20], [74, 6], [116, 30], [74, 54], [76, 40], [4, 38]], 3, rand), color)));
}

blob('blob-orange.svg', C.orange, 3);
blob('blob-pink.svg', '#f4b6c2', 11);
blob('blob-sky.svg', C.sky, 21);
blob('blob-green.svg', C.green, 7);
can('can-orange.svg', C.orange, C.brick, 5);
can('can-blue.svg', C.cobalt, C.cobalt, 9);
hourglass('hourglass.svg', C.brick);
ring('ring.svg', C.brick);
burst('burst-sand.svg', C.sand, 4);
burst('burst-orange.svg', C.orange, 8);
arrow('arrow-ink.svg', C.ink, 2);

console.log(`Wrote ${fs.readdirSync(OUT).filter((n) => n.endsWith('.svg')).length} SVGs to ${OUT}/`);
