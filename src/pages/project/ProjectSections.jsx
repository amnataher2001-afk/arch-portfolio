import MediaSection from '../../components/MediaSection'
import { useProjectId } from './ProjectDetail'

export default function ProjectSections() {
  const projectId = useProjectId()
  return (
    <MediaSection
      projectId={projectId}
      section="sections"
      itemNoun="Section"
      descriptionLabel="General Sections Description"
      descriptionPlaceholder="A general description of the sections…"
      namePlaceholder="e.g. Section AA"
    />
  )
}
