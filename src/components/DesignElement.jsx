import { useRef, useState } from 'react'
import { usePortfolioStore } from '../store/usePortfolioStore'
import { elementDims } from '../utils/elementGeometry'

export const SHAPE_VARIANTS = [
  'circle',
  'square',
  'rectangle',
  'triangle',
  'diamond',
  'hexagon',
]

export const LINE_VARIANTS = [
  'horizontal',
  'vertical',
  'diagonal',
  'double',
  'dotted',
  'dashed',
]

const PAGE_W = 794 // natural page width (matches PortfolioPages)

/**
 * Pure SVG drawing of a shape or line that fills the given width × height box
 * (preserveAspectRatio="none" so shapes stretch like Figma). Reused for the
 * on-page overlays AND the palette icons in the Style Panel.
 */
export function ElementGlyph({ kind, variant, color = '#1a1a1a', width = 100, height = 100 }) {
  const w = Math.max(1, width)
  const h = Math.max(1, height)

  if (kind === 'shape') {
    let node
    switch (variant) {
      case 'circle':
        node = <ellipse cx={w / 2} cy={h / 2} rx={Math.max(0, w / 2 - 1)} ry={Math.max(0, h / 2 - 1)} />
        break
      case 'triangle':
        node = <polygon points={`${w / 2},1 ${w - 1},${h - 1} 1,${h - 1}`} />
        break
      case 'diamond':
        node = <polygon points={`${w / 2},1 ${w - 1},${h / 2} ${w / 2},${h - 1} 1,${h / 2}`} />
        break
      case 'hexagon': {
        const q = w * 0.25
        node = (
          <polygon
            points={`${q},1 ${w - q},1 ${w - 1},${h / 2} ${w - q},${h - 1} ${q},${h - 1} 1,${h / 2}`}
          />
        )
        break
      }
      case 'rectangle':
      case 'square':
      default:
        node = <rect x="1" y="1" width={Math.max(0, w - 2)} height={Math.max(0, h - 2)} />
    }
    return (
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
      >
        {node}
      </svg>
    )
  }

  // Lines — thickness follows the box (so vertical handles change weight).
  const common = { stroke: color, strokeLinecap: 'round' }
  let node
  switch (variant) {
    case 'vertical':
      node = <line x1={w / 2} y1="1" x2={w / 2} y2={h - 1} {...common} strokeWidth={Math.max(1, w)} />
      break
    case 'diagonal': {
      const t = Math.max(2, Math.min(w, h) * 0.12)
      node = <line x1="1" y1={h - 1} x2={w - 1} y2="1" {...common} strokeWidth={t} />
      break
    }
    case 'double': {
      const t = Math.max(1, h / 4)
      node = (
        <>
          <line x1="1" y1={h * 0.33} x2={w - 1} y2={h * 0.33} {...common} strokeWidth={t} />
          <line x1="1" y1={h * 0.67} x2={w - 1} y2={h * 0.67} {...common} strokeWidth={t} />
        </>
      )
      break
    }
    case 'dotted':
      node = (
        <line
          x1="1"
          y1={h / 2}
          x2={w - 1}
          y2={h / 2}
          {...common}
          strokeWidth={Math.max(1, h)}
          strokeDasharray={`0.1 ${Math.max(2, h * 1.6)}`}
        />
      )
      break
    case 'dashed':
      node = (
        <line
          x1="1"
          y1={h / 2}
          x2={w - 1}
          y2={h / 2}
          stroke={color}
          strokeWidth={Math.max(1, h)}
          strokeLinecap="butt"
          strokeDasharray={`${Math.max(4, h * 2)} ${Math.max(3, h * 1.5)}`}
        />
      )
      break
    case 'horizontal':
    default:
      node = <line x1="1" y1={h / 2} x2={w - 1} y2={h / 2} {...common} strokeWidth={Math.max(1, h)} />
  }

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {node}
    </svg>
  )
}

// 8 handles: [name, leftPct, topPct, cursor]
const HANDLES = [
  ['nw', 0, 0, 'nwse'],
  ['n', 50, 0, 'ns'],
  ['ne', 100, 0, 'nesw'],
  ['e', 100, 50, 'ew'],
  ['se', 100, 100, 'nwse'],
  ['s', 50, 100, 'ns'],
  ['sw', 0, 100, 'nesw'],
  ['w', 0, 50, 'ew'],
]

const MIN_SIZE = 16

/**
 * A single positioned overlay element. Draggable to move, with a Figma-style
 * bounding box + 8 resize handles when selected. Position (x, y) is a % of the
 * page; size (w, h) is px at natural page scale.
 */
