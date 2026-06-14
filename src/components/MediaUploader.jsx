import { useRef, useState } from 'react'
import { fileToDataURL } from '../utils/localStorage'

/**
 * Accepts BOTH images and PDFs, stored as a base64 data URL.
 *  - Images render with <img>.
 *  - PDFs render with <embed type="application/pdf"> so the browser's built-in
 *    PDF viewer shows the document directly (no external library needed).
 *
 * Stored shape: { kind: 'image' | 'pdf', src, fileName }
 *
 * props: value, onChange({...}|null), compact
 */
export default function MediaUploader({ value, onChange, compact = false }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)

  async function handleFiles(fileList) {
    const file = fileList?.[0]
    if (!file) return
    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'
    if (!isImage && !isPdf) return
    setBusy(true)
    try {
      const src = await fileToDataURL(file)
      onChange({ kind: isPdf ? 'pdf' : 'image', src, fileName: file.name })
    } finally {
      setBusy(false)
    }
  }

  const heightCls = compact ? 'h-32' : 'aspect-[4/3]'

  // Support legacy entries that rendered PDF pages to images (`pages` array).
  const imgSrc =
    value?.pages?.length > 0
      ? value.pages[0]
      : value?.kind === 'image' || value?.src?.startsWith?.('data:image')
        ? value.src
        : null
  const isPdfEmbed = !imgSrc && value?.kind === 'pdf' && value?.src

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
        className={`group relative ${heightCls} w-full cursor-pointer overflow-hidden rounded-sm border border-dashed border-border bg-surface-alt/40 transition hover:border-accent`}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={value.fileName || 'upload'}
            className="h-full w-full object-cover"
          />
        ) : isPdfEmbed ? (
          <>
            {/* pointer-events-none so a click still triggers "replace" */}
            <embed
              src={value.src}
              type="application/pdf"
              className="pointer-events-none h-full w-full"
            />
            <span className="absolute left-2 top-2 rounded-sm bg-black/55 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
              PDF
            </span>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-center">
            <span className="text-2xl text-muted">{busy ? '◷' : '＋'}</span>
            <span className="mt-1 px-3 text-xs text-muted">
              {busy ? 'Uploading…' : 'Image or PDF'}
            </span>
          </div>
        )}

        {value?.src && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
            <span className="text-xs uppercase tracking-wider2 text-white">
              Replace
            </span>
          </div>
        )}
      </div>

      {value?.src && (
        <div className="mt-2 flex items-center gap-4">
          {isPdfEmbed && (
            <a
              href={value.src}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted transition hover:text-accent"
            >
              Open PDF ↗
            </a>
          )}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-muted transition hover:text-accent"
          >
            Remove file
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
