import MediaSection from '../../components/MediaSection'
import { useProjectId } from './ProjectDetail'

export default function ProjectPlans() {
  const projectId = useProjectId()
  return (
    <MediaSection
      projectId={projectId}
      section="plans"
      itemNoun="Plan"
      descriptionLabel="Plans Description"
      descriptionPlaceholder="A general description of the plans in this project…"
      namePlaceholder="e.g. Ground Floor Plan"
    />
  )
}
