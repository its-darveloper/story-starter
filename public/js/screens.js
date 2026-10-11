// Each screen is a function that returns an element to show. Screens receive the
// current run state plus `go`, which moves to another screen.

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  node.append(...children.flat(Infinity).filter((c) => c != null && c !== false));
  return node;
}

export function styleScreen(run, go, { styles }) {
  const pick = (st) => el('button', {
    class: 'style-card',
    type: 'button',
    'aria-pressed': String(run.style === st.id),
    onclick: () => { run.style = st.id; go('yap'); },
  },
    el('span', { class: 'style-title' }, st.title),
    el('span', { class: 'style-desc' }, st.description));

  return el('section', {},
    el('h2', { class: 'screen-title' }, 'How do you start?'),
    el('p', { class: 'lead' }, 'Everyone dreams up stories differently. Pick the one that sounds most like you. There’s no wrong answer.'),
    el('div', { class: 'styles' }, styles.map(pick)),
  );
}

export function yapScreen(run, go, { styles, nudges }) {
  const style = styles.find((st) => st.id === run.style) || styles[styles.length - 1];
  const box = el('textarea', {
    id: 'yap',
    placeholder: style.yapPrompt,
    'aria-label': 'Tell us about your story',
  });
  box.value = run.yap;
  const next = el('button', { class: 'pill primary', type: 'button' }, 'Next ✦');
  const update = () => {
    run.yap = box.value;
    next.disabled = !box.value.trim();
  };
  box.addEventListener('input', update);
  next.addEventListener('click', () => go('followup'));

  // Tapping a nudge starts a new line with a sentence opener, then puts the cursor after it.
  const nudge = (id) => {
    const n = nudges[id];
    return el('button', {
      class: 'nudge',
      type: 'button',
      onclick: () => {
        const text = box.value.trimEnd();
        box.value = (text ? text + '\n' : '') + n.insert;
        update();
        box.focus();
        box.setSelectionRange(box.value.length, box.value.length);
      },
    }, '+ ', n.label);
  };
  update();

  return el('section', {},
    el('h2', { class: 'screen-title' }, 'Spill it'),
    el('p', { class: 'lead' }, 'Say whatever you imagine, in your own words. A few words is fine. You can type or use your keyboard’s microphone.'),
    box,
    el('p', { class: 'hint' }, 'Stuck? Tap one to get started (or ignore them):'),
    el('div', { class: 'nudges' }, style.nudges.map(nudge)),
    el('div', { class: 'actions' },
      el('button', { class: 'pill', type: 'button', onclick: () => go('style') }, '← Back'),
      next),
  );
}

export function followUpScreen(run, go, { loading, error } = {}) {
  const back = el('button', { class: 'pill', type: 'button', onclick: () => go('yap') }, '← Back');
  if (loading) {
    return el('section', {},
      el('h2', { class: 'screen-title' }, 'Got it…'),
      el('div', { class: 'status' },
        el('span', { class: 'big', 'aria-hidden': 'true' }, '✦'),
        el('p', {}, 'Reading what you wrote…')),
    );
  }
  if (error) {
    return el('section', {},
      el('p', { class: 'error', role: 'alert' }, error),
      el('div', { class: 'actions' },
        back,
        el('button', { class: 'pill', type: 'button', onclick: () => go('packs') }, 'Skip questions'),
        el('button', { class: 'pill primary', type: 'button', onclick: () => go('followup', { retry: true }) }, 'Try again')),
    );
  }

  const question = (f, i) => {
    const answer = el('textarea', {
      class: 'answer', rows: '2', id: `answer-${i}`,
      placeholder: 'A few words is plenty (or leave it blank)',
    });
    answer.value = f.answer;
    answer.addEventListener('input', () => { f.answer = answer.value; });
    return el('div', { class: 'qa' },
      el('label', { class: 'bubble ask', for: `answer-${i}` }, f.question),
      answer);
  };

  return el('section', {},
    el('h2', { class: 'screen-title' }, 'Here’s what I heard'),
    el('p', { class: 'bubble heard' }, run.reflection),
    el('p', { class: 'lead' }, 'A few questions to fill in the gaps. Answer any you like; skip the rest.'),
    el('div', { class: 'qas' }, run.followUps.map(question)),
    el('div', { class: 'actions' },
      back,
      el('button', { class: 'pill primary', type: 'button', onclick: () => go('packs') }, 'Next ✦')),
  );
}

