import { usePortfolioStore } from '../../store/usePortfolioStore'
import ImageUploader from '../../components/ImageUploader'
import { useProjectId } from './ProjectDetail'

const TYPES = ['Graduation', 'Academic', 'Competition', 'Personal']

export default function ProjectOverview() {
  const projectId = useProjectId()
  const project = usePortfolioStore((s) =>
    s.projects.find((p) => p.id === projectId)
  )
  const updateProjectSection = usePortfolioStore((s) => s.updateProjectSection)
  if (!project) return null
  const o = project.overview

  const set = (key) => (e) =>
    updateProjectSection(projectId, 'overview', { [key]: e.target.value })

  const tags = o.tags || []
  const addTag = (val) => {
    const t = val.trim()
    if (t && !tags.includes(t))
      updateProjectSection(projectId, 'overview', { tags: [...tags, t] })
  }
  const removeTag = (t) =>
    updateProjectSection(projectId, 'overview', {
      tags: tags.filter((x) => x !== t),
    })

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
      {/* Fields */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="label-field">Project Name</span>
          <input className="input-field" value={o.name} onChange={set('name')} placeholder="e.g. Riverside Cultural Center" />
        </label>

        <label className="block">
          <span className="label-field">Project Type</span>
          <select className="input-field" value={o.type} onChange={set('type')}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="label-field">Year</span>
          <input className="input-field" value={o.year} onChange={set('year')} placeholder="2026" />
        </label>

        <label className="block">
          <span className="label-field">Location</span>
          <input className="input-field" value={o.location} onChange={set('location')} placeholder="Cairo, Egypt" />
        </label>

        <label className="block">
          <span className="label-field">Area (m²)</span>
          <input className="input-field" value={o.area} onChange={set('area')} placeholder="4,500" />
        </label>

        <label className="block sm:col-span-2">
          <span className="label-field">Project Supervisor (if academic)</span>
          <input className="input-field" value={o.supervisor} onChange={set('supervisor')} placeholder="Dr. Mona Hassan" />
        </label>

        <label className="block sm:col-span-2">
          <span className="label-field">Short Description (2–3 sentences)</span>
          <textarea className="textarea-field" value={o.description} onChange={set('description')} placeholder="A concise intro shown at the top of the project…" />
        </label>

        {/* Tags */}
        <div className="sm:col-span-2">
          <span className="label-field">Tags</span>
          <div className="mb-2 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 rounded-sm bg-surface-alt px-3 py-1 text-xs">
                {t}
                <button onClick={() => removeTag(t)} className="text-muted hover:text-accent">
                  ✕
                </button>
              </span>
            ))}
            {tags.length === 0 && <span className="text-xs text-muted">No tags yet.</span>}
          </div>
          <input
            className="input-field"
            placeholder="Type a tag (e.g. Residential, Sustainable) and press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag(e.target.value)
                e.target.value = ''
              }
            }}
          />
        </div>
      </div>

      {/* Hero shot */}
      <div>
        <ImageUploader
          label="Hero Shot — main project image"
          value={o.heroShot}
          onChange={(url) => updateProjectSection(projectId, 'overview', { heroShot: url })}
          aspect="aspect-[3/4]"
        />
        <p className="mt-3 text-xs leading-relaxed text-muted">
          This image headlines the project — pick your strongest render or
          photograph.
        </p>
      </div>
    </div>
  )
}
