export interface Project {
  name: string
  namespace: string
  url?: string
}

export interface RemoteProject {
  namespace: string
  repo: string
  url: string
}
