import { AutoCompleteQuestion } from '@cto.ai/inquirer'

export interface Issue {
  iid: number
  title: string
  labels: string[]
}

export interface IssueValue {
  number: number
  title: string
  projectName?: string
  path?: string
  full_path?: string
}

export interface IssueSelection {
  name: string
  helpInfo: string
  value: IssueValue
}

export interface IssueSelectionItem {
  iid: number
  title: string
  description: string
  web_url: string
  state: string
  created_at: Date
  updated_at: Date
  labels: string[]
  user_notes_count: number
  assignee?: { name: string }
}

export interface DataForFilter {
  name: string
  prompt: AutoCompleteQuestion<any>[]
}

export interface HelpInfo {
  name: string
  helpInfo: string
}
