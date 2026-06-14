// Geometry helpers for design elements. No React / store imports so this can be
// shared by the store, the renderer, and the Style Panel without import cycles.

// Sensible default width/height (px, at natural page scale) per element type.
export function defaultDims(kind, variant) {
  if (kind === 'line') {
    if (variant === 'vertical') return { w: 8, h: 180 }
    if (variant === 'diagonal') return { w: 140, h: 140 }
    if (variant === 'double') return { w: 180, h: 16 }
    return { w: 180, h: 8 } // horizontal / dotted / dashed
  }
  if (variant === 'rectangle') return { w: 170, h: 105 }
  if (variant === 'hexagon') return { w: 140, h: 122 }
  return { w: 120, h: 120 } // circle / square / triangle / diamond
}

// Effective width/height for an element, migrating legacy elements that only
// stored a single `size`.
export function elementDims(el) {
  if (el.w != null && el.h != null) return { w: el.w, h: el.h }
  if (el.size != null) {
    const s = el.size
    if (el.kind === 'line') {
      if (el.variant === 'vertical') return { w: 8, h: s }
      if (el.variant === 'diagonal') return { w: s, h: s }
      if (el.variant === 'double') return { w: s, h: Math.max(16, Math.round(s * 0.13)) }
      return { w: s, h: 8 }
    }
    if (el.variant === 'rectangle') return { w: s, h: Math.round(s * 0.62) }
    if (el.variant === 'hexagon') return { w: s, h: Math.round(s * 0.9) }
    return { w: s, h: s }
  }
  return defaultDims(el.kind, el.variant)
}
