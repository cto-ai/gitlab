export interface GitLabOwner {
  id: number
  name: string
  created_at: string
}

export interface GitLabMilestone {
  due_date: string | null
  project_id: number
  state: string
  description: string
  iid: number
  id: number
  title: string
  created_at: string
  updated_at: string
}

export interface GitLabUser {
  state: string
  web_url: string
  avatar_url: string | null
  username: string
  id: number
  name: string
}

export interface GitLabLinks {
  self: string
  notes: string
  award_emoji: string
  project: string
}

export interface GitLabTimeStats {
  time_estimate: number
  total_time_spent: number
  human_time_estimate: string | null
  human_time_total_spent: string | null
}

export interface GitLabTaskCompletion {
  count: number
  completed_count: number
}

export interface GitLabIssueRes {
  project_id: number
  milestone: GitLabMilestone | null
  author: GitLabUser
  description: string | null
  state: string
  iid: number
  id: number
  assignees: GitLabUser[]
  assignee: GitLabUser | null
  labels: string[]
  upvotes: number
  downvotes: number
  merge_requests_count: number
  title: string
  updated_at: string
  created_at: string
  closed_at: string | null
  closed_by: GitLabUser | null
  user_notes_count: number
  due_date: string | null
  web_url: string
  time_stats: GitLabTimeStats
  has_tasks: boolean
  task_status: string | null
  confidential: boolean
  discussion_locked: boolean
  _links: GitLabLinks
  task_completion_status: GitLabTaskCompletion | null
}

export interface GitLabNamespaceRes {
  id: number
  name: string
  path: string
  kind: string
  full_path: string
  parent_id: number | null
  avatar_url: string
  web_url: string
  billable_members_count?: number
  plan?: string
}

export interface GitLabUserRes {
  id: number
  name: string
  username: string
  state: string
  avatar_url: string
  web_url: string
  created_at: string
  bio: string | null
  location: string | null
  public_email: string
  skype: string
  linkedin: string
  twitter: string
  website_url: string
  organization: string | null
  last_sign_in_at: string
  confirmed_at: string
  last_activity_on: string
  email: string
  theme_id: number
  color_scheme_id: number
  projects_limit: number
  current_sign_in_at: string
  identities: any
  can_create_group: boolean
  can_create_project: boolean
  two_factor_enabled: boolean
  external: boolean
  private_profile: boolean
  shared_runners_minutes_limit: number | null
  extra_shared_runners_minutes_limit: number | null
}

export interface GitLabProjectRes {
  id: number
  description: string
  name: string
  name_with_namespace: string
  path: string
  path_with_namespace: string
  created_at: string
  default_branch: string
  tag_list: string[]
  ssh_url_to_repo: string
  http_url_to_repo: string
  web_url: string
  readme_url: string | null
  avatar_url: string | null
  star_count: number
  forks_count: number
  last_activity_at: string
  namespace: GitLabNamespaceRes
  owner: GitLabOwner
  issues_enabled: boolean
  open_issues_count: number
  merge_requests_enabled: boolean
}

export interface GitLabLabelRes {
  id: number
  name: string
  color: string
  text_color: string
  description: string
  open_issues_count: number
  closed_issues_count: number
  open_merge_requests_count: number
  subscribed: boolean
  priority: number
  is_project_label: boolean
}

export interface GitLabMemberRes {
  id: number
  name: string
  username: string
  state: string
  avatar_url: string
  web_url: string
  access_level: number
  expires_at: string | null
}
