import MediaSection from '../../components/MediaSection'
import { useProjectId } from './ProjectDetail'

export default function ProjectElevations() {
  const projectId = useProjectId()
  return (
    <MediaSection
      projectId={projectId}
      section="elevations"
      itemNoun="Elevation"
      descriptionLabel="General Elevations Description"
      descriptionPlaceholder="A general description of the facades / elevations…"
      namePlaceholder="e.g. North Elevation"
    />
  )
}
