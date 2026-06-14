import PageHeader from '../components/PageHeader'
import FlipBook from '../components/FlipBook'

export default function BookPreview() {
  return (
    <div>
      <PageHeader
        eyebrow="03 — Studio"
        title="Interactive Book Preview"
        description="Flip through your portfolio like a printed book. Use the arrows or your keyboard's ← → keys, and go fullscreen for a closer look."
      />
      <FlipBook />
    </div>
  )
}
