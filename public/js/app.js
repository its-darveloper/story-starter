// Screen flow and the in-memory state for one run through the app.
// Flow: welcome → style → yap → follow-up → packs → dials → making → plan (saved automatically)

import { welcomeScreen, styleScreen, yapScreen, followUpScreen, packsScreen, dialsScreen, makingScreen, planScreen } from './screens.js';
import { listPlans, getPlan, savePlan, deletePlan } from './store.js';
import { makePlan, reflect, getPacks, getDials, getStyles } from './api.js';

const freshRun = () => ({
  style: null,
  yap: '',
  reflectedYap: null, // the yap the current follow-up questions were asked about
  reflection: '',
  followUps: [], // [{ question, answer }]
  packs: [],
  settings: { drama: 3, predictability: 3, relationships: 3, pace: 3, supernatural: false },
  plan: null,
});

let run = freshRun();
let lastSaveOk = true;

// Loaded once from the server, then reused.
const loaded = {};
const load = async (key, fetcher) => (loaded[key] ??= await fetcher());

const root = document.getElementById('screen');

function show(node) {
  root.replaceChildren(node);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function go(name, { retry } = {}) {
  try {
    if (name === 'welcome') {
      return show(welcomeScreen(run, go, {
        saved: listPlans(),
        onOpen: (id) => {
          const plan = getPlan(id);
          if (!plan) return go('welcome');
          run = { ...freshRun(), plan };
          lastSaveOk = true;
          go('plan');
        },
        onDelete: (id) => { deletePlan(id); go('welcome'); },
      }));
    }
    if (name === 'start-over') {
      run = freshRun();
      return go('style');
    }
    if (name === 'style' || name === 'yap') {
      const data = await load('styles', getStyles);
      return show(name === 'style' ? styleScreen(run, go, data) : yapScreen(run, go, data));
    }
    if (name === 'followup') {
      // Only ask again if the yap changed since the last questions (or on retry).
      if (retry || run.reflectedYap !== run.yap) {
        show(followUpScreen(run, go, { loading: true }));
        try {
          const result = await reflect({ yap: run.yap, style: run.style });
          run.reflection = result.reflection;
          run.followUps = result.questions.map((question) => ({ question, answer: '' }));
          run.reflectedYap = run.yap;
        } catch (err) {
          return show(followUpScreen(run, go, { error: err.message }));
        }
      }
      return show(followUpScreen(run, go));
    }
    if (name === 'packs') return show(packsScreen(run, go, { packs: await load('packs', getPacks) }));
    if (name === 'dials') {
      return show(dialsScreen(run, go, { dials: await load('dials', getDials), packs: await load('packs', getPacks) }));
    }
    if (name === 'plan') return show(planScreen(run, go, { saved: lastSaveOk }));
    if (name === 'making') {
      show(makingScreen(run, go));
      try {
        run.plan = await makePlan({
          yap: run.yap,
          style: run.style,
          followUps: run.followUps,
          packs: run.packs,
          settings: run.settings,
        });
        lastSaveOk = savePlan(run.plan);
        return go('plan');
      } catch (err) {
        // Keep everything the player entered; just offer a retry.
        return show(makingScreen(run, go, { error: err.message }));
      }
    }
  } catch (err) {
    show(makingScreen(run, go, { error: err.message }));
  }
}

go('welcome');
