import { useEffect, useRef, useState, useCallback } from 'react'
import PortfolioPages from './PortfolioPages'

const PAGE_W = 794
const PAGE_H = 1123
const GAP = 32 // matches space-y-8 in PortfolioPages

/**
 * Flipbook-style viewer: stacks the portfolio pages and translates to the
 * current page, with a page-flip animation and fullscreen support.
 */
export default function FlipBook() {
  const innerRef = useRef(null) // PortfolioPages root
  const stageRef = useRef(null) // fullscreen target
  const [index, setIndex] = useState(0)
  const [total, setTotal] = useState(1)
  const [flip, setFlip] = useState('')
  const [isFs, setIsFs] = useState(false)
  const [scale, setScale] = useState(0.5)

  // Count rendered pages after mount / data changes.
  useEffect(() => {
    const count = innerRef.current?.querySelectorAll('.portfolio-page').length || 1
    setTotal(count)
    setIndex((i) => Math.min(i, count - 1))
  })

  // Recompute scale to fit the available area.
  useEffect(() => {
    const fit = () => {
      const pad = isFs ? 120 : 80
      const availH = (isFs ? window.innerHeight : 640) - pad
      const availW = (isFs ? window.innerWidth : stageRef.current?.clientWidth || 700) - 40
      setScale(Math.min(availH / PAGE_H, availW / PAGE_W, isFs ? 1.2 : 0.85))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [isFs])

  const go = useCallback(
    (dir) => {
      setIndex((i) => {
        const next = i + dir
        if (next < 0 || next >= total) return i
        setFlip(dir > 0 ? 'flip-next' : 'flip-prev')
        setTimeout(() => setFlip(''), 450)
        return next
      })
    },
    [total]
  )

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  // Fullscreen tracking
  useEffect(() => {
    const onFs = () => setIsFs(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else stageRef.current?.requestFullscreen?.()
  }

  return (
    <div
      ref={stageRef}
      className={`relative rounded-sm border border-border bg-surface-alt/50 ${
        isFs ? 'flex h-screen flex-col items-center justify-center bg-bg' : ''
      }`}
    >
      {/* Viewport — shows one page, clips the rest */}
      <div
        className={`mx-auto overflow-hidden ${flip}`}
        style={{ width: PAGE_W * scale, height: PAGE_H * scale }}
      >
        <div
          className="book-stage"
          style={{
            width: PAGE_W,
            transform: `scale(${scale}) translateY(-${index * (PAGE_H + GAP)}px)`,
            transformOrigin: 'top left',
          }}
        >
          <div ref={innerRef}>
            <PortfolioPages />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 py-4">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          className="btn-ghost h-10 w-10 !p-0 text-lg disabled:opacity-30"
          aria-label="Previous page"
        >
          ‹
        </button>
        <span className="text-sm tabular-nums text-muted">
          {index + 1} / {total}
        </span>
        <button
          onClick={() => go(1)}
          disabled={index >= total - 1}
          className="btn-ghost h-10 w-10 !p-0 text-lg disabled:opacity-30"
          aria-label="Next page"
        >
          ›
        </button>
        <button onClick={toggleFs} className="btn-ghost h-10 px-4 text-sm">
          {isFs ? 'Exit' : '⛶ Fullscreen'}
        </button>
      </div>
    </div>
  )
}
