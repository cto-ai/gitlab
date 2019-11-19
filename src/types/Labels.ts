import { Project } from './Projects'

export interface ProjectLabel {
  name: string
  color: string
  description: string
}
export interface LabelEdit {
  id: number
  name: string
  description: string
  color: string
  is_project_label: boolean
}

export interface LabelList {
  name: string
  value: ProjectLabel
}

export interface ProjectWithLabelsToAdd {
  project: Project
  labels: ProjectLabel[]
}
