// Client-side helper. It talks to OUR backend (/api/gemini), which holds the
// GEMINI_API_KEY server-side via dotenv. No API key is present in the browser.
//
// In dev, Vite proxies /api → the Express server (see vite.config.js).
// In production, the Express server serves the built client and the API.

const ENDPOINT = '/api/gemini'

// Pull the first {...} JSON object out of a response (it may be fenced/prose).
export function extractJSON(raw) {
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

// Ask the backend whether a key is configured (for UI gating).
export async function checkGeminiConfigured() {
  try {
    const res = await fetch(`${ENDPOINT}/health`)
    if (!res.ok) return false
    const data = await res.json()
    return Boolean(data?.configured)
  } catch {
    return false
  }
}

/**
 * Generate text via the backend. Supports multimodal image + text input.
 * @param {string} prompt
 * @param {object} [opts] { system, model, maxOutputTokens, temperature, json, images }
 * @returns {Promise<string>}
 */
export async function generateText(prompt, opts = {}) {
  const { system, model, maxOutputTokens, temperature, json = false, images = [] } = opts

  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        prompt,
        system,
        model,
        maxOutputTokens,
        temperature,
        json,
        images,
      }),
    })
  } catch {
    throw new Error('Network error — could not reach the Gemini service.')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error || `Gemini request failed (${res.status}).`)
  }

  const data = await res.json()
  const text = data?.text || ''
  if (!text) throw new Error('Gemini returned no text.')
  return text
}

/** Generate and parse JSON. */
export async function generateJSON(prompt, opts = {}) {
  const text = await generateText(prompt, { ...opts, json: true })
  const parsed = extractJSON(text)
  if (!parsed) throw new Error('Could not parse the Gemini response as JSON.')
  return parsed
}
