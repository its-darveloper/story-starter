// Starts the server: serves the page from public/ and answers the page's /api requests.
// Run: node --env-file=.env server/server.js

import http from 'node:http';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { askClaude } from './claude.js';
import { PLAN_SYSTEM, buildPlanPrompt, parsePlan, numberedIngredients, REFLECT_SYSTEM, buildReflectPrompt, parseReflect } from './prompt.js';
import { drawIngredients, packList, packs, dials, readSettings, styles, nudges } from './draw.js';

const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PUBLIC = path.join(ROOT, 'public');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': TYPES['.json'] });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

// --- API routes ---

async function makePlan(input) {
  const yap = String(input.yap || '').trim();
  if (!yap) return { status: 400, body: { error: 'Tell us a little about your story first.' } };

  const packCodes = Array.isArray(input.packs) ? input.packs.map(String) : [];
  const settings = readSettings(input.settings);
  // Supernatural only counts if a supernatural-capable pack was actually picked.
  settings.supernatural &&= packs.some((p) => p.supernatural && packCodes.includes(p.code));
  const ingredients = drawIngredients({ packCodes, seed: input.seed, settings });
  const style = styles.find((st) => st.id === input.style) || null;
  const followUps = Array.isArray(input.followUps)
    ? input.followUps.map((f) => ({ question: String(f.question || ''), answer: String(f.answer || '') }))
    : [];
  const prompt = buildPlanPrompt({ yap, ingredients, dialSettings: settings, style, followUps });
  // Ask once; if the answer isn't a complete plan, ask one more time.
  for (let attempt = 1; attempt <= 2; attempt++) {
    const plan = parsePlan(await askClaude({ system: PLAN_SYSTEM, prompt }));
    if (plan) {
      // Pack-only Create-a-Sim details can't appear without their pack.
      for (const c of plan.characters) {
        if (!packCodes.includes('EP16')) { delete c.cas.turnOns; delete c.cas.turnOffs; }
        if (!packCodes.includes('EP04') && !packCodes.includes('SP14')) delete c.cas.pet;
      }
      // Turn the numbers Claude reported back into the ingredients themselves.
      const menu = numberedIngredients(ingredients);
      const used = plan.ingredientsUsed.map((n) => menu[Number(n) - 1]).filter(Boolean);
      return {
        status: 200,
        body: {
          id: `plan-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...plan,
          ingredientsUsed: used,
          settings,
          style: style?.id || null,
          leadCard: style?.leadCard || 'premise',
          packs: packCodes,
          ingredients,
        },
      };
    }
    console.warn(`Plan attempt ${attempt} came back in the wrong shape.`);
  }
  return { status: 502, body: { error: "That plan didn't come out right. Try again?" } };
}

async function reflect(input) {
  const yap = String(input.yap || '').trim();
  if (!yap) return { status: 400, body: { error: 'Tell us a little about your story first.' } };
  const style = styles.find((st) => st.id === input.style) || styles.find((st) => st.id === 'unsure');
  const prompt = buildReflectPrompt({ yap, style });
  for (let attempt = 1; attempt <= 2; attempt++) {
    // A short reply: low effort keeps it quick.
    const result = parseReflect(await askClaude({ system: REFLECT_SYSTEM, prompt, effort: 'low', maxTokens: 8000 }));
    if (result) return { status: 200, body: result };
    console.warn(`Reflect attempt ${attempt} came back in the wrong shape.`);
  }
  return { status: 502, body: { error: "Couldn't come up with follow-up questions. Try again?" } };
}

const ROUTES = {
  'GET /api/styles': async () => ({ status: 200, body: { styles, nudges } }),
  'POST /api/reflect': reflect,
  'GET /api/packs': async () => ({ status: 200, body: { packs: packList() } }),
  'GET /api/dials': async () => ({ status: 200, body: dials }),
  'POST /api/plan': makePlan,
};

// --- Static files ---

async function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.normalize(path.join(PUBLIC, urlPath === '/' ? 'index.html' : urlPath));
  if (!file.startsWith(PUBLIC)) return sendJson(res, 403, { error: 'Forbidden' });
  try {
    const data = await fs.readFile(file);
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  const route = ROUTES[`${req.method} ${req.url.split('?')[0]}`];
  if (!route) return serveStatic(req, res);
  try {
    const { status, body } = await route(await readBody(req));
    sendJson(res, status, body);
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: 'Something went wrong on our side. Try again?' });
  }
});

server.listen(PORT, () => {
  console.log(`Story Starter is running.`);
  console.log(`  On this laptop:  http://localhost:${PORT}`);
  for (const nets of Object.values(os.networkInterfaces())) {
    for (const n of nets || []) {
      if (n.family === 'IPv4' && !n.internal) console.log(`  On your phone:   http://${n.address}:${PORT}`);
    }
  }
});
