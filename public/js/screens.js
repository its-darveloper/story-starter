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

// Hand-cut lettering: every letter gets a small, repeatable tilt and nudge, and an
// occasional letter is cut out of black paper. Same text always looks the same.
export function cutType(text) {
  let n = 0;
  let inverted = false; // at most one cut-out letter per heading, or it gets noisy
  return text.split(' ').map((word) => el('span', { class: 'w' },
    [...word].map((ch) => {
      const k = (ch.charCodeAt(0) * 7 + n++ * 13) % 17;
      const letter = /[A-Za-z]/.test(ch);
      const inv = letter && !inverted && (k === 3 || k === 11);
      if (inv) inverted = true;
      return el('span', {
        class: 'l' + (inv ? ' inv' : '') + (letter || /\d/.test(ch) ? '' : ' punct'),
        style: `--r:${(k % 7) - 3}deg;--y:${(k % 5) - 2}px`,
      }, ch);
    })));
}

// Turn plain text already on the page (like the masthead) into hand-cut lettering.
export function cutify(node) {
  node.replaceChildren(el('span', { 'aria-hidden': 'true' }, cutType(node.textContent.trim())));
}

const TILTS = [-1.2, 0.9, -0.5, 1.4, -0.9, 0.6, -1.5, 1.1];
const tilt = (i) => `--tilt:${TILTS[i % TILTS.length]}deg`;
const swatch = (i, extra = '') => el('span', { class: `swatch p${i % 8}${extra}`, 'aria-hidden': 'true' });
const cutHeading = (cls, text) => el('h2', { class: `${cls} cut`, 'aria-label': text }, el('span', { 'aria-hidden': 'true' }, cutType(text)));
const title = (text) => cutHeading('screen-title', text);

// Tap feedback: stamp the tile down, then move on once the animation has played.
const stampThen = (node, fn) => {
  node.classList.add('stamp');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(fn, reduced ? 0 : 200);
};

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
};

export function welcomeScreen(run, go, { saved, onOpen, onDelete }) {
  const savedItem = (p, i) => el('li', { class: 'saved tile', style: tilt(i + 3) },
    swatch(i + 2),
    el('button', { class: 'saved-open', type: 'button', onclick: () => onOpen(p.id) },
      el('span', { class: 'saved-title' }, p.heart || p.plotline?.headline || 'A story plan'),
      el('span', { class: 'saved-meta' }, [
        p.characters?.map((c) => c.name.split(' ')[0]).join(', '),
        fmtDate(p.createdAt),
      ].filter(Boolean).join(' · '))),
    el('button', {
      class: 'saved-delete', type: 'button', 'aria-label': 'Delete this plan',
      onclick: () => { if (confirm('Delete this plan? This can’t be undone.')) onDelete(p.id); },
    }, '✕'));

  return el('section', {},
    el('div', { class: 'welcome' },
      cutHeading('welcome-head', 'Plan your Sims story before you play'),
      el('p', { class: 'welcome-sub' }, 'For when gameplay gets boring and every challenge starts to feel the same.'),
      el('div', { class: 'collage', 'aria-hidden': 'true' },
        el('img', { class: 'c1', src: 'img/blob-orange.svg', alt: '' }),
        swatch(0, ' c2'),
        el('img', { class: 'c3', src: 'img/burst-sand.svg', alt: '' }),
        el('img', { class: 'c4', src: 'img/ring.svg', alt: '' }),
        el('img', { class: 'c5', src: 'img/blob-sky.svg', alt: '' }),
        el('img', { class: 'c6', src: 'img/can-blue.svg', alt: '' })),
      el('div', { class: 'actions' },
        el('button', { class: 'pill primary', type: 'button', onclick: () => go('start-over') }, 'Start a story'))),
    saved.length
      ? el('div', { class: 'saved-plans' },
          title('My plans'),
          el('p', { class: 'hint' }, 'Saved on this device.'),
          el('ul', { class: 'saved-list' }, saved.map(savedItem)))
      : null,
  );
}

