import { usePortfolioStore } from '../store/usePortfolioStore'
import PageHeader from '../components/PageHeader'
import SkillSlider from '../components/SkillSlider'

const CATEGORIES = [
  {
    key: 'software',
    title: 'Software Skills',
    hint: 'AutoCAD, Revit, SketchUp, Rhino, Lumion, Photoshop, Grasshopper…',
    placeholder: 'e.g. Revit',
  },
  {
    key: 'design',
    title: 'Design Skills',
    hint: 'Sketching, modeling, parametric design, detailing…',
    placeholder: 'e.g. Hand sketching',
  },
  {
    key: 'languages',
    title: 'Languages',
    hint: 'Arabic, English, French…',
    placeholder: 'e.g. English',
  },
  {
    key: 'other',
    title: 'Other',
    hint: 'Project management, presentation, photography…',
    placeholder: 'e.g. Public speaking',
  },
]

function Category({ def }) {
  const { skills, addSkill, updateSkill, removeSkill } = usePortfolioStore()
  const list = skills[def.key] || []

  return (
    <section className="card p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl">{def.title}</h3>
          <p className="mt-1 text-xs text-muted">{def.hint}</p>
        </div>
        <button onClick={() => addSkill(def.key)} className="btn-ghost text-xs">
          ＋ Add
        </button>
      </div>

      {list.length === 0 ? (
        <p className="rounded-sm border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          No skills yet — click “Add” to create one.
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((skill) => (
            <SkillSlider
              key={skill.id}
              skill={skill}
              placeholder={def.placeholder}
              onChange={(patch) => updateSkill(def.key, skill.id, patch)}
              onRemove={() => removeSkill(def.key, skill.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default function Skills() {
  return (
    <div>
      <PageHeader
        eyebrow="01 — Profile"
        title="Skills"
        description="Group your abilities by category and set a proficiency level for each. Add or remove skills freely."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {CATEGORIES.map((def) => (
          <Category key={def.key} def={def} />
        ))}
      </div>
    </div>
  )
}
