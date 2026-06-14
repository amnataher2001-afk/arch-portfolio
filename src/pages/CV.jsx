import { usePortfolioStore } from '../store/usePortfolioStore'
import PageHeader from '../components/PageHeader'

/* Each CV section declares its fields. `type:'area'` renders a textarea. */
const SECTIONS = [
  {
    key: 'education',
    title: 'Education',
    addLabel: 'Add education',
    fields: [
      { key: 'degree', label: 'Degree', span: 2, placeholder: 'B.Sc. Architecture' },
      { key: 'university', label: 'University', span: 2, placeholder: 'Cairo University' },
      { key: 'year', label: 'Year', span: 1, placeholder: '2021 – 2026' },
    ],
  },
  {
    key: 'experience',
    title: 'Experience',
    addLabel: 'Add experience',
    fields: [
      { key: 'title', label: 'Title', span: 2, placeholder: 'Architecture Intern' },
      { key: 'place', label: 'Place', span: 2, placeholder: 'Studio / Firm' },
      { key: 'year', label: 'Year', span: 1, placeholder: 'Summer 2024' },
      { key: 'description', label: 'Description', span: 5, type: 'area', placeholder: 'What you worked on…' },
    ],
  },
  {
    key: 'awards',
    title: 'Awards & Achievements',
    addLabel: 'Add award',
    fields: [
      { key: 'title', label: 'Award', span: 3, placeholder: 'Best Graduation Project' },
      { key: 'year', label: 'Year', span: 2, placeholder: '2025' },
      { key: 'description', label: 'Details', span: 5, type: 'area', placeholder: 'Issuing body, context…' },
    ],
  },
  {
    key: 'publications',
    title: 'Publications / Research',
    addLabel: 'Add publication',
    fields: [
      { key: 'title', label: 'Title', span: 3, placeholder: 'Paper / research title' },
      { key: 'year', label: 'Year', span: 2, placeholder: '2025' },
      { key: 'description', label: 'Details', span: 5, type: 'area', placeholder: 'Journal, conference, summary…' },
    ],
  },
  {
    key: 'volunteer',
    title: 'Volunteer Work',
    addLabel: 'Add volunteer work',
    fields: [
      { key: 'title', label: 'Role', span: 2, placeholder: 'Volunteer / Organizer' },
      { key: 'place', label: 'Organization', span: 2, placeholder: 'NGO / Initiative' },
      { key: 'year', label: 'Year', span: 1, placeholder: '2023' },
      { key: 'description', label: 'Description', span: 5, type: 'area', placeholder: 'What you did…' },
    ],
  },
]

const spanCls = {
  1: 'sm:col-span-1',
  2: 'sm:col-span-2',
  3: 'sm:col-span-3',
  5: 'sm:col-span-5',
}

function Entry({ section, item }) {
  const { updateCVItem, removeCVItem } = usePortfolioStore()
  const set = (field) => (e) =>
    updateCVItem(section.key, item.id, { [field]: e.target.value })

  return (
    <div className="relative rounded-sm border border-border bg-surface p-5">
      <button
        type="button"
        onClick={() => removeCVItem(section.key, item.id)}
        className="absolute right-3 top-3 text-muted hover:text-accent transition"
        title="Remove entry"
      >
        ✕
      </button>
      <div className="grid grid-cols-1 gap-4 pr-6 sm:grid-cols-5">
        {section.fields.map((f) => (
          <label key={f.key} className={`block ${spanCls[f.span] || ''}`}>
            <span className="label-field">{f.label}</span>
            {f.type === 'area' ? (
              <textarea
                className="textarea-field min-h-[80px]"
                value={item[f.key] || ''}
                onChange={set(f.key)}
                placeholder={f.placeholder}
              />
            ) : (
              <input
                className="input-field"
                value={item[f.key] || ''}
                onChange={set(f.key)}
                placeholder={f.placeholder}
              />
            )}
          </label>
        ))}
      </div>
    </div>
  )
}

function Section({ section }) {
  const { cv, addCVItem } = usePortfolioStore()
  const list = cv[section.key] || []

  return (
    <section>
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-display text-2xl">{section.title}</h3>
        <button
          onClick={() => addCVItem(section.key)}
          className="btn-ghost text-xs"
        >
          ＋ {section.addLabel}
        </button>
      </div>

      {list.length === 0 ? (
        <p className="rounded-sm border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
          Nothing here yet.
        </p>
      ) : (
        <div className="space-y-4">
          {list.map((item) => (
            <Entry key={item.id} section={section} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}

export default function CV() {
  return (
    <div>
      <PageHeader
        eyebrow="01 — Profile"
        title="CV / Resume"
        description="Build out your résumé section by section. Every entry can be added, edited, or removed — and saves automatically."
      />
      <div className="space-y-12">
        {SECTIONS.map((section) => (
          <Section key={section.key} section={section} />
        ))}
      </div>
    </div>
  )
}
