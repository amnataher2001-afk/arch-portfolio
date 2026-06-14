import MediaSection from '../../components/MediaSection'
import { useProjectId } from './ProjectDetail'

export default function ProjectShots() {
  const projectId = useProjectId()
  return (
    <MediaSection
      projectId={projectId}
      section="shots"
      itemNoun="Shot"
      descriptionLabel="General Shots Description"
      descriptionPlaceholder="A general description of the renders / shots…"
      namePlaceholder="e.g. Main Atrium View"
      withCategory
    />
  )
}