export function styleScreen(run, go, { styles }) {
  const pick = (st, i) => {
    const btn = el('button', {
      class: 'style-card tile',
      type: 'button',
      style: tilt(i),
      'aria-pressed': String(run.style === st.id),
    },
      swatch(i),
      el('span', { class: 'style-body' },
        el('span', { class: 'style-title' }, st.title),
        el('span', { class: 'style-desc' }, st.description)));
    btn.addEventListener('click', () => { run.style = st.id; stampThen(btn, () => go('yap')); });
    return btn;
  };

  return el('section', {},
    el('button', { class: 'pill back-link', type: 'button', onclick: () => go('welcome') }, '← Home'),
    title('How do you start?'),
    el('p', { class: 'lead' }, 'Pick the one that sounds most like you.'),
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
  const nudge = (id, i) => {
    const n = nudges[id];
    const btn = el('button', { class: 'nudge', type: 'button', style: tilt(i + 2) }, '+ ', n.label);
    btn.addEventListener('click', () => {
      const text = box.value.trimEnd();
      box.value = (text ? text + '\n' : '') + n.insert;
      update();
      // The sticker pops and the box flashes, so you can see where the words went.
      for (const [node, cls] of [[btn, 'peel'], [box, 'flash']]) {
        node.classList.remove(cls);
        void node.offsetWidth;
        node.classList.add(cls);
      }
      box.focus();
      box.setSelectionRange(box.value.length, box.value.length);
    });
    return btn;
  };
  update();

  return el('section', {},
    title('Spill it'),
    el('p', { class: 'lead' }, 'Your idea, your words. A few is fine. Typing or your keyboard’s mic both work.'),
    box,
    el('p', { class: 'hint hand' }, 'stuck? grab a sticker:'),
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
      title('Got it…'),
      el('div', { class: 'status' }, shuffle(), el('p', { class: 'hand' }, 'reading what you wrote…')),
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
    title('Here’s what I heard'),
    el('p', { class: 'bubble heard' }, run.reflection),
    el('p', { class: 'lead' }, 'A few gaps to fill. Answer any, skip the rest.'),
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
      class: 'pack tile' + (p.supernatural ? ' spooky' : ''),
      type: 'button',
      style: tilt(packs.indexOf(p)),
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
    title('Your packs'),
    el('p', { class: 'lead' }, 'Tap the ones you want in this story, or skip for base game.'),
    el('p', { class: 'hint' }, '“Notes coming soon” packs can be picked, but the plan won’t use their details yet.'),
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
    input.style.setProperty('--v', run.settings[d.id]);
    input.addEventListener('input', () => {
      run.settings[d.id] = Number(input.value);
      input.style.setProperty('--v', input.value);
      description.textContent = d.positions[run.settings[d.id] - 1];
    });
    return el('div', { class: 'dial', style: tilt(dials.dials.indexOf(d) + 1) },
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
    title('Set the mood'),
    el('p', { class: 'lead' }, 'Slide each one. The words underneath tell you what you’ll get.'),
    el('div', { class: 'dials' }, dials.dials.map(slider)),
    el('div', { class: 'dial supernatural' + (unlocked ? '' : ' locked') },
      el('label', { class: 'check', for: 'supernatural' }, box, el('span', {}, sn.label)),
      note),
    el('div', { class: 'actions' },
      el('button', { class: 'pill', type: 'button', onclick: () => go('packs') }, '← Back'),
      el('button', { class: 'pill primary', type: 'button', onclick: () => go('making') }, 'Make my plan ✦')),
  );
}

const shuffle = () => el('div', { class: 'shuffle', 'aria-hidden': 'true' },
  el('span', { class: 'p0' }), el('span', { class: 'p4' }), el('span', { class: 'p3' }));

export function makingScreen(run, go, { error } = {}) {
  if (error) {
    return el('section', {},
      el('div', { class: 'status' }, el('p', { class: 'hand' }, 'hmm, the plan got stuck.')),
      el('p', { class: 'error', role: 'alert' }, error),
      el('div', { class: 'actions' },
        el('button', { class: 'pill primary', type: 'button', onclick: () => go('making') }, 'Try again'),
        el('button', { class: 'pill', type: 'button', onclick: () => go('dials') }, 'Back')),
    );
  }
  return el('section', {},
    el('div', { class: 'status' },
      shuffle(),
      el('p', { class: 'hand' }, 'shuffling your story deck…'),
      el('p', { class: 'hint' }, 'About 20 seconds.')),
  );
}

const CARD_PATTERN = { premise: 2, character: 0, plot: 3, world: 4 };

function card(kind, tag, headline, ...body) {
  return el('details', { class: 'card', 'data-kind': kind },
    el('summary', {},
      swatch(CARD_PATTERN[kind]),
      el('span', { class: 'card-head' }, el('span', { class: 'tag' }, tag), el('span', { class: 'card-headline' }, headline))),
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
      card('character', 'Sim', [el('span', { class: 'sim-name' }, c.name), el('span', { class: 'sim-line' }, c.headline)],
        ...field('Personality', c.personality),
        c.wants && field('Wants', c.wants),
        c.holdingBack && field('Holding them back', c.holdingBack),
        ...field('Connections', c.connections),
        casChecklist(c.cas))),
    plot: [card('plot', 'Plot', plan.plotline.headline,
      plan.plotline.dayOne && field('Day one', plan.plotline.dayOne),
      el('p', {}, plan.plotline.body),
      ...field('Play toward', plan.plotline.goal))],
    world: [card('world', 'World', 'Where & when',
      ...field('World', plan.world.world),
      ...field('Lots', plan.world.lots),
      ...field('Season', plan.world.season))],
  };
  const cards = (CARD_ORDER[plan.leadCard] || CARD_ORDER.premise).flatMap((kind) => groups[kind]);
  // Each Sim gets its own pattern; every card gets a tilt and its turn in the deal.
  let sims = 0;
  const simCount = plan.characters.length;
  cards.forEach((c, i) => {
    c.style.cssText = `${tilt(i)};--i:${i}`;
    if (c.dataset.kind === 'character') {
      c.querySelector('.swatch').className = `swatch p${[0, 6, 4, 1][sims % 4]}`;
      // An odd Sim out spans the full width, so the collage has no hole.
      if (simCount % 2 === 1 && sims === simCount - 1) c.classList.add('wide');
      sims++;
    }
  });
  return cards;
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

export function planScreen(run, go, { saved = true } = {}) {
  return el('section', {},
    el('button', { class: 'pill back-link', type: 'button', onclick: () => go('welcome') }, '← My plans'),
    title('Your story deck'),
    el('p', { class: 'lead' }, 'Tap a card to open it.'),
    saved
      ? el('p', { class: 'hint saved-note' }, `✓ Saved on this device${run.plan.createdAt ? ` · ${fmtDate(run.plan.createdAt)}` : ''}`)
      : el('p', { class: 'error' }, 'This plan couldn’t be saved on this device (private browsing can block it). Screenshot it if you want to keep it.'),
    ingredientNote(run.plan),
    el('div', { class: 'deck' }, planCards(run.plan)),
    el('div', { class: 'actions' },
      el('button', { class: 'pill primary', type: 'button', onclick: () => go('start-over') }, 'Start a new story ✦')),
  );
}
