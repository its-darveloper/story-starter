// One function that calls the Anthropic Messages API and returns the reply text.
// The API key is read from the environment (.env) and never leaves this server.

const API_URL = 'https://api.anthropic.com/v1/messages';
export const MODEL = 'claude-sonnet-5-5';

// This model always thinks before answering, and that thinking counts toward
// max_tokens. 16000 leaves room for thinking plus a full plan; `effort` sets how
// hard it thinks (low | medium | high), trading depth for speed.
export async function askClaude({ system, prompt, maxTokens = 16000, effort = 'medium' }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is missing. Add it to .env and restart.');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      // If a safety check declines a request, let the API retry it on a fallback model.
      'anthropic-beta': 'server-side-fallback-2026-07-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      output_config: { effort },
      fallbacks: 'default',
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Claude API error ${res.status}: ${data.error?.message || 'unknown'}`);
  }
  if (data.stop_reason === 'max_tokens') console.warn('Claude ran out of room before finishing.');
  if (data.stop_reason === 'refusal') console.warn('Claude declined this request.');
  return data.content.filter((c) => c.type === 'text').map((c) => c.text).join('');
}
