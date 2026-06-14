import { useRef, useState } from 'react'
import { usePortfolioStore } from '../store/usePortfolioStore'
import PageHeader from '../components/PageHeader'
import PortfolioPages from '../components/PortfolioPages'
import { exportPortfolioPDF } from '../utils/exportPDF'

export default function ExportPDF() {
  const studentInfo = usePortfolioStore((s) => s.studentInfo)
  const ref = useRef(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')

  async function handleExport() {
    setError('')
    setBusy(true)
    try {
      const name =
        (studentInfo.fullName || 'portfolio').trim().replace(/\s+/g, '-').toLowerCase() +
        '-portfolio.pdf'
      await exportPortfolioPDF(ref.current, name, (done, total) =>
        setProgress({ done, total })
      )
    } catch (err) {
      setError(err.message || 'Export failed.')
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="03 — Studio"
        title="Export PDF"
        description="Generate a high-resolution, A4 multi-page PDF of your portfolio. Section order and styling follow the Portfolio Builder."
        action={
          <button onClick={handleExport} disabled={busy} className="btn-accent">
            {busy
              ? progress
                ? `Exporting ${progress.done}/${progress.total}…`
                : 'Preparing…'
              : '⬇ Export PDF'}
          </button>
        }
      />

      {error && (
        <p className="mb-6 rounded-sm border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      <p className="mb-4 text-sm text-muted">
        Tip: adjust which sections appear and their order from the{' '}
        <span className="text-accent">Portfolio Builder</span>.
      </p>

      {/* Visual preview only — scaled down for display. NOT used for capture. */}
      <div className="overflow-hidden rounded-sm border border-border bg-surface-alt/40 p-6">
        <div
          className="origin-top"
          style={{ transform: 'scale(0.7)', width: '794px', marginInline: 'auto' }}
        >
          <PortfolioPages />
        </div>
      </div>

      {/*
        Capture source: rendered at true A4 size with NO transform on any
        ancestor (a CSS transform corrupts html2canvas text positioning).
        Kept off-screen so it doesn't affect layout.
      */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          width: '794px',
          pointerEvents: 'none',
        }}
      >
        <div ref={ref}>
          <PortfolioPages />
        </div>
      </div>
    </div>
  )
}
