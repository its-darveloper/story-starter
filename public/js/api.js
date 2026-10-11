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

export async function getPacks() {
  const res = await fetch('/api/packs');
  if (!res.ok) throw new Error("Couldn't load the pack list.");
  return (await res.json()).packs;
}
