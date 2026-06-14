import { usePortfolioStore } from '../store/usePortfolioStore'
import MediaUploader from './MediaUploader'

/**
 * Generic editor for a project sub-section that has:
 *  - a general description, and
 *  - an unlimited, add/removable list of items (name + description + image/PDF).
 *
 * Used by Plans, Elevations, Sections and Shots.
 *
 * props:
 *  - projectId
 *  - section: 'plans' | 'elevations' | 'sections' | 'shots'
 *  - itemNoun: 'Plan' | 'Elevation' | ...
 *  - descriptionLabel, descriptionPlaceholder, namePlaceholder
 *  - withCategory: boolean (Shots → Interior / Exterior label)
 */
export default function MediaSection({
  projectId,
  section,
  itemNoun,
  descriptionLabel,
  descriptionPlaceholder,
  namePlaceholder,
  withCategory = false,
}) {
  const project = usePortfolioStore((s) =>
    s.projects.find((p) => p.id === projectId)
  )
  const { updateProjectSection, addListItem, updateListItem, removeListItem } =
    usePortfolioStore()

  if (!project) return null
  const data = project[section]

  return (
    <div className="space-y-8">
      {/* General description */}
      <div>
        <span className="label-field">{descriptionLabel}</span>
        <textarea
          className="textarea-field"
          value={data.description}
          onChange={(e) =>
            updateProjectSection(projectId, section, {
              description: e.target.value,
            })
          }
          placeholder={descriptionPlaceholder}
        />
      </div>

      {/* Items */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h4 className="font-display text-xl">
          {itemNoun}s{' '}
          <span className="text-base text-muted">({data.items.length})</span>
        </h4>
        <button
          onClick={() =>
            addListItem(projectId, section, 'items', {
              name: '',
              description: '',
              category: withCategory ? 'Exterior' : undefined,
              media: null,
            })
          }
          className="btn-ghost text-xs"
        >
          ＋ Add {itemNoun}
        </button>
      </div>

      {data.items.length === 0 ? (
        <p className="rounded-sm border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          No {itemNoun.toLowerCase()}s yet. Add as many as you need — uploads
          accept images or PDFs.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {data.items.map((item, i) => (
            <div
              key={item.id}
              className="relative rounded-sm border border-border bg-surface p-5"
            >
              <button
                onClick={() => removeListItem(projectId, section, 'items', item.id)}
                className="absolute right-3 top-3 text-muted transition hover:text-accent"
                title="Remove"
              >
                ✕
              </button>
              <p className="mb-3 text-[11px] uppercase tracking-wider2 text-muted/70">
                {itemNoun} {String(i + 1).padStart(2, '0')}
              </p>

              <MediaUploader
                value={item.media}
                onChange={(media) =>
                  updateListItem(projectId, section, 'items', item.id, { media })
                }
              />

              <div className="mt-4 space-y-3">
                <input
                  className="input-field"
                  value={item.name}
                  onChange={(e) =>
                    updateListItem(projectId, section, 'items', item.id, {
                      name: e.target.value,
                    })
                  }
                  placeholder={namePlaceholder}
                />

                {withCategory && (
                  <div className="flex gap-2">
                    {['Interior', 'Exterior'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          updateListItem(projectId, section, 'items', item.id, {
                            category: cat,
                          })
                        }
                        className={`flex-1 rounded-sm border px-3 py-2 text-xs uppercase tracking-wider2 transition ${
                          item.category === cat
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border text-muted hover:border-accent'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                <textarea
                  className="textarea-field min-h-[70px]"
                  value={item.description}
                  onChange={(e) =>
                    updateListItem(projectId, section, 'items', item.id, {
                      description: e.target.value,
                    })
                  }
                  placeholder={`${itemNoun} description…`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
