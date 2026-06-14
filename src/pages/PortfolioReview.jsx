import { useEffect, useMemo, useState } from 'react'
import { usePortfolioStore } from '../store/usePortfolioStore'
import PageHeader from '../components/PageHeader'
import { generateJSON, checkGeminiConfigured } from '../utils/gemini'
import { collectPortfolioImages } from '../utils/portfolioImages'
import { LEVELS } from '../components/SkillSlider'

const SECTIONS = [
  { key: 'strengths', title: 'Strengths', icon: '◆' },
  { key: 'improvements', title: 'What to Improve', icon: '◇' },
  { key: 'presentation', title: 'Presentation Tips', icon: '▦' },
]

const SYSTEM_PROMPT = `You are a senior architecture portfolio reviewer and admissions/hiring advisor. You give honest, specific, actionable feedback on a student's full architectural portfolio. Any attached images are representative work (hero shots / renders) from the portfolio — assess their visual and design quality alongside the written summary. Be encouraging but rigorous.`

// Turn the whole portfolio into a compact text summary for the model.
function buildSummary(state) {
  const { studentInfo, aboutMe, skills, cv, projects } = state
  const L = []

  L.push('# STUDENT')
  L.push(
    [
      studentInfo.fullName && `Name: ${studentInfo.fullName}`,
      studentInfo.university && `University: ${studentInfo.university}`,
      studentInfo.faculty && `Faculty: ${studentInfo.faculty}`,
      studentInfo.graduationYear && `Graduation: ${studentInfo.graduationYear}`,
    ]
      .filter(Boolean)
      .join('\n') || '(not provided)'
  )

  L.push('\n# ABOUT')
  L.push(aboutMe.bio || '(no bio)')
  if (aboutMe.philosophy) L.push(`Philosophy: ${aboutMe.philosophy}`)

  const skillLine = (list) =>
    list.map((s) => `${s.name} (${LEVELS[Number(s.level)]})`).join(', ')
  L.push('\n# SKILLS')
  L.push(
    [
      skills.software.length && `Software: ${skillLine(skills.software)}`,
      skills.design.length && `Design: ${skillLine(skills.design)}`,
      skills.languages.length && `Languages: ${skillLine(skills.languages)}`,
      skills.other.length && `Other: ${skillLine(skills.other)}`,
    ]
      .filter(Boolean)
      .join('\n') || '(no skills listed)'
  )

  L.push('\n# CV')
  L.push(
    [
      cv.education.length && `Education entries: ${cv.education.length}`,
      cv.experience.length && `Experience entries: ${cv.experience.length}`,
      cv.awards.length && `Awards: ${cv.awards.length}`,
      cv.publications.length && `Publications: ${cv.publications.length}`,
      cv.volunteer.length && `Volunteer: ${cv.volunteer.length}`,
    ]
      .filter(Boolean)
      .join('\n') || '(empty)'
  )

  L.push('\n# PROJECTS')
  if (projects.length === 0) {
    L.push('(no projects)')
  } else {
    projects.forEach((p, i) => {
      const o = p.overview
      L.push(
        `\n## Project ${i + 1}: ${o.name || 'Untitled'} — ${o.type}, ${o.year || 'n/a'}, ${o.location || 'n/a'}`
      )
      if (o.description) L.push(`Description: ${o.description}`)
      if (p.concept.title || p.concept.description)
        L.push(
          `Concept: ${p.concept.title || ''} — ${p.concept.description || ''}`
        )
      L.push(
        `Content: ${p.plans.items.length} plans, ${p.elevations.items.length} elevations, ${p.sections.items.length} sections, ${p.shots.items.length} renders/shots, hero image: ${o.heroShot ? 'yes' : 'no'}.`
      )
    })
  }

  return L.join('\n')
}

function buildPrompt(summary) {
  return `Evaluate the following architecture student's full portfolio. Respond ONLY with a JSON object (no markdown, no prose outside the JSON) with exactly these keys:
{
  "overall": "a 2-3 sentence overall assessment",
  "strengths": ["3-5 specific strengths"],
  "improvements": ["3-6 specific, actionable things to improve"],
  "presentation": ["3-5 tips on layout, storytelling and visual presentation"]
}

Be concrete and reference the actual content where possible (project balance, missing drawings, weak descriptions, skill gaps, etc.).

PORTFOLIO:
"""
${summary}
"""`
}

export default function PortfolioReview() {
  const state = usePortfolioStore()
  const { projects } = state
  const [keyMissing, setKeyMissing] = useState(false)

  useEffect(() => {
    checkGeminiConfigured().then((ok) => setKeyMissing(!ok))
  }, [])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const summary = useMemo(() => buildSummary(state), [state])
  const hasContent =
    projects.length > 0 || state.aboutMe.bio || state.studentInfo.fullName

  async function runReview() {
    setError('')
    setResult(null)
    if (!hasContent) {
      setError('Add some portfolio content before requesting a review.')
      return
    }
    setLoading(true)
    try {
      const images = collectPortfolioImages(projects)
      const parsed = await generateJSON(buildPrompt(summary), {
        system: SYSTEM_PROMPT,
        images,
        maxOutputTokens: 2000,
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
        title="Portfolio Review"
        description="Get a holistic Gemini evaluation of your entire portfolio — analyzing your project images and content for strengths, what to improve, and presentation tips."
        action={
          <button onClick={runReview} disabled={loading} className="btn-accent">
            {loading ? 'Reviewing…' : '✦ Review My Portfolio'}
          </button>
        }
      />

      {keyMissing && (
        <p className="mb-6 rounded-sm border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
          GEMINI_API_KEY is not set. Add it to your <code>.env</code> file (or
          Replit Secrets) and restart the dev server.
        </p>
      )}

      {error && (
        <p className="mb-6 rounded-sm border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {!result && !loading && (
        <div className="card flex flex-col items-center justify-center px-8 py-20 text-center">
          <div className="mb-4 text-3xl text-accent">✦</div>
          <p className="font-display text-2xl">Ready when you are</p>
          <p className="mt-2 max-w-md text-sm text-muted">
            Click “Review My Portfolio” and Gemini will assess your whole
            portfolio — images and content — at once.
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {result.overall && (
            <div className="card border-l-2 border-l-accent p-6">
              <p className="eyebrow mb-2">Overall</p>
              <p className="text-lg leading-relaxed">{result.overall}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {SECTIONS.map((s) => (
              <div key={s.key} className="card p-6">
                <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
                  <span className="text-accent">{s.icon}</span>
                  <h3 className="font-display text-xl">{s.title}</h3>
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
        </div>
      )}
    </div>
  )
}
