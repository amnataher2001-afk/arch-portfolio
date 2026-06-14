/**
 * Consistent editorial page header used across all pages.
 */
export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-10 flex items-end justify-between gap-6 border-b border-border pb-6">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="font-display text-4xl md:text-5xl">{title}</h2>
        {description && (
          <p className="mt-3 text-muted leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
