import { useRef, useState } from 'react'
import { fileToDataURL } from '../utils/localStorage'

/**
 * Reusable image uploader. Reads the file as a base64 data URL (so it can be
 * persisted in localStorage) and reports it via onChange(dataUrl).
 *
 * props:
 *  - value: current data URL (or '')
 *  - onChange: (dataUrl: string) => void
 *  - label: small caption above the dropzone
 *  - aspect: tailwind aspect class, e.g. 'aspect-square' | 'aspect-[4/3]'
 *  - rounded: 'full' for circular avatars
 */
export default function ImageUploader({
  value,
  onChange,
  label,
  aspect = 'aspect-[4/3]',
  rounded = '',
}) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)

  async function handleFiles(fileList) {
    const file = fileList?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setBusy(true)
    try {
      const url = await fileToDataURL(file)
      onChange(url)
    } finally {
      setBusy(false)
    }
  }

  const roundCls = rounded === 'full' ? 'rounded-full' : 'rounded-sm'

  return (
    <div>
      {label && <span className="label-field">{label}</span>}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
        className={`group relative ${aspect} ${roundCls} w-full overflow-hidden border border-dashed border-border
          bg-surface-alt/40 cursor-pointer flex items-center justify-center text-center transition
          hover:border-accent`}
      >
        {value ? (
          <>
            <img
              src={value}
              alt={label || 'upload'}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="text-white text-xs uppercase tracking-wider2">
                Replace
              </span>
            </div>
          </>
        ) : (
          <div className="px-4">
            <div className="text-2xl text-muted">＋</div>
            <p className="mt-1 text-xs text-muted">
              {busy ? 'Uploading…' : 'Click or drop an image'}
            </p>
          </div>
        )}
      </div>

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="mt-2 text-xs text-muted hover:text-accent transition"
        >
          Remove image
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
