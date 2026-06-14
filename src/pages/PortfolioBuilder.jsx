import { useState } from 'react'
import { usePortfolioStore } from '../store/usePortfolioStore'
import PageHeader from '../components/PageHeader'
import PortfolioPages from '../components/PortfolioPages'
import {
  HEADING_FONTS,
  BODY_FONTS,
  COLOR_THEMES,
} from '../utils/themes'

const SECTION_LABELS = {
  cover: 'Cover Page',
  about: 'About Me',
  skills: 'Skills',
  cv: 'CV / Résumé',
  projects: 'Projects',
}

// 5 architectural font pairs for the quick picker.
const FONT_PAIRS = [
  { label: 'Editorial', display: HEADING_FONTS[0].value, body: BODY_FONTS[0].value },
  { label: 'Classic', display: HEADING_FONTS[1].value, body: BODY_FONTS[1].value },
  { label: 'Literary', display: HEADING_FONTS[2].value, body: BODY_FONTS[0].value },
  { label: 'Modern', display: HEADING_FONTS[3].value, body: BODY_FONTS[2].value },
  { label: 'Minimal', display: HEADING_FONTS[4].value, body: BODY_FONTS[1].value },
]

export default function PortfolioBuilder() {
  const {
    builder,
    toggleSection,
    moveSection,
    reorderSections,
    settings,
    updateSettings,
    setColorTheme,
  } = usePortfolioStore()
  const [dragKey, setDragKey] = useState(null)

  const handleDrop = (targetKey) => {
    if (!dragKey || dragKey === targetKey) return
    const order = [...builder.order]
    const from = order.indexOf(dragKey)
    const to = order.indexOf(targetKey)
    order.splice(from, 1)
    order.splice(to, 0, dragKey)
    reorderSections(order)
    setDragKey(null)
  }

  return (
    <div>
      <PageHeader
        eyebrow="03 — Studio"
        title="Portfolio Builder"
        description="Arrange your portfolio, choose a type style, and preview the generated pages before exporting."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
        {/* Controls */}
        <div className="space-y-8">
          {/* Section order + visibility */}
          <div>
            <h3 className="mb-3 font-display text-xl">Sections</h3>
            <p className="mb-3 text-xs text-muted">
              Drag to reorder, or use arrows. Toggle the dot to show/hide.
            </p>
            <ul className="space-y-2">
              {builder.order.map((key) => {
                const hidden = builder.hidden.includes(key)
                return (
                  <li
                    key={key}
                    draggable
                    onDragStart={() => setDragKey(key)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(key)}
                    className={`flex items-center gap-3 rounded-sm border border-border bg-surface px-3 py-2 ${
                      dragKey === key ? 'opacity-50' : ''
                    }`}
                  >
                    <span className="cursor-grab text-muted">⠿</span>
                    <button
                      onClick={() => toggleSection(key)}
                      title={hidden ? 'Show' : 'Hide'}
                      className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                        hidden ? 'bg-border' : 'bg-accent'
                      }`}
                    />
                    <span
                      className={`flex-1 text-sm ${hidden ? 'text-muted line-through' : ''}`}
                    >
                      {SECTION_LABELS[key]}
                    </span>
                    <div className="flex gap-1 text-muted">
                      <button onClick={() => moveSection(key, -1)} className="hover:text-accent">
                        ↑
                      </button>
                      <button onClick={() => moveSection(key, 1)} className="hover:text-accent">
                        ↓
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Font pairs */}
          <div>
            <h3 className="mb-3 font-display text-xl">Type Style</h3>
            <div className="space-y-2">
              {FONT_PAIRS.map((pair) => {
                const active =
                  settings.fontDisplay === pair.display &&
                  settings.fontBody === pair.body
                return (
                  <button
                    key={pair.label}
                    onClick={() =>
                      updateSettings({ fontDisplay: pair.display, fontBody: pair.body })
                    }
                    className={`w-full rounded-sm border px-4 py-3 text-left transition ${
                      active ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/60'
                    }`}
                  >
                    <span
                      className="block text-lg"
                      style={{ fontFamily: pair.display }}
                    >
                      {pair.label}
                    </span>
                    <span className="text-xs text-muted">
                      Aa — the quick brown fox
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color themes */}
          <div>
            <h3 className="mb-3 font-display text-xl">Color Theme</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(COLOR_THEMES).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setColorTheme(key)}
                  className={`flex items-center gap-2 rounded-sm border px-3 py-2 text-xs transition ${
                    settings.colorTheme === key
                      ? 'border-accent'
                      : 'border-border hover:border-accent/60'
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-black/10"
                    style={{ background: t.swatch }}
                  />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-xl">Preview</h3>
            <span className="text-xs text-muted">Scaled to fit</span>
          </div>
          <div className="overflow-hidden rounded-sm border border-border bg-surface-alt/40 p-6">
            <div
              className="origin-top"
              style={{ transform: 'scale(0.62)', width: '794px', marginInline: 'auto' }}
            >
              <PortfolioPages interactive />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