export default function DesignElement({ element, interactive }) {
  const updateElement = usePortfolioStore((s) => s.updateElement)
  const removeElement = usePortfolioStore((s) => s.removeElement)
  const selectElement = usePortfolioStore((s) => s.selectElement)
  const selectedElementId = usePortfolioStore((s) => s.selectedElementId)
  const ref = useRef(null)
  const moveRef = useRef(false)
  const resizeRef = useRef(null)
  const [grabbing, setGrabbing] = useState(false)

  const selected = interactive && selectedElementId === element.id
  const { w, h } = elementDims(element)

  // Convert a page element + pointer into natural-px geometry.
  function pageGeo() {
    const page = ref.current?.closest('.portfolio-page')
    if (!page) return null
    const rect = page.getBoundingClientRect()
    const scale = rect.width / PAGE_W
    const naturalH = rect.height / scale
    return { rect, scale, naturalH }
  }

  /* ---- move (drag body) ---- */
  function onPointerDown(e) {
    if (!interactive) return
    e.stopPropagation()
    selectElement(element.id)
    moveRef.current = true
    setGrabbing(true)
    try {
      ref.current.setPointerCapture(e.pointerId)
    } catch {
      /* noop */
    }
  }
  function onPointerMove(e) {
    if (!moveRef.current) return
    const g = pageGeo()
    if (!g) return
    const x = Math.min(100, Math.max(0, ((e.clientX - g.rect.left) / g.rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((e.clientY - g.rect.top) / g.rect.height) * 100))
    updateElement(element.id, { x, y })
  }
  function onPointerUp(e) {
    moveRef.current = false
    setGrabbing(false)
    try {
      ref.current.releasePointerCapture(e.pointerId)
    } catch {
      /* noop */
    }
  }

  /* ---- resize (drag handle) ---- */
  function onHandleDown(handle, e) {
    e.stopPropagation()
    e.preventDefault()
    selectElement(element.id)
    const g = pageGeo()
    if (!g) return
    const cx = (element.x / 100) * PAGE_W
    const cy = (element.y / 100) * g.naturalH
    resizeRef.current = {
      handle,
      ...g,
      L: cx - w / 2,
      T: cy - h / 2,
      R: cx + w / 2,
      B: cy + h / 2,
      aspect: w / h,
    }
    try {
      e.target.setPointerCapture(e.pointerId)
    } catch {
      /* noop */
    }
  }
  function onHandleMove(e) {
    const st = resizeRef.current
    if (!st) return
    const nx = (e.clientX - st.rect.left) / st.scale
    const ny = (e.clientY - st.rect.top) / st.scale
    let { L, T, R, B } = st
    const hnd = st.handle
    if (hnd.includes('e')) R = Math.max(L + MIN_SIZE, nx)
    if (hnd.includes('w')) L = Math.min(R - MIN_SIZE, nx)
    if (hnd.includes('s')) B = Math.max(T + MIN_SIZE, ny)
    if (hnd.includes('n')) T = Math.min(B - MIN_SIZE, ny)

    let nw = R - L
    let nh = B - T

    if (element.locked) {
      const horiz = hnd.includes('e') || hnd.includes('w')
      const vert = hnd.includes('n') || hnd.includes('s')
      if (horiz && vert) {
        nh = nw / st.aspect
        if (hnd.includes('n')) T = B - nh
        else B = T + nh
      } else if (horiz) {
        nh = nw / st.aspect
        const cy = (st.T + st.B) / 2
        T = cy - nh / 2
        B = cy + nh / 2
      } else if (vert) {
        nw = nh * st.aspect
        const cx = (st.L + st.R) / 2
        L = cx - nw / 2
        R = cx + nw / 2
      }
      nw = R - L
      nh = B - T
    }

    const cx = (L + R) / 2
    const cy = (T + B) / 2
    updateElement(element.id, {
      w: Math.round(nw),
      h: Math.round(nh),
      x: (cx / PAGE_W) * 100,
      y: (cy / st.naturalH) * 100,
    })
  }
  function onHandleUp(e) {
    resizeRef.current = null
    try {
      e.target.releasePointerCapture(e.pointerId)
    } catch {
      /* noop */
    }
  }

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: 'absolute',
        left: `${element.x}%`,
        top: `${element.y}%`,
        width: `${w}px`,
        height: `${h}px`,
        transform: `translate(-50%, -50%) rotate(${element.rotation || 0}deg)`,
        cursor: interactive ? (grabbing ? 'grabbing' : 'grab') : 'default',
        touchAction: 'none',
        zIndex: selected ? 30 : 20,
      }}
    >
      <div style={{ opacity: element.opacity, width: '100%', height: '100%' }}>
        <ElementGlyph
          kind={element.kind}
          variant={element.variant}
          color={element.color}
          width={w}
          height={h}
        />
      </div>

      {selected && (
        <>
          {/* Bounding box */}
          <div className="pointer-events-none absolute inset-0 border border-accent" />

          {/* Resize handles */}
          {HANDLES.map(([name, lx, ty, cursor]) => (
            <div
              key={name}
              onPointerDown={(e) => onHandleDown(name, e)}
              onPointerMove={onHandleMove}
              onPointerUp={onHandleUp}
              style={{
                position: 'absolute',
                left: `${lx}%`,
                top: `${ty}%`,
                width: 10,
                height: 10,
                transform: 'translate(-50%, -50%)',
                cursor: `${cursor}-resize`,
                touchAction: 'none',
                zIndex: 40,
              }}
              className="rounded-[2px] border border-accent bg-surface"
            />
          ))}

          {/* Delete button (above the box) */}
          <button
            onPointerDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            onClick={(e) => {
              e.stopPropagation()
              removeElement(element.id)
            }}
            style={{ position: 'absolute', left: '50%', top: -34, transform: 'translateX(-50%)', zIndex: 41 }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow"
            title="Delete element"
          >
            ✕
          </button>
        </>
      )}
    </div>
  )
}

/** Renders all overlay elements for a given page key. */
export function PageOverlays({ pageKey, interactive = false }) {
  const elements = usePortfolioStore((s) => s.designElements[pageKey])
  if (!elements || elements.length === 0) return null
  return (
    <>
      {elements.map((el) => (
        <DesignElement key={el.id} element={el} interactive={interactive} />
      ))}
    </>
  )
}
