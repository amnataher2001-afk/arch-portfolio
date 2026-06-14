import { useNavigate } from 'react-router-dom'
import { usePortfolioStore } from '../store/usePortfolioStore'
import PageHeader from '../components/PageHeader'
import ProjectCard from '../components/ProjectCard'

export default function Projects() {
  const projects = usePortfolioStore((s) => s.projects)
  const addProject = usePortfolioStore((s) => s.addProject)
  const navigate = useNavigate()

  const handleAdd = () => {
    const id = addProject('Untitled Project')
    navigate(`/projects/${id}`)
  }

  return (
    <div>
      <PageHeader
        eyebrow="02 — Work"
        title="Projects"
        description="Your portfolio's core. Add as many projects as you like — each one holds Overview, Concept, Plans, Elevations, Sections and Shots."
        action={
          <button onClick={handleAdd} className="btn-accent">
            ＋ New Project
          </button>
        }
      />

      {projects.length === 0 ? (
        <div className="card flex flex-col items-center justify-center px-8 py-24 text-center">
          <div className="mb-4 text-4xl text-accent">▲</div>
          <p className="font-display text-2xl">No projects yet</p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Start your first project to begin building out drawings, concepts and
            renders.
          </p>
          <button onClick={handleAdd} className="btn-accent mt-6">
            ＋ Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  )
}
