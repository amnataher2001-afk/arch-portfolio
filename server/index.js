// Minimal Express server that exposes the Gemini AI service to the client.
// The API key lives only here (server-side), loaded from .env via dotenv.
import dotenv from 'dotenv'
dotenv.config()
console.log("API KEY:", process.env.GEMINI_API_KEY)
import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateContent, isConfigured } from './geminiService.js'

const app = express()
app.use(cors())
// Images are sent as base64 data URLs, so allow a generous body size.
app.use(express.json({ limit: '25mb' }))

// Health check — lets the client know if a key is configured.
app.get('/api/gemini/health', (req, res) => {
  res.json({ configured: isConfigured() })
})

// Main generate endpoint.
app.post('/api/gemini', async (req, res) => {
  try {
    const text = await generateContent(req.body || {})
    res.json({ text })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Gemini request failed.' })
  }
})

// In production, serve the built client (vite build → dist/) so everything
// runs on one origin. Skipped during dev (Vite serves the client and proxies
// /api to this server).
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '..', 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  // SPA fallback for client-side routes (anything not under /api).
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Gemini API server listening on http://localhost:${PORT}`)
  if (!isConfigured()) {
    console.warn('⚠  GEMINI_API_KEY not set — /api/gemini will return errors.')
  }
})
