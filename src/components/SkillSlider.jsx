const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

/**
 * A single skill row: name input + proficiency slider (0–3) + remove button.
 *
 * props:
 *  - skill: { id, name, level }
 *  - onChange: (patch) => void
 *  - onRemove: () => void
 *  - placeholder: input placeholder
 */
export default function SkillSlider({ skill, onChange, onRemove, placeholder }) {
  const level = Number(skill.level ?? 1)

  return (
    <div className="group grid grid-cols-1 gap-3 rounded-sm border border-border bg-surface p-4 sm:grid-cols-[1fr_1.2fr_auto] sm:items-center">
      <input
        className="input-field"
        value={skill.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder={placeholder || 'Skill name'}
      />

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider2 text-muted">
            Proficiency
          </span>
          <span className="text-xs font-medium text-accent">{LEVELS[level]}</span>
        </div>
        <input
          type="range"
          min="0"
          max="3"
          step="1"
          value={level}
          onChange={(e) => onChange({ level: Number(e.target.value) })}
          className="w-full accent-[rgb(var(--color-accent))] cursor-pointer"
        />
        <div className="mt-1 flex justify-between text-[9px] uppercase tracking-wide text-muted/60">
          {LEVELS.map((l) => (
            <span key={l}>{l[0]}</span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove skill"
        className="justify-self-start text-muted hover:text-accent sm:justify-self-center transition"
        title="Remove"
      >
        ✕
      </button>
    </div>
  )
}

export { LEVELS }
