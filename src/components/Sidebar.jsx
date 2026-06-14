import { NavLink } from 'react-router-dom'
import { usePortfolioStore } from '../store/usePortfolioStore'

const SECTIONS = [
  {
    group: 'Profile',
    items: [
      { to: '/', label: 'Student Info', end: true },
      { to: '/about', label: 'About Me' },
      { to: '/skills', label: 'Skills' },
      { to: '/cv', label: 'CV / Resume' },
    ],
  },
  {
    group: 'Work',
    items: [{ to: '/projects', label: 'Projects' }],
  },
  {
    group: 'Studio',
    items: [
      { to: '/ai-review', label: 'AI Review' },
      { to: '/builder', label: 'Portfolio Builder' },
      { to: '/export', label: 'Export PDF' },
      { to: '/book', label: 'Book Preview' },
      { to: '/review', label: 'Portfolio Review' },
    ],
  },
]

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
      <path
        d="M16 4 L28 28 H4 Z"
        fill="none"
        stroke="rgb(var(--color-accent))"
        strokeWidth="1.4"
      />
      <line x1="16" y1="4" x2="16" y2="28" stroke="rgb(var(--color-accent))" strokeWidth="0.9" />
      <line x1="10" y1="16" x2="22" y2="16" stroke="rgb(var(--color-accent))" strokeWidth="0.9" />
    </svg>
  )
}

export default function Sidebar() {
  const { settings, toggleTheme, studentInfo } = usePortfolioStore()

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-border bg-surface">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <Mark />
        <div className="leading-tight">
          <h1 className="font-display text-2xl">Arch Portfolio</h1>
          <p className="text-[10px] uppercase tracking-wider2 text-muted">
            Studio Builder
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-5">
        {SECTIONS.map((section) => (
          <div key={section.group} className="mb-6">
            <p className="px-2 mb-2 text-[10px] uppercase tracking-wider2 text-muted/70">
              {section.group}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition
                      ${
                        isActive
                          ? 'bg-surface-alt text-text font-medium'
                          : 'text-muted hover:text-text hover:bg-surface-alt/60'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`h-1.5 w-1.5 rounded-full transition ${
                            isActive ? 'bg-accent' : 'bg-transparent group-hover:bg-border'
                          }`}
                        />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer: identity + theme toggle */}
      <div className="border-t border-border px-4 py-4">
        <div className="mb-3 px-2">
          <p className="truncate text-sm font-medium">
            {studentInfo.fullName || 'Your Name'}
          </p>
          <p className="truncate text-xs text-muted">
            {studentInfo.university || 'University'}
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="flex w-full items-center justify-between rounded-sm border border-border px-3 py-2 text-xs text-muted hover:border-accent hover:text-accent transition"
        >
          <span className="uppercase tracking-wider2">
            {settings.theme === 'dark' ? 'Dark' : 'Light'} mode
          </span>
          <span>{settings.theme === 'dark' ? '☾' : '☀'}</span>
        </button>
      </div>
    </aside>
  )
}
