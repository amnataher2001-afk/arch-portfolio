import { usePortfolioStore } from '../store/usePortfolioStore'
import PageHeader from '../components/PageHeader'

export default function AboutMe() {
  const { aboutMe, updateAboutMe, studentInfo } = usePortfolioStore()

  const bioWords = aboutMe.bio.trim() ? aboutMe.bio.trim().split(/\s+/).length : 0

  return (
    <div>
      <PageHeader
        eyebrow="01 — Profile"
        title="About Me"
        description="Your personal statement and design philosophy. These open your portfolio and set the tone for everything that follows."
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_260px]">
        {/* Editors */}
        <div className="space-y-8">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="label-field mb-0">Personal Bio / Statement</span>
              <span className="text-[11px] text-muted">{bioWords} words</span>
            </div>
            <textarea
              className="textarea-field min-h-[200px]"
              value={aboutMe.bio}
              onChange={(e) => updateAboutMe({ bio: e.target.value })}
              placeholder="Introduce yourself — who you are, what drives your work, the kind of architecture you care about…"
            />
          </div>

          <div>
            <span className="label-field">Architectural Philosophy</span>
            <textarea
              className="textarea-field min-h-[140px]"
              value={aboutMe.philosophy}
              onChange={(e) => updateAboutMe({ philosophy: e.target.value })}
              placeholder="A short paragraph capturing your approach to space, material, and people."
            />
            <p className="mt-2 text-xs text-muted">
              Keep this tight — one strong paragraph reads better than three loose
              ones.
            </p>
          </div>
        </div>

        {/* Live preview card */}
        <aside className="lg:sticky lg:top-4 h-fit">
          <p className="label-field">Preview</p>
          <div className="card overflow-hidden">
            <div className="aspect-square w-full bg-surface-alt">
              {studentInfo.profilePhoto ? (
                <img
                  src={studentInfo.profilePhoto}
                  alt={studentInfo.fullName || 'profile'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted">
                  Add a photo in Student Info
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-display text-2xl">
                {studentInfo.fullName || 'Your Name'}
              </h3>
              <p className="mt-1 text-xs uppercase tracking-wider2 text-muted">
                {studentInfo.faculty || 'Architecture'}
              </p>
              {aboutMe.philosophy && (
                <p className="mt-4 border-t border-border pt-4 text-sm italic text-muted leading-relaxed line-clamp-6">
                  “{aboutMe.philosophy}”
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
