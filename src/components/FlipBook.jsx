import { useCallback, useEffect, useRef, useState } from 'react'
import { usePortfolioPageNodes } from './PortfolioPages'

const PAGE_W = 794
const PAGE_H = 1123
const FLIP_MS = 750

// One page of the book (clips A4 content). `node` is a <Page> element or null.
function PageFace({ node }) {
  return (
    <div
      style={{
        width: PAGE_W,
        height: PAGE_H,
        overflow: 'hidden',
        background: 'rgb(var(--color-surface))',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {node}
    </div>
  )
}

/**
 * Double-page-spread book with a realistic CSS 3D page-turn.
 * - Cover (page 1) shows as a single right-hand page.
 * - Subsequent pages show as left+right spreads.
 * - A transient "sheet" rotates in 3D around the spine to turn the page.
 */
export default function FlipBook() {
  const pages = usePortfolioPageNodes({ interactive: false })
  const N = pages.length

  const stageRef = useRef(null)
  const [spread, setSpread] = useState(0)
  const [anim, setAnim] = useState(null) // { dir, target, staticL, staticR, front, back }
  const [rotated, setRotated] = useState(false)
  const [isFs, setIsFs] = useState(false)
  const [scale, setScale] = useState(0.5)

  const totalSpreads = 1 + Math.ceil(Math.max(0, N - 1) / 2)

  // 0-based page index for a spread side (-1 = none).
  const leftIndex = (s) => (s === 0 ? -1 : 2 * s - 1)
  const rightIndex = (s) => (s === 0 ? 0 : 2 * s)
  const pageAt = (i) => (i >= 0 && i < N ? pages[i] : null)

  const go = useCallback(
    (dir) => {
      if (anim) return
      const target = dir === 'next' ? spread + 1 : spread - 1
      if (target < 0 || target > totalSpreads - 1) return

      if (dir === 'next') {
        setAnim({
          dir,
          target,
          staticL: leftIndex(spread),
          staticR: rightIndex(target),
          front: rightIndex(spread),
          back: leftIndex(target),
        })
      } else {
        setAnim({
          dir,
          target,
          staticL: leftIndex(target),
          staticR: rightIndex(spread),
          front: leftIndex(spread),
          back: rightIndex(target),
        })
      }
      setRotated(false)
    },
    [anim, spread, totalSpreads, N]
  )

  // Kick off the rotation (next frame) and commit when it finishes.
  useEffect(() => {
    if (!anim) return
    let raf2
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setRotated(true))
    })
    const commit = setTimeout(() => {
      setSpread(anim.target)
      setAnim(null)
      setRotated(false)
    }, FLIP_MS + 30)
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
      clearTimeout(commit)
    }
  }, [anim])

  // Keyboard navigation.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go('next')
      else if (e.key === 'ArrowLeft') go('prev')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  // Fullscreen tracking.
  useEffect(() => {
    const onFs = () => setIsFs(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  // Fit the open book (two pages wide) to the available space.
  useEffect(() => {
    const fit = () => {
      const pad = isFs ? 150 : 96
      const availH = (isFs ? window.innerHeight : 640) - pad
      const availW = (isFs ? window.innerWidth : stageRef.current?.clientWidth || 900) - 48
      setScale(Math.max(0.15, Math.min(availW / (PAGE_W * 2), availH / PAGE_H)))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [isFs])

  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else stageRef.current?.requestFullscreen?.()
  }

  const curL = anim ? anim.staticL : leftIndex(spread)
  const curR = anim ? anim.staticR : rightIndex(spread)
  const atStart = spread === 0 && !anim
  const atEnd = spread >= totalSpreads - 1 && !anim

  // Page-number label (1-based, like a printed book).
  const pageLabel = () => {
    if (spread === 0) return `Cover · 1 / ${N}`
    const l = 2 * spread
    const r = Math.min(2 * spread + 1, N)
    return `Pages ${l}–${r} / ${N}`
  }

  const pageBox = (node, left) => (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left,
        width: PAGE_W,
        height: PAGE_H,
        overflow: 'hidden',
        background: 'rgb(var(--color-surface))',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      }}
    >
      {node}
    </div>
  )

  const forward = anim?.dir === 'next'

  return (
    <div
      ref={stageRef}
      className={`relative rounded-sm border border-border ${
        isFs
          ? 'flex h-screen flex-col items-center justify-center bg-[#111]'
          : 'bg-surface-alt/40 py-8'
      }`}
    >
      {/* Book area (reserves scaled space) */}
      <div
        className="mx-auto"
        style={{ width: PAGE_W * 2 * scale, height: PAGE_H * scale }}
      >
        <div
          style={{
            width: PAGE_W * 2,
            height: PAGE_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            perspective: '2400px',
            position: 'relative',
          }}
        >
          {/* Static left & right pages */}
          {pageAt(curL) && pageBox(pageAt(curL), 0)}
          {pageAt(curR) && pageBox(pageAt(curR), PAGE_W)}

          {/* Center spine shading */}
          <div
            className="pointer-events-none"
            style={{
              position: 'absolute',
              top: 0,
              left: PAGE_W - 30,
              width: 60,
              height: PAGE_H,
              background:
                'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0) 100%)',
              zIndex: 5,
            }}
          />

          {/* Turning sheet */}
          {anim && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: forward ? PAGE_W : 0,
                width: PAGE_W,
                height: PAGE_H,
                transformStyle: 'preserve-3d',
                transformOrigin: forward ? 'left center' : 'right center',
                transition: `transform ${FLIP_MS}ms cubic-bezier(0.4, 0.15, 0.2, 1)`,
                transform: `rotateY(${
                  rotated ? (forward ? -180 : 180) : 0
                }deg)`,
                zIndex: 10,
                boxShadow: '0 12px 34px rgba(0,0,0,0.35)',
              }}
            >
              {/* Front face */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <PageFace node={pageAt(anim.front)} />
              </div>
              {/* Back face (pre-rotated so it reads correctly when flipped) */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <PageFace node={pageAt(anim.back)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div
        className={`mt-6 flex items-center justify-center gap-5 ${
          isFs ? 'text-white' : ''
        }`}
      >
        <button
          onClick={() => go('prev')}
          disabled={atStart}
          aria-label="Previous page"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-lg transition hover:border-accent hover:text-accent disabled:opacity-30"
        >
          ‹
        </button>

        <span className="min-w-[150px] text-center text-sm tabular-nums text-muted">
          {pageLabel()}
        </span>

        <button
          onClick={() => go('next')}
          disabled={atEnd}
          aria-label="Next page"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-lg transition hover:border-accent hover:text-accent disabled:opacity-30"
        >
          ›
        </button>

        <button
          onClick={toggleFs}
          className="ml-2 flex h-11 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm transition hover:border-accent hover:text-accent"
        >
          {isFs ? 'Exit' : '⛶ Fullscreen'}
        </button>
      </div>
    </div>
  )
}
