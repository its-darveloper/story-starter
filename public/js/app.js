// Screen flow and the in-memory state for one run through the app.

import { yapScreen, makingScreen, planScreen } from './screens.js';
import { makePlan } from './api.js';

const run = {
  yap: '',
  plan: null,
};

const root = document.getElementById('screen');

function show(node) {
  root.replaceChildren(node);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function go(name) {
  if (name === 'yap') return show(yapScreen(run, go));
  if (name === 'plan') return show(planScreen(run, go));
  if (name === 'making') {
    show(makingScreen(run, go));
    try {
      run.plan = await makePlan({ yap: run.yap });
      go('plan');
    } catch (err) {
      // Keep everything the player entered; just offer a retry.
      show(makingScreen(run, go, { error: err.message }));
    }
  }
}

go('yap');
