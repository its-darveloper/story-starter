// Screen flow and the in-memory state for one run through the app.

import { yapScreen, packsScreen, makingScreen, planScreen } from './screens.js';
import { makePlan, getPacks } from './api.js';

const run = {
  yap: '',
  packs: [],
  plan: null,
};

let packList = null;

const root = document.getElementById('screen');

function show(node) {
  root.replaceChildren(node);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function go(name) {
  if (name === 'yap') return show(yapScreen(run, go));
  if (name === 'plan') return show(planScreen(run, go));
  if (name === 'packs') {
    try {
      packList ??= await getPacks();
      return show(packsScreen(run, go, { packs: packList }));
    } catch (err) {
      return show(makingScreen(run, go, { error: err.message }));
    }
  }
  if (name === 'making') {
    show(makingScreen(run, go));
    try {
      run.plan = await makePlan({ yap: run.yap, packs: run.packs });
      go('plan');
    } catch (err) {
      // Keep everything the player entered; just offer a retry.
      show(makingScreen(run, go, { error: err.message }));
    }
  }
}

go('yap');
