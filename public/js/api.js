// Calls from the page to our own server. The page never talks to Claude directly.

async function post(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Couldn't reach the story server. Is it running?");
  return data;
}

export const makePlan = (run) => post('/api/plan', run);
export const reflect = (input) => post('/api/reflect', input);

async function get(path, what) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Couldn't load the ${what}.`);
  return res.json();
}

export const getPacks = async () => (await get('/api/packs', 'pack list')).packs;
export const getDials = () => get('/api/dials', 'story dials');
export const getStyles = () => get('/api/styles', 'starting styles');
