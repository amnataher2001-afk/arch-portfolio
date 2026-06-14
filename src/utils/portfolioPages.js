// Returns the ordered list of portfolio pages as { key, label }.
// IMPORTANT: the keys here must stay in sync with the page keys used in
// components/PortfolioPages.jsx (cover/about/skills/cv, and per-project
// `${id}-overview` / `${id}-drawings` / `${id}-shots`, plus `empty`).

export function getPageDescriptors({ studentInfo, aboutMe, skills, cv, projects, builder }) {
  const out = []
  const visible = (k) => !builder.hidden.includes(k)

  for (const section of builder.order) {
    if (!visible(section)) continue

    if (section === 'cover') out.push({ key: 'cover', label: 'Cover' })
    if (section === 'about') out.push({ key: 'about', label: 'About Me' })
    if (section === 'skills') {
      const any = ['software', 'design', 'languages', 'other'].some(
        (k) => skills[k]?.length
      )
      if (any) out.push({ key: 'skills', label: 'Skills' })
    }
    if (section === 'cv') {
      const any = ['education', 'experience', 'awards', 'publications', 'volunteer'].some(
        (k) => cv[k]?.length
      )
      if (any) out.push({ key: 'cv', label: 'CV / Résumé' })
    }
    if (section === 'projects') {
      projects.forEach((p) => {
        const name = p.overview.name || 'Untitled'
        out.push({ key: `${p.id}-overview`, label: `${name} — Overview` })
        const drawings =
          p.plans.items.length + p.elevations.items.length + p.sections.items.length
        if (drawings > 0)
          out.push({ key: `${p.id}-drawings`, label: `${name} — Drawings` })
        if (p.shots.items.length > 0)
          out.push({ key: `${p.id}-shots`, label: `${name} — Shots` })
      })
    }
  }

  if (out.length === 0) out.push({ key: 'empty', label: 'Portfolio' })
  return out
}
