import { usePortfolioStore } from '../../store/usePortfolioStore'
import MediaUploader from '../../components/MediaUploader'
import { useProjectId } from './ProjectDetail'

export default function ProjectConcept() {
  const projectId = useProjectId()
  const project = usePortfolioStore((s) =>
    s.projects.find((p) => p.id === projectId)
  )
  const {
    updateProjectSection,
    addListItem,
    updateListItem,
    removeListItem,
  } = usePortfolioStore()
  if (!project) return null
  const c = project.concept

  return (
    <div className="space-y-10">
      {/* Title + description */}
      <div className="grid grid-cols-1 gap-5">
        <label className="block">
          <span className="label-field">Concept Title</span>
          <input
            className="input-field"
            value={c.title}
            onChange={(e) =>
              updateProjectSection(projectId, 'concept', { title: e.target.value })
            }
            placeholder="e.g. Folding the Landscape"
          />
        </label>
        <label className="block">
          <span className="label-field">Concept Description</span>
          <textarea
            className="textarea-field min-h-[160px]"
            value={c.description}
            onChange={(e) =>
              updateProjectSection(projectId, 'concept', {
                description: e.target.value,
              })
            }
            placeholder="Explain the driving idea behind the design…"
          />
        </label>
      </div>

      {/* Concept images with captions */}
      <section>
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <h4 className="font-display text-xl">
            Concept Images{' '}
            <span className="text-base text-muted">({c.images.length})</span>
          </h4>
          <button
            onClick={() => addListItem(projectId, 'concept', 'images', { media: null, caption: '' })}
            className="btn-ghost text-xs"
          >
            ＋ Add image
          </button>
        </div>
        {c.images.length === 0 ? (
          <p className="rounded-sm border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            Add concept images, each with its own caption.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {c.images.map((img) => (
              <div key={img.id} className="relative rounded-sm border border-border bg-surface p-4">
                <button
                  onClick={() => removeListItem(projectId, 'concept', 'images', img.id)}
                  className="absolute right-2 top-2 z-10 text-muted hover:text-accent"
                  title="Remove"
                >
                  ✕
                </button>
                <MediaUploader
                  value={img.media}
                  onChange={(media) => updateListItem(projectId, 'concept', 'images', img.id, { media })}
                />
                <input
                  className="input-field mt-3 text-sm"
                  value={img.caption}
                  onChange={(e) => updateListItem(projectId, 'concept', 'images', img.id, { caption: e.target.value })}
                  placeholder="Caption…"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Concept diagrams (image / PDF) */}
      <section>
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <h4 className="font-display text-xl">
            Concept Diagrams{' '}
            <span className="text-base text-muted">({c.diagrams.length})</span>
          </h4>
          <button
            onClick={() => addListItem(projectId, 'concept', 'diagrams', { media: null, caption: '' })}
            className="btn-ghost text-xs"
          >
            ＋ Add diagram
          </button>
        </div>
        {c.diagrams.length === 0 ? (
          <p className="rounded-sm border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            Upload diagrams as images or PDFs.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {c.diagrams.map((d) => (
              <div key={d.id} className="relative rounded-sm border border-border bg-surface p-4">
                <button
                  onClick={() => removeListItem(projectId, 'concept', 'diagrams', d.id)}
                  className="absolute right-2 top-2 z-10 text-muted hover:text-accent"
                  title="Remove"
                >
                  ✕
                </button>
                <MediaUploader
                  value={d.media}
                  onChange={(media) => updateListItem(projectId, 'concept', 'diagrams', d.id, { media })}
                />
                <input
                  className="input-field mt-3 text-sm"
                  value={d.caption}
                  onChange={(e) => updateListItem(projectId, 'concept', 'diagrams', d.id, { caption: e.target.value })}
                  placeholder="Caption…"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