const PACK_TYPES = ['Expansion Pack', 'Game Pack', 'Stuff Pack', 'Kit', 'Free Pack'];

export function packsScreen(run, go, { packs }) {
  const count = el('span', {});
  const updateCount = () => {
    count.textContent = run.packs.length ? `${run.packs.length} picked` : 'None picked yet';
  };

  const tile = (p) => {
    const btn = el('button', {
      class: 'pack' + (p.supernatural ? ' spooky' : ''),
      type: 'button',
      'aria-pressed': String(run.packs.includes(p.code)),
    },
      el('span', { class: 'pack-name' }, p.name),
      p.hasNotes ? null : el('span', { class: 'pack-soon' }, 'notes coming soon'),
    );
    btn.addEventListener('click', () => {
      run.packs = run.packs.includes(p.code) ? run.packs.filter((c) => c !== p.code) : [...run.packs, p.code];
      btn.setAttribute('aria-pressed', String(run.packs.includes(p.code)));
      updateCount();
    });
    return btn;
  };

  const groups = PACK_TYPES
    .map((type) => [type, packs.filter((p) => p.type === type)])
    .filter(([, list]) => list.length)
    .map(([type, list]) => [el('h3', { class: 'group-title' }, type + 's'), el('div', { class: 'pack-grid' }, list.map(tile))]);

  updateCount();
  return el('section', {},
    el('h2', { class: 'screen-title' }, 'Your packs'),
    el('p', { class: 'lead' }, 'Tap the packs you own and want in this story. Pick as many as you like, or skip to keep it base game.'),
    el('p', { class: 'hint' }, 'Packs marked “notes coming soon” can be picked, but the plan won’t use their details yet.'),
    groups,
    el('div', { class: 'actions sticky' },
      el('button', { class: 'pill', type: 'button', onclick: () => go('followup') }, '←', el('span', { class: 'sr-only' }, 'Back')),
      el('button', { class: 'pill', type: 'button', onclick: () => { run.packs = []; go('dials'); } }, 'Skip'),
      el('button', { class: 'pill primary grow', type: 'button', onclick: () => go('dials') }, 'Next ✦', el('span', { class: 'count' }, count))),
  );
}

export function dialsScreen(run, go, { dials, packs }) {
  const slider = (d) => {
    const description = el('p', { class: 'dial-desc', id: `${d.id}-desc` }, d.positions[run.settings[d.id] - 1]);
    const input = el('input', {
      type: 'range', min: '1', max: '5', step: '1', id: d.id,
      value: String(run.settings[d.id]),
      'aria-describedby': `${d.id}-desc`,
    });
    input.addEventListener('input', () => {
      run.settings[d.id] = Number(input.value);
      description.textContent = d.positions[run.settings[d.id] - 1];
    });
    return el('div', { class: 'dial' },
      el('label', { class: 'dial-label', for: d.id }, d.label),
      input,
      el('div', { class: 'dial-ends', 'aria-hidden': 'true' }, el('span', {}, d.ends[0]), el('span', {}, d.ends[1])),
      description);
  };

  // The supernatural switch only unlocks when a supernatural-capable pack was picked.
  const sn = dials.supernatural;
  const unlocked = packs.some((p) => p.supernatural && run.packs.includes(p.code));
  if (!unlocked) run.settings.supernatural = false;
  const box = el('input', { type: 'checkbox', id: 'supernatural', 'aria-describedby': 'supernatural-note' });
  box.checked = run.settings.supernatural;
  box.disabled = !unlocked;
  const note = el('p', { class: 'dial-desc', id: 'supernatural-note' },
    !unlocked ? sn.locked : box.checked ? sn.on : sn.off);
  box.addEventListener('change', () => {
    run.settings.supernatural = box.checked;
    note.textContent = box.checked ? sn.on : sn.off;
  });

  return el('section', {},
    el('h2', { class: 'screen-title' }, 'Set the mood'),
    el('p', { class: 'lead' }, 'Slide each one to decide what kind of story you want. The words underneath tell you what you’ll get.'),
    el('div', { class: 'dials' }, dials.dials.map(slider)),
    el('div', { class: 'dial supernatural' + (unlocked ? '' : ' locked') },
      el('label', { class: 'check', for: 'supernatural' }, box, el('span', {}, sn.label)),
      note),
    el('div', { class: 'actions' },
      el('button', { class: 'pill', type: 'button', onclick: () => go('packs') }, '← Back'),
      el('button', { class: 'pill primary', type: 'button', onclick: () => go('making') }, 'Make my plan ✦')),
  );
}

