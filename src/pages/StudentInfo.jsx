import { usePortfolioStore } from '../store/usePortfolioStore'
import PageHeader from '../components/PageHeader'
import ImageUploader from '../components/ImageUploader'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="label-field">{label}</span>
      {children}
    </label>
  )
}

export default function StudentInfo() {
  const { studentInfo, updateStudentInfo } = usePortfolioStore()

  const set = (key) => (e) => updateStudentInfo({ [key]: e.target.value })

  return (
    <div>
      <PageHeader
        eyebrow="01 — Profile"
        title="Student Info"
        description="The essentials that anchor your portfolio. Everything you enter is saved automatically in your browser."
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
        {/* Profile photo */}
        <div>
          <ImageUploader
            label="Profile Photo"
            value={studentInfo.profilePhoto}
            onChange={(url) => updateStudentInfo({ profilePhoto: url })}
            aspect="aspect-square"
            rounded="full"
          />
          <p className="mt-4 text-xs text-muted leading-relaxed">
            A clean headshot works best. This photo also appears on the About Me
            page and the portfolio cover.
          </p>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Full Name">
              <input
                className="input-field"
                value={studentInfo.fullName}
                onChange={set('fullName')}
                placeholder="e.g. Shahd Kishta"
              />
            </Field>
          </div>

          <Field label="University Name">
            <input
              className="input-field"
              value={studentInfo.university}
              onChange={set('university')}
              placeholder="e.g. Cairo University"
            />
          </Field>

          <Field label="Faculty / Department">
            <input
              className="input-field"
              value={studentInfo.faculty}
              onChange={set('faculty')}
              placeholder="e.g. Faculty of Engineering — Architecture"
            />
          </Field>

          <Field label="Supervisor Name">
            <input
              className="input-field"
              value={studentInfo.supervisor}
              onChange={set('supervisor')}
              placeholder="e.g. Dr. Mona Hassan"
            />
          </Field>

          <Field label="Graduation Year">
            <input
              className="input-field"
              value={studentInfo.graduationYear}
              onChange={set('graduationYear')}
              placeholder="e.g. 2026"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              className="input-field"
              value={studentInfo.email}
              onChange={set('email')}
              placeholder="you@email.com"
            />
          </Field>

          <Field label="Phone">
            <input
              className="input-field"
              value={studentInfo.phone}
              onChange={set('phone')}
              placeholder="+20 ..."
            />
          </Field>

          <Field label="LinkedIn URL">
            <input
              className="input-field"
              value={studentInfo.linkedin}
              onChange={set('linkedin')}
              placeholder="linkedin.com/in/…"
            />
          </Field>

          <Field label="Location / City">
            <input
              className="input-field"
              value={studentInfo.location}
              onChange={set('location')}
              placeholder="e.g. Cairo, Egypt"
            />
          </Field>
        </div>
      </div>
    </div>
  )
}
