import { NavLink, Outlet, useParams, Link, useOutletContext } from 'react-router-dom'
import { usePortfolioStore } from '../../store/usePortfolioStore'

const TABS = [
  { to: '', label: 'Overview', end: true },
  { to: 'concept', label: 'Concept' },
  { to: 'plans', label: 'Plans' },
  { to: 'elevations', label: 'Elevations' },
  { to: 'sections', label: 'Sections' },
  { to: 'shots', label: 'Shots' },
]

export default function ProjectDetail() {
  const { id } = useParams()
  const project = usePortfolioStore((s) => s.projects.find((p) => p.id === id))

  if (!project) {
    return (
      <div className="card px-8 py-16 text-center">
        <p className="font-display text-2xl">Project not found</p>
        <Link to="/projects" className="btn-ghost mt-4">
          ← Back to projects
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/projects"
        className="mb-4 inline-block text-xs uppercase tracking-wider2 text-muted transition hover:text-accent"
      >
        ← All projects
      </Link>

      <div className="mb-6 border-b border-border pb-6">
        <p className="eyebrow mb-2">{project.overview.type || 'Project'}</p>
        <h2 className="font-display text-4xl md:text-5xl">
          {project.overview.name || 'Untitled Project'}
        </h2>
      </div>

      {/* Internal tabs */}
      <div className="mb-8 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to || 'overview'}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `-mb-px border-b-2 px-4 py-2.5 text-sm transition ${
                isActive
                  ? 'border-accent text-text font-medium'
                  : 'border-transparent text-muted hover:text-text'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet context={{ projectId: id }} />
    </div>
  )
}

// Shared hook for sub-pages to read the active project id.
export function useProjectId() {
  return useOutletContext().projectId
}
