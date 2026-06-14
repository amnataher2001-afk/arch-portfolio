import PageHeader from './PageHeader'

/**
 * Temporary placeholder for sections built in later phases.
 */
export default function Placeholder({ eyebrow, title, phase, children }) {
  return (
    <div>
      <PageHeader eyebrow={eyebrow} title={title} />
      <div className="card flex flex-col items-center justify-center px-8 py-20 text-center">
        <div className="mb-4 text-3xl text-accent">◷</div>
        <p className="font-display text-2xl">Coming in {phase}</p>
        <p className="mt-2 max-w-md text-sm text-muted leading-relaxed">
          {children ||
            'This section is part of an upcoming build phase. The data model and navigation are already wired up.'}
        </p>
      </div>
    </div>
  )
}