export function makingScreen(run, go, { error } = {}) {
  if (error) {
    return el('section', {},
      el('div', { class: 'status' },
        el('span', { class: 'big', 'aria-hidden': 'true' }, '✧'),
        el('p', {}, 'Hmm, the plan got stuck.')),
      el('p', { class: 'error', role: 'alert' }, error),
      el('div', { class: 'actions' },
        el('button', { class: 'pill primary', type: 'button', onclick: () => go('making') }, 'Try again'),
        el('button', { class: 'pill', type: 'button', onclick: () => go('dials') }, 'Back')),
    );
  }
  return el('section', {},
    el('div', { class: 'status' },
      el('span', { class: 'big', 'aria-hidden': 'true' }, '✦'),
      el('p', {}, 'Shuffling your story deck…'),
      el('p', { class: 'hint' }, 'This takes a few seconds.')),
  );
}

function card(kind, tag, headline, ...body) {
  return el('details', { class: 'card', 'data-kind': kind },
    el('summary', {}, el('span', { class: 'tag' }, tag), el('span', { class: 'card-headline' }, headline)),
    el('div', { class: 'card-body' }, ...body),
  );
}

const field = (label, text) => [el('h3', {}, label), el('p', {}, text)];

// The compact "For Create-a-Sim" checklist at the bottom of a character card.
const CAS_ROWS = [
  ['lifeStage', 'Life stage'],
  ['orientation', 'Orientation'],
  ['boundaries', 'Jealousy & boundaries'],
  ['likes', 'Likes'],
  ['dislikes', 'Dislikes'],
  ['turnOns', 'Turn-ons'],
  ['turnOffs', 'Turn-offs'],
  ['pet', 'Pet'],
];

function casChecklist(cas) {
  if (!cas) return null;
  const rows = CAS_ROWS.filter(([key]) => cas[key]);
  return el('div', { class: 'cas' },
    el('h3', {}, 'For Create-a-Sim'),
    el('dl', {}, rows.map(([key, label]) => [el('dt', {}, label), el('dd', {}, cas[key])])));
}

// The deck opens on whatever the player's starting style cares about most.
const CARD_ORDER = {
  character: ['character', 'premise', 'plot', 'world'],
  plot: ['plot', 'premise', 'character', 'world'],
  world: ['world', 'premise', 'character', 'plot'],
  premise: ['premise', 'character', 'plot', 'world'],
};

export function planCards(plan) {
  const groups = {
    premise: [card('premise', 'Premise', plan.heart || 'Your story in a nutshell', el('p', {}, plan.premise))],
    character: plan.characters.map((c) =>
      card('character', 'Sim', `${c.name} — ${c.headline}`,
        el('span', { class: 'name-tag' }, c.name),
        ...field('Personality', c.personality),
        ...field('Connections', c.connections),
        casChecklist(c.cas))),
    plot: [card('plot', 'Plot', plan.plotline.headline,
      el('p', {}, plan.plotline.body),
      ...field('Play toward', plan.plotline.goal))],
    world: [card('world', 'World', 'Where & when',
      ...field('World', plan.world.world),
      ...field('Lots', plan.world.lots),
      ...field('Season', plan.world.season))],
  };
  return (CARD_ORDER[plan.leadCard] || CARD_ORDER.premise).flatMap((kind) => groups[kind]);
}

// Says which packs the story's ingredients came from, and which picked packs don't have notes yet.
function ingredientNote(plan) {
  const ing = plan.ingredients;
  if (!ing) return null;
  const used = [...new Set((plan.ingredientsUsed || []).map((i) => i.source))];
  const notYet = ing.packs.filter((p) => !p.hasNotes).map((p) => p.name);
  return el('p', { class: 'hint' },
    !used.length || used[0] === 'General' ? 'Story ingredients: base game.' : `Story ingredients from: ${used.join(', ')}.`,
    notYet.length ? ` Not used yet (notes coming soon): ${notYet.join(', ')}.` : null);
}

export function planScreen(run, go) {
  return el('section', {},
    el('h2', { class: 'screen-title' }, 'Your story deck'),
    el('p', { class: 'lead' }, 'Tap a card to open it.'),
    ingredientNote(run.plan),
    el('div', { class: 'deck' }, planCards(run.plan)),
    el('div', { class: 'actions' },
      el('button', { class: 'pill', type: 'button', onclick: () => go('start-over') }, 'Start over')),
  );
}
