import { useEffect, useRef, useState } from 'react'
import { usePortfolioStore } from '../store/usePortfolioStore'
import PageHeader from '../components/PageHeader'
import { generateJSON, checkGeminiConfigured } from '../utils/gemini'
import { fileToDataURL } from '../utils/localStorage'
import { collectProjectImages } from '../utils/portfolioImages'

const SECTIONS = [
  { key: 'strengths', title: 'Strengths', icon: '◆' },
  { key: 'improvements', title: 'Areas for Improvement', icon: '◇' },
  { key: 'concepts', title: 'Suggested Design Concepts', icon: '▲' },
  { key: 'presentation', title: 'Presentation Notes', icon: '▦' },
]

const SYSTEM_PROMPT = `You are an experienced architecture critic and design tutor. You review a student's architectural design — analyzing both any attached images (renders, plans, elevations, sections, diagrams) and the written description — for their graduation portfolio. Read the drawings/images carefully: comment on spatial organization, form, circulation, facade/material treatment, and presentation quality. Be constructive, specific, and encouraging but honest.`

function buildPrompt(text, imageCount) {
  const intro =
    imageCount > 0
      ? `Analyze the ${imageCount} attached architectural design image(s)${
          text.trim() ? ' together with the description below' : ''
        }.`
      : 'Review the following architectural project description.'

  return `${intro}

Respond ONLY with a JSON object (no markdown, no prose outside the JSON) with exactly these keys, each an array of 3-5 concise string points:
{
  "strengths": [],
  "improvements": [],
  "concepts": [],
  "presentation": []
}

"strengths" = what works well in the design and its presentation. "improvements" = areas to develop. "concepts" = suggested design concepts/directions to explore. "presentation" = notes on how to present this in a portfolio.

${text.trim() ? `Project description:\n"""\n${text}\n"""` : '(No written description provided — base your review on the images.)'}`
}

export default function AIReview() {
  const projects = usePortfolioStore((s) => s.projects)
  const fileRef = useRef(null)
  const [text, setText] = useState('')
  const [images, setImages] = useState([]) // data URLs
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [keyMissing, setKeyMissing] = useState(false)

  useEffect(() => {
    checkGeminiConfigured().then((ok) => setKeyMissing(!ok))
  }, [])

  async function addFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) =>
      f.type.startsWith('image/')
    )
    const urls = await Promise.all(files.map(fileToDataURL))
    setImages((prev) => [...prev, ...urls].slice(0, 8))
  }

  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i))

  function loadFromProject(e) {
    const p = projects.find((p) => p.id === e.target.value)
    if (!p) return
    const parts = [
      p.overview.description,
      p.concept.title && `Concept: ${p.concept.title}`,
      p.concept.description,
    ].filter(Boolean)
    setText(parts.join('\n\n'))
    setImages(collectProjectImages(p))
  }

  async function runReview() {
    setError('')
    setResult(null)
    if (!text.trim() && images.length === 0) {
      setError('Add a description and/or at least one design image to review.')
      return
    }
    setLoading(true)
    try {
      const parsed = await generateJSON(buildPrompt(text, images.length), {
        system: SYSTEM_PROMPT,
        images,
        maxOutputTokens: 1500,
      })
      setResult(parsed)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="03 — Studio"
        title="AI Review"
        description="Get an AI critique of your architectural design — Gemini analyzes your images and description together for strengths, improvements, design directions, and presentation notes."
      />

      {keyMissing && (
        <p className="mb-6 rounded-sm border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
          GEMINI_API_KEY is not set. Add it to your <code>.env</code> file (or
          Replit Secrets) and restart the dev server.
        </p>
      )}

      {/* Images */}
      <div className="card mb-6 p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="label-field mb-0">Design Images</span>
          <div className="flex items-center gap-3">
            {projects.length > 0 && (
              <select
                className="rounded-sm border border-border bg-surface px-2 py-1 text-xs text-muted"
                onChange={loadFromProject}
                defaultValue=""
              >
                <option value="" disabled>
                  Load from project…
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.overview.name || 'Untitled'}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="btn-ghost text-xs"
            >
              ＋ Add images
            </button>
          </div>
        </div>

        {images.length === 0 ? (
          <p className="rounded-sm border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            Add renders, plans, elevations or sections — or load them from a
            project — for visual analysis.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {images.map((src, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-sm border border-border">
                <img src={src} alt={`design ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 rounded-sm bg-black/55 px-1.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Text */}
      <div className="card mb-6 p-5">
        <span className="label-field">Project Description (optional)</span>
        <textarea
          className="textarea-field min-h-[160px]"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe the concept, program, site and intent — or leave blank to review the images alone…"
        />
        <div className="mt-4 flex items-center gap-4">
          <button onClick={runReview} disabled={loading} className="btn-accent">
            {loading ? 'Analyzing…' : 'Analyze with Gemini'}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {SECTIONS.map((s) => (
            <div key={s.key} className="card p-6">
              <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
                <span className="text-accent">{s.icon}</span>
                <h3 className="font-display text-2xl">{s.title}</h3>
              </div>
              <ul className="space-y-3">
                {(result[s.key] || []).map((point, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
