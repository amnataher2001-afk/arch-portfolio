import { useEffect, useState } from 'react'
import { usePortfolioStore } from '../store/usePortfolioStore'
import {
  HEADING_FONTS,
  BODY_FONTS,
  FONT_SCALES,
  COLOR_THEMES,
} from '../utils/themes'
import { getPageDescriptors } from '../utils/portfolioPages'
import {
  ElementGlyph,
  SHAPE_VARIANTS,
  LINE_VARIANTS,
} from './DesignElement'
import { defaultDims, elementDims } from '../utils/elementGeometry'

export default function StylePanel() {
  const [open, setOpen] = useState(false)
  const {
    settings,
    updateSettings,
    setColorTheme,
    toggleTheme,
    studentInfo,
    aboutMe,
    skills,
    cv,
    projects,
    builder,
    designElements,
    activePage,
    setActivePage,
    addElement,
    updateElement,
    removeElement,
    selectedElementId,
  } = usePortfolioStore()

  const pageDescriptors = getPageDescriptors({
    studentInfo,
    aboutMe,
    skills,
    cv,
    projects,
    builder,
  })

  // Keep the target page valid as pages appear/disappear.
  useEffect(() => {
    if (
      pageDescriptors.length &&
      !pageDescriptors.some((d) => d.key === activePage)
    ) {
      setActivePage(pageDescriptors[0].key)
    }
  }, [pageDescriptors, activePage, setActivePage])

  // Find the currently selected element across all pages.
  let selectedEl = null
  for (const list of Object.values(designElements)) {
    const found = list.find((e) => e.id === selectedElementId)
    if (found) {
      selectedEl = found
      break
    }
  }

  const defaultColor = COLOR_THEMES[settings.colorTheme]?.accent || '#1a1a1a'
  const addEl = (kind, variant) =>
    addElement({ kind, variant, color: defaultColor })

  // Scale a variant's default dims down to a ~24px palette icon.
  const glyphDims = (kind, variant) => {
    const d = defaultDims(kind, variant)
    const k = 24 / Math.max(d.w, d.h)
    return { width: Math.max(2, Math.round(d.w * k)), height: Math.max(2, Math.round(d.h * k)) }
  }

  // Set width/height from the panel inputs, respecting the aspect lock.
  const setDim = (axis, raw) => {
    if (!selectedEl) return
    const val = Math.max(10, Math.min(4000, Math.round(Number(raw) || 0)))
    const d = elementDims(selectedEl)
    let nw = d.w
    let nh = d.h
    if (axis === 'w') nw = val
    else nh = val
    if (selectedEl.locked) {
      const aspect = d.w / d.h
      if (axis === 'w') nh = Math.round(val / aspect)
      else nw = Math.round(val * aspect)
    }
    updateElement(selectedEl.id, { w: nw, h: nh })
  }

  return (
    <>
      {/* Floating gear button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Customize appearance"
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-[#1a1a1a] shadow-lg transition hover:scale-105 active:scale-95"
      >
        <span className={`text-xl transition-transform ${open ? 'rotate-90' : ''}`}>
          ⚙
        </span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-80 max-w-[calc(100vw-3rem)] origin-bottom-right rounded-sm border border-border bg-surface shadow-2xl transition-all ${
          open
            ? 'pointer-events-auto scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="font-display text-xl">Appearance</h3>
          <button
            onClick={() => setOpen(false)}
            className="text-muted hover:text-accent"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto p-5">
          {/* Mode */}
          <div>
            <span className="label-field">Mode</span>
            <div className="flex gap-2">
              {['light', 'dark'].map((m) => (
                <button
                  key={m}
                  onClick={() => settings.theme !== m && toggleTheme()}
                  className={`flex-1 rounded-sm border px-3 py-2 text-sm capitalize transition ${
                    settings.theme === m
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-muted hover:border-accent'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Color theme */}
          <div>
            <span className="label-field">Color Theme</span>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(COLOR_THEMES).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setColorTheme(key)}
                  className={`flex items-center gap-2 rounded-sm border px-3 py-2 text-left text-xs transition ${
                    settings.colorTheme === key
                      ? 'border-accent'
                      : 'border-border hover:border-accent/60'
                  }`}
                >
                  <span
                    className="h-4 w-4 flex-shrink-0 rounded-full border border-black/10"
                    style={{ background: t.swatch }}
                  />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Heading font */}
          <div>
            <span className="label-field">Heading Font</span>
            <select
              className="input-field"
              value={settings.fontDisplay}
              onChange={(e) => updateSettings({ fontDisplay: e.target.value })}
              style={{ fontFamily: settings.fontDisplay }}
            >
              {HEADING_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Body font */}
          <div>
            <span className="label-field">Body Font</span>
            <select
              className="input-field"
              value={settings.fontBody}
              onChange={(e) => updateSettings({ fontBody: e.target.value })}
            >
              {BODY_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font scale */}
          <div>
            <span className="label-field">Font Size</span>
            <div className="flex gap-2">
              {FONT_SCALES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => updateSettings({ fontScale: s.value })}
                  className={`flex-1 rounded-sm border px-3 py-2 text-sm transition ${
                    settings.fontScale === s.value
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-muted hover:border-accent'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Design elements */}
          <div className="border-t border-border pt-5">
            <span className="label-field">Design Elements</span>

            {/* Target page */}
            <select
              className="input-field mb-3"
              value={activePage}
              onChange={(e) => setActivePage(e.target.value)}
            >
              {pageDescriptors.map((d) => (
                <option key={d.key} value={d.key}>
                  Add to: {d.label}
                </option>
              ))}
            </select>

            {/* Shapes */}
            <p className="mb-1 text-[11px] text-muted">Shapes</p>
            <div className="mb-3 grid grid-cols-3 gap-2">
              {SHAPE_VARIANTS.map((v) => (
                <button
                  key={v}
                  onClick={() => addEl('shape', v)}
                  title={`Add ${v}`}
                  className="flex h-12 items-center justify-center rounded-sm border border-border text-text transition hover:border-accent hover:text-accent"
                >
                  <ElementGlyph kind="shape" variant={v} color="currentColor" {...glyphDims('shape', v)} />
                </button>
              ))}
            </div>

            {/* Lines */}
            <p className="mb-1 text-[11px] text-muted">Lines</p>
            <div className="grid grid-cols-3 gap-2">
              {LINE_VARIANTS.map((v) => (
                <button
                  key={v}
                  onClick={() => addEl('line', v)}
                  title={`Add ${v} line`}
                  className="flex h-12 items-center justify-center rounded-sm border border-border text-text transition hover:border-accent hover:text-accent"
                >
                  <ElementGlyph kind="line" variant={v} color="currentColor" {...glyphDims('line', v)} />
                </button>
              ))}
            </div>

            <p className="mt-2 text-[11px] text-muted">
              Elements appear on the Portfolio Builder pages — drag to move,
              click to select.
            </p>

            {/* Selected element controls */}
            {selectedEl && (
              <div className="mt-4 space-y-3 rounded-sm border border-accent/40 bg-accent/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium capitalize">
                    {selectedEl.variant} {selectedEl.kind}
                  </span>
                  <button
                    onClick={() => removeElement(selectedEl.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>

                {/* Width / height with aspect lock */}
                <div className="flex items-end gap-2">
                  <label className="flex-1">
                    <span className="mb-1 block text-[11px] text-muted">W</span>
                    <input
                      type="number"
                      min="10"
                      value={Math.round(elementDims(selectedEl).w)}
                      onChange={(e) => setDim('w', e.target.value)}
                      className="input-field"
                    />
                  </label>
                  <button
                    onClick={() =>
                      updateElement(selectedEl.id, { locked: !selectedEl.locked })
                    }
                    title={
                      selectedEl.locked
                        ? 'Unlock aspect ratio'
                        : 'Lock aspect ratio'
                    }
                    className={`mb-px flex h-[42px] w-10 flex-shrink-0 items-center justify-center rounded-sm border text-sm transition ${
                      selectedEl.locked
                        ? 'border-accent text-accent'
                        : 'border-border text-muted hover:border-accent'
                    }`}
                  >
                    {selectedEl.locked ? '🔒' : '🔓'}
                  </button>
                  <label className="flex-1">
                    <span className="mb-1 block text-[11px] text-muted">H</span>
                    <input
                      type="number"
                      min="10"
                      value={Math.round(elementDims(selectedEl).h)}
                      onChange={(e) => setDim('h', e.target.value)}
                      className="input-field"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1 flex justify-between text-[11px] text-muted">
                    <span>Opacity</span>
                    <span>{Math.round(selectedEl.opacity * 100)}%</span>
                  </span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={selectedEl.opacity}
                    onChange={(e) =>
                      updateElement(selectedEl.id, {
                        opacity: Number(e.target.value),
                      })
                    }
                    className="w-full accent-[rgb(var(--color-accent))]"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-[11px] text-muted">Color</span>
                  <input
                    type="color"
                    value={selectedEl.color}
                    onChange={(e) =>
                      updateElement(selectedEl.id, { color: e.target.value })
                    }
                    className="h-8 w-12 cursor-pointer rounded-sm border border-border bg-surface"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
