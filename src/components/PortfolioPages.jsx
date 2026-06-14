import { forwardRef } from 'react'
import { usePortfolioStore } from '../store/usePortfolioStore'
import { LEVELS } from './SkillSlider'
import { PageOverlays } from './DesignElement'

/* A reusable A4 page wrapper. Width is fixed (≈ A4 at 96dpi); callers scale it
   down for previews via CSS transform. Each page is tagged .portfolio-page so
   the PDF exporter can iterate them. */
function Page({ pageKey, interactive = false, children, footer }) {
  return (
    <div
      className="portfolio-page relative mx-auto flex flex-col bg-surface text-text"
      style={{ width: '794px', minHeight: '1123px', padding: '64px' }}
    >
      <div className="flex-1">{children}</div>
      <div className="mt-8 flex items-center justify-between border-t border-border pt-4 text-[10px] uppercase tracking-[0.2em] text-muted">
        <span>Arch Portfolio</span>
        <span>{footer}</span>
      </div>
      {/* Design-element overlays for this page */}
      <PageOverlays pageKey={pageKey} interactive={interactive} />
    </div>
  )
}

function MediaBox({ media, className = '', alt }) {
  const imageSrc =
    media?.pages?.length > 0
      ? media.pages[0]
      : media?.kind === 'image' || media?.src?.startsWith?.('data:image')
        ? media.src
        : null

  if (imageSrc) {
    return (
      <img src={imageSrc} alt={alt || ''} className={`object-cover ${className}`} />
    )
  }
  // PDFs: embed the browser's PDF viewer.
  if (media?.kind === 'pdf' && media?.src) {
    return (
      <embed
        src={media.src}
        type="application/pdf"
        className={`border border-border ${className}`}
      />
    )
  }
  return (
    <div
      className={`flex items-center justify-center border border-border bg-surface-alt text-xs text-muted ${className}`}
    >
      No file
    </div>
  )
}

