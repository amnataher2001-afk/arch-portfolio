// Gemini AI service — runs on the server (Node 18+).
//
// The API key is read ONLY from the GEMINI_API_KEY environment variable
// (.env via dotenv, or Replit Secrets). It is never hardcoded — keeping it out
// of source so it can't be committed to GitHub.
//
// Calls the Gemini REST API directly with fetch (Node 18+ has global fetch) so
// we have full control over generationConfig — notably thinkingConfig, which
// disables the 2.5 models' default "thinking" so it doesn't consume the output
// budget and truncate structured JSON responses.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

// Load .env from the project root regardless of the current working directory.
// (The usual reason a key "isn't read" is node being started from another dir,
// since dotenv resolves .env relative to process.cwd() by default.)
dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env'),
})

const API_KEY = process.env.GEMINI_API_KEY || ''
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

if (!API_KEY) {
  console.warn(
    '[geminiService] GEMINI_API_KEY is not set. Add it to .env (or Replit Secrets).'
  )
}

// True when a key is configured (used by the /health endpoint).
export function isConfigured() {
  return Boolean(API_KEY)
}

// Convert a base64 image data URL into a Gemini inlineData part.
function dataUrlToInline(dataUrl) {
  if (typeof dataUrl !== 'string') return null
  const m = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl)
  if (!m) return null
  const mimeType = m[1]
  if (!mimeType.startsWith('image/')) return null
  return { mimeType, data: m[2] }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Generate content from Gemini (supports multimodal image + text input).
 *
 * @param {object} params
 * @param {string} params.prompt
 * @param {string} [params.system]
 * @param {string[]} [params.images]    image data URLs
 * @param {boolean} [params.json]       request strict JSON output
 * @param {number} [params.maxOutputTokens]
 * @param {number} [params.temperature]
 * @param {string} [params.model]
 * @param {number|null} [params.thinkingBudget] 0 disables thinking (default);
 *        pass null to omit (e.g. for gemini-2.5-pro, which can't disable it).
 * @returns {Promise<string>} generated text
 */
export async function generateContent({
  prompt,
  system,
  images = [],
  json = false,
  maxOutputTokens = 2048,
  temperature,
  model = DEFAULT_MODEL,
  thinkingBudget = 0,
}) {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server.')
  }
  if (!prompt && (!images || images.length === 0)) {
    throw new Error('A prompt or at least one image is required.')
  }

  // Images first, then the text prompt.
  const parts = []
  for (const img of images) {
    const inline = dataUrlToInline(img)
    if (inline) parts.push({ inlineData: inline })
  }
  parts.push({ text: prompt || '' })

  const generationConfig = { maxOutputTokens }
  if (temperature != null) generationConfig.temperature = temperature
  if (json) generationConfig.responseMimeType = 'application/json'
  // Disable "thinking" for predictable, complete output (2.5 flash models).
  if (thinkingBudget != null) generationConfig.thinkingConfig = { thinkingBudget }

  const body = { contents: [{ role: 'user', parts }], generationConfig }
  if (system) body.systemInstruction = { parts: [{ text: system }] }

  const url = `${BASE_URL}/models/${model}:generateContent`

  // Retry transient overloads (503) and per-minute rate limits (429).
  let res
  let data
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': API_KEY },
        body: JSON.stringify(body),
      })
    } catch {
      throw new Error('Network error — could not reach the Gemini API.')
    }
    data = await res.json().catch(() => null)
    if (res.ok) break
    if ((res.status === 503 || res.status === 429) && attempt < 2) {
      await sleep(1500 * (attempt + 1))
      continue
    }
    throw new Error(data?.error?.message || `Gemini request failed (${res.status}).`)
  }

  const cand = data?.candidates?.[0]
  const text = cand?.content?.parts?.map((p) => p.text || '').join('') || ''
  if (!text) {
    const reason = cand?.finishReason || data?.promptFeedback?.blockReason
    throw new Error(
      reason ? `Gemini returned no text (${reason}).` : 'Gemini returned no text.'
    )
  }
  return text
}
