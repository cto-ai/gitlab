import { Project } from './Projects'
import { LabelEdit } from './Labels'
import { MergeValue } from './Merges'
import { Issue } from './Issues'
import { IssueValue } from './Issues'

export interface AnsToken {
  token: string
}

export interface AnsProjectCreate {
  namespace: number
  name: string
  description: string
  privateOrPublic: string
}

export interface AnsProjectCloneSelect {
  project: Project
}

export interface AnsAddAsGroup {
  group: boolean
}

export interface AnsSelectLabelEdit {
  label: LabelEdit
}

export interface AnsSelectMerge {
  mergeRequest: MergeValue
}

export interface AnsFilterSelect {
  filter?: string
  issueFilter?: string[]
}

export interface AnsIssueSelect {
  issue: IssueValue
}

export interface AnsBaseProject {
  baseProject: string
}

export interface AnsSyncProjects {
  syncProjects: Project[]
}

export interface AnsIssueTitleType {
  title: string
  type: string
}

export interface AnsIssueDescription {
  description: string
}

export interface AnsSelectIssueStart {
  issue: Issue
}

export interface AnsIssueSave {
  message: string
}

export interface AnsMergeRequest {
  title: string
  comment: string
}

export interface AnsSelectYesNo {
  yesOrNo: boolean
}

export interface AnsSelectAssignees {
  assignees: number[]
}

export interface AnsIssueList {
  issue: IssueValue
}
