// Collect image data URLs from a project / the whole portfolio so they can be
// sent to Gemini for multimodal (image + text) analysis. Only base64 image data
// URLs are returned (PDF embeds and remote URLs are skipped).

function imgFromMedia(media) {
  if (!media) return null
  if (media.pages?.length && media.pages[0]?.startsWith?.('data:image'))
    return media.pages[0]
  if (media.src?.startsWith?.('data:image')) return media.src
  return null
}

const dedupe = (arr) => [...new Set(arr)]

// Images for a single project: hero shot, renders, concept images, drawings.
export function collectProjectImages(p, limit = 8) {
  const urls = []
  if (p.overview.heroShot?.startsWith?.('data:image'))
    urls.push(p.overview.heroShot)
  for (const it of p.shots.items) {
    const s = imgFromMedia(it.media)
    if (s) urls.push(s)
  }
  for (const im of p.concept.images) {
    const s = imgFromMedia(im.media)
    if (s) urls.push(s)
  }
  for (const it of [...p.plans.items, ...p.elevations.items, ...p.sections.items]) {
    const s = imgFromMedia(it.media)
    if (s) urls.push(s)
  }
  return dedupe(urls).slice(0, limit)
}

// Representative images across the whole portfolio (hero shots first).
export function collectPortfolioImages(projects, limit = 8) {
  const heroes = []
  const others = []
  for (const p of projects) {
    if (p.overview.heroShot?.startsWith?.('data:image'))
      heroes.push(p.overview.heroShot)
    for (const it of p.shots.items) {
      const s = imgFromMedia(it.media)
      if (s) others.push(s)
    }
  }
  return dedupe([...heroes, ...others]).slice(0, limit)
}
