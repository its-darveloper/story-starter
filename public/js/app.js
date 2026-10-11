// Screen flow and the in-memory state for one run through the app.

import { yapScreen, packsScreen, dialsScreen, makingScreen, planScreen } from './screens.js';
import { makePlan, getPacks, getDials } from './api.js';

const run = {
  yap: '',
  packs: [],
  settings: { drama: 3, predictability: 3, relationships: 3, pace: 3, supernatural: false },
  plan: null,
};

// Loaded once from the server, then reused.
let packList = null;
let dialList = null;

const root = document.getElementById('screen');

function show(node) {
  root.replaceChildren(node);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function go(name) {
  if (name === 'yap') return show(yapScreen(run, go));
  if (name === 'plan') return show(planScreen(run, go));
  if (name === 'packs' || name === 'dials') {
    try {
      packList ??= await getPacks();
      if (name === 'packs') return show(packsScreen(run, go, { packs: packList }));
      dialList ??= await getDials();
      return show(dialsScreen(run, go, { dials: dialList, packs: packList }));
    } catch (err) {
      return show(makingScreen(run, go, { error: err.message }));
    }
  }
  if (name === 'making') {
    show(makingScreen(run, go));
    try {
      run.plan = await makePlan({ yap: run.yap, packs: run.packs, settings: run.settings });
      go('plan');
    } catch (err) {
      // Keep everything the player entered; just offer a retry.
      show(makingScreen(run, go, { error: err.message }));
    }
  }
}

go('yap');
