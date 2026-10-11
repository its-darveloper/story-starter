// Each screen is a function that returns an element to show. Screens receive the
// current run state plus `go`, which moves to another screen.

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  node.append(...children.flat().filter((c) => c != null && c !== false));
  return node;
}

export function yapScreen(run, go) {
  const box = el('textarea', {
    id: 'yap',
    placeholder: 'Who are your Sims? What are they like? What do you picture happening?',
    'aria-label': 'Tell us about your story',
  });
  box.value = run.yap;
  const next = el('button', { class: 'pill primary', type: 'button' }, 'Make my plan ✦');
  next.disabled = !box.value.trim();
  box.addEventListener('input', () => {
    run.yap = box.value;
    next.disabled = !box.value.trim();
  });
  next.addEventListener('click', () => go('making'));

  return el('section', {},
    el('h2', { class: 'screen-title' }, 'Spill it'),
    el('p', { class: 'lead' }, 'Say whatever you imagine, in your own words. A few words is fine. You can type or use your keyboard’s microphone.'),
    box,
    el('div', { class: 'actions' }, next),
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
        el('button', { class: 'pill', type: 'button', onclick: () => go('yap') }, 'Back to my idea')),
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

export function planCards(plan) {
  const cards = [
    card('premise', 'Premise', 'Your story in a nutshell', el('p', {}, plan.premise)),
    ...plan.characters.map((c) =>
      card('character', 'Sim', `${c.name} — ${c.headline}`,
        el('span', { class: 'name-tag' }, c.name),
        ...field('Personality', c.personality),
        ...field('Connections', c.connections))),
    card('plot', 'Plot', plan.plotline.headline,
      el('p', {}, plan.plotline.body),
      ...field('Play toward', plan.plotline.goal)),
    card('world', 'World', 'Where & when',
      ...field('World', plan.world.world),
      ...field('Lots', plan.world.lots),
      ...field('Season', plan.world.season)),
  ];
  return cards;
}

export function planScreen(run, go) {
  return el('section', {},
    el('h2', { class: 'screen-title' }, 'Your story deck'),
    el('p', { class: 'lead' }, 'Tap a card to open it.'),
    el('div', { class: 'deck' }, planCards(run.plan)),
    el('div', { class: 'actions' },
      el('button', { class: 'pill', type: 'button', onclick: () => go('yap') }, 'Start over')),
  );
}
