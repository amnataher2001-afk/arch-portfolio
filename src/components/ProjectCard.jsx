import { Link } from 'react-router-dom'
import { usePortfolioStore } from '../store/usePortfolioStore'

// Count all uploaded media across a project for a quick summary line.
function countMedia(p) {
  const lists = [
    p.concept.images,
    p.concept.diagrams,
    p.plans.items,
    p.elevations.items,
    p.sections.items,
    p.shots.items,
  ]
  let n = lists.reduce((sum, l) => sum + l.length, 0)
  if (p.overview.heroShot) n += 1
  return n
}

export default function ProjectCard({ project }) {
  const removeProject = usePortfolioStore((s) => s.removeProject)
  const o = project.overview

  return (
    <div className="card group relative overflow-hidden">
      <Link to={`/projects/${project.id}`} className="block">
        <div className="aspect-[4/3] w-full overflow-hidden bg-surface-alt">
          {o.heroShot ? (
            <img
              src={o.heroShot}
              alt={o.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              No hero image
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <span className="eyebrow">{o.type}</span>
            <span className="text-xs text-muted">{o.year}</span>
          </div>
          <h3 className="mt-2 font-display text-2xl leading-tight">
            {o.name || 'Untitled Project'}
          </h3>
          <p className="mt-1 text-xs text-muted">
            {o.location || 'No location'} · {countMedia(project)} items
          </p>
        </div>
      </Link>

      <button
        onClick={() => {
          if (confirm(`Delete “${o.name || 'this project'}”? This cannot be undone.`))
            removeProject(project.id)
        }}
        className="absolute right-3 top-3 rounded-sm bg-black/40 px-2 py-1 text-xs text-white opacity-0 transition hover:bg-black/70 group-hover:opacity-100"
        title="Delete project"
      >
        Delete
      </button>
    </div>
  )
}
