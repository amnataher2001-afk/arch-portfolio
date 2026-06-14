// Centralized localStorage helpers. The Zustand store (usePortfolioStore)
// uses the persist middleware under STORAGE_KEY, but these helpers are handy
// for manual import/export and for the AI Review API key.

export const STORAGE_KEY = 'arch-portfolio'

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.warn('Failed to save state', err)
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* noop */
  }
}

// Convert an uploaded File into a base64 data URL so images / PDFs can be
// persisted directly in localStorage and rendered without a backend.
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Small id helper for dynamic list items (plans, skills, projects...).
export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}