const PortfolioPages = forwardRef(function PortfolioPages({ interactive = false }, ref) {
  const { studentInfo, aboutMe, skills, cv, projects, builder } =
    usePortfolioStore()

  const visible = (key) => !builder.hidden.includes(key)
  const pages = []
  let pageNo = 0
  const fnum = () => String(++pageNo).padStart(2, '0')

  for (const section of builder.order) {
    if (!visible(section)) continue

    if (section === 'cover') {
      pages.push(
        <Page key="cover" pageKey="cover" interactive={interactive} footer={fnum()}>
          <div className="flex h-full min-h-[900px] flex-col justify-between">
            <p className="eyebrow">Architecture Portfolio</p>
            <div>
              {studentInfo.profilePhoto && (
                <img
                  src={studentInfo.profilePhoto}
                  alt={studentInfo.fullName}
                  className="mb-8 h-40 w-40 rounded-full object-cover"
                />
              )}
              <h1 className="font-display text-7xl leading-none">
                {studentInfo.fullName || 'Your Name'}
              </h1>
              <p className="mt-4 text-xl text-muted">
                {studentInfo.faculty || 'Architecture'}
              </p>
            </div>
            <div className="text-sm text-muted">
              <p>{studentInfo.university}</p>
              <p>
                {[studentInfo.location, studentInfo.graduationYear]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <p>{studentInfo.email}</p>
            </div>
          </div>
        </Page>
      )
    }

    if (section === 'about') {
      pages.push(
        <Page key="about" pageKey="about" interactive={interactive} footer={fnum()}>
          <p className="eyebrow mb-4">About</p>
          <h2 className="mb-8 font-display text-5xl">Statement</h2>
          {aboutMe.bio && (
            <p className="mb-8 whitespace-pre-wrap text-base leading-relaxed">
              {aboutMe.bio}
            </p>
          )}
          {aboutMe.philosophy && (
            <blockquote className="border-l-2 border-accent pl-6 text-lg italic leading-relaxed text-muted">
              {aboutMe.philosophy}
            </blockquote>
          )}
        </Page>
      )
    }

    if (section === 'skills') {
      const groups = [
        ['Software', skills.software],
        ['Design', skills.design],
        ['Languages', skills.languages],
        ['Other', skills.other],
      ].filter(([, list]) => list.length > 0)
      if (groups.length > 0) {
        pages.push(
          <Page key="skills" pageKey="skills" interactive={interactive} footer={fnum()}>
            <p className="eyebrow mb-4">Capabilities</p>
            <h2 className="mb-8 font-display text-5xl">Skills</h2>
            <div className="grid grid-cols-2 gap-x-12 gap-y-8">
              {groups.map(([title, list]) => (
                <div key={title}>
                  <h3 className="mb-4 text-xs uppercase tracking-[0.18em] text-muted">
                    {title}
                  </h3>
                  <div className="space-y-3">
                    {list.map((sk) => (
                      <div key={sk.id}>
                        <div className="flex justify-between text-sm">
                          <span>{sk.name || '—'}</span>
                          <span className="text-muted">
                            {LEVELS[Number(sk.level)]}
                          </span>
                        </div>
                        <div className="mt-1 h-1 w-full bg-surface-alt">
                          <div
                            className="h-1 bg-accent"
                            style={{
                              width: `${((Number(sk.level) + 1) / 4) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Page>
        )
      }
    }

    if (section === 'cv') {
      const cvGroups = [
        ['Education', cv.education],
        ['Experience', cv.experience],
        ['Awards', cv.awards],
        ['Publications', cv.publications],
        ['Volunteer', cv.volunteer],
      ].filter(([, list]) => list.length > 0)
      if (cvGroups.length > 0) {
        pages.push(
          <Page key="cv" pageKey="cv" interactive={interactive} footer={fnum()}>
            <p className="eyebrow mb-4">Curriculum Vitae</p>
            <h2 className="mb-8 font-display text-5xl">Résumé</h2>
            <div className="space-y-8">
              {cvGroups.map(([title, list]) => (
                <div key={title}>
                  <h3 className="mb-3 text-xs uppercase tracking-[0.18em] text-muted">
                    {title}
                  </h3>
                  <div className="space-y-3">
                    {list.map((it) => (
                      <div key={it.id} className="flex justify-between gap-4">
                        <div>
                          <p className="font-medium">
                            {it.degree || it.title || '—'}
                          </p>
                          <p className="text-sm text-muted">
                            {[it.university, it.place].filter(Boolean).join('')}
                          </p>
                          {it.description && (
                            <p className="mt-1 text-sm leading-relaxed">
                              {it.description}
                            </p>
                          )}
                        </div>
                        <span className="flex-shrink-0 text-sm text-muted">
                          {it.year}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Page>
        )
      }
    }

    if (section === 'projects') {
      projects.forEach((p) => {
        const o = p.overview
        // Overview + concept page
        pages.push(
          <Page
            key={`${p.id}-overview`}
            pageKey={`${p.id}-overview`}
            interactive={interactive}
            footer={fnum()}
          >
            <p className="eyebrow mb-3">{o.type} Project</p>
            <h2 className="font-display text-5xl leading-tight">
              {o.name || 'Untitled Project'}
            </h2>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
              {o.year && <span>{o.year}</span>}
              {o.location && <span>{o.location}</span>}
              {o.area && <span>{o.area} m²</span>}
            </div>
            {o.heroShot && (
              <img
                src={o.heroShot}
                alt={o.name}
                className="mt-6 max-h-[460px] w-full object-cover"
              />
            )}
            {o.description && (
              <p className="mt-6 text-base leading-relaxed">{o.description}</p>
            )}
            {p.concept.description && (
              <div className="mt-6">
                <h3 className="font-display text-2xl">
                  {p.concept.title || 'Concept'}
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                  {p.concept.description}
                </p>
              </div>
            )}
          </Page>
        )

        // Drawings page (plans + elevations + sections)
        const drawings = [
          ...p.plans.items.map((i) => ({ ...i, group: 'Plan' })),
          ...p.elevations.items.map((i) => ({ ...i, group: 'Elevation' })),
          ...p.sections.items.map((i) => ({ ...i, group: 'Section' })),
        ]
        if (drawings.length > 0) {
          pages.push(
            <Page
              key={`${p.id}-drawings`}
              pageKey={`${p.id}-drawings`}
              interactive={interactive}
              footer={fnum()}
            >
              <p className="eyebrow mb-3">{o.name}</p>
              <h2 className="mb-6 font-display text-4xl">Drawings</h2>
              <div className="grid grid-cols-2 gap-5">
                {drawings.map((d) => (
                  <div key={d.id}>
                    <MediaBox
                      media={d.media}
                      className="h-52 w-full"
                      alt={d.name}
                    />
                    <p className="mt-2 text-sm font-medium">{d.name || d.group}</p>
                    <p className="text-xs text-muted">{d.group}</p>
                  </div>
                ))}
              </div>
            </Page>
          )
        }

        // Shots page
        if (p.shots.items.length > 0) {
          pages.push(
            <Page
              key={`${p.id}-shots`}
              pageKey={`${p.id}-shots`}
              interactive={interactive}
              footer={fnum()}
            >
              <p className="eyebrow mb-3">{o.name}</p>
              <h2 className="mb-6 font-display text-4xl">Renders & Shots</h2>
              <div className="grid grid-cols-2 gap-5">
                {p.shots.items.map((s) => (
                  <div key={s.id}>
                    <MediaBox
                      media={s.media}
                      className="h-56 w-full"
                      alt={s.name}
                    />
                    <p className="mt-2 text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted">{s.category}</p>
                  </div>
                ))}
              </div>
            </Page>
          )
        }
      })
    }
  }

  if (pages.length === 0) {
    pages.push(
      <Page key="empty" pageKey="empty" interactive={interactive} footer="01">
        <div className="flex h-full min-h-[900px] items-center justify-center text-center text-muted">
          <div>
            <p className="font-display text-3xl">Nothing to show yet</p>
            <p className="mt-2 text-sm">
              Fill in your info and projects, then enable sections here.
            </p>
          </div>
        </div>
      </Page>
    )
  }

  return (
    <div ref={ref} className="space-y-8">
      {pages}
    </div>
  )
})

export default PortfolioPages
