import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import StylePanel from './components/StylePanel'
import { usePortfolioStore } from './store/usePortfolioStore'
import { resolvePalette, hexToChannels } from './utils/themes'

// Pages (Phase 1 fully built; later phases fill the placeholders)
import StudentInfo from './pages/StudentInfo'
import AboutMe from './pages/AboutMe'
import Skills from './pages/Skills'
import CV from './pages/CV'
import Projects from './pages/Projects'
import ProjectDetail from './pages/project/ProjectDetail'
import ProjectOverview from './pages/project/ProjectOverview'
import ProjectConcept from './pages/project/ProjectConcept'
import ProjectPlans from './pages/project/ProjectPlans'
import ProjectElevations from './pages/project/ProjectElevations'
import ProjectSections from './pages/project/ProjectSections'
import ProjectShots from './pages/project/ProjectShots'
import AIReview from './pages/AIReview'
import PortfolioReview from './pages/PortfolioReview'
import PortfolioBuilder from './pages/PortfolioBuilder'
import ExportPDF from './pages/ExportPDF'
import BookPreview from './pages/BookPreview'

export default function App() {
  const settings = usePortfolioStore((s) => s.settings)

  // Apply theme + typography settings live to the document root.
  useEffect(() => {
    const root = document.documentElement
    const p = resolvePalette(settings)
    root.classList.toggle('dark', !!p.isDark)
    root.style.setProperty('--color-bg', hexToChannels(p.bg))
    root.style.setProperty('--color-surface', hexToChannels(p.surface))
    root.style.setProperty('--color-surface-alt', hexToChannels(p.surfaceAlt))
    root.style.setProperty('--color-text', hexToChannels(p.text))
    root.style.setProperty('--color-muted', hexToChannels(p.muted))
    root.style.setProperty('--color-accent', hexToChannels(p.accent))
    root.style.setProperty('--color-border', hexToChannels(p.border))
    root.style.setProperty('--font-display', settings.fontDisplay)
    root.style.setProperty('--font-body', settings.fontBody)
    root.style.setProperty('--font-scale', String(settings.fontScale))
  }, [settings])

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-10 lg:px-12 lg:py-14">
          <Routes>
            <Route path="/" element={<StudentInfo />} />
            <Route path="/about" element={<AboutMe />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/cv" element={<CV />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />}>
              <Route index element={<ProjectOverview />} />
              <Route path="concept" element={<ProjectConcept />} />
              <Route path="plans" element={<ProjectPlans />} />
              <Route path="elevations" element={<ProjectElevations />} />
              <Route path="sections" element={<ProjectSections />} />
              <Route path="shots" element={<ProjectShots />} />
            </Route>
            <Route path="/ai-review" element={<AIReview />} />
            <Route path="/builder" element={<PortfolioBuilder />} />
            <Route path="/review" element={<PortfolioReview />} />
            <Route path="/export" element={<ExportPDF />} />
            <Route path="/book" element={<BookPreview />} />
          </Routes>
        </div>
      </main>
      <StylePanel />
    </div>
  )
}
