// One function that calls the Anthropic Messages API and returns the reply text.
// The API key is read from the environment (.env) and never leaves this server.

const API_URL = 'https://api.anthropic.com/v1/messages';
export const MODEL = 'claude-sonnet-5-5';

export async function askClaude({ system, prompt, maxTokens = 2000 }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is missing. Add it to .env and restart.');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Claude API error ${res.status}: ${data.error?.message || 'unknown'}`);
  }
  return data.content.filter((c) => c.type === 'text').map((c) => c.text).join('');
}
