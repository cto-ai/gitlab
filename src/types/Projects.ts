export interface Project {
  name: string
  namespace: string
  url?: string
  id: number
}

export interface RemoteProject {
  namespace: string
  repo: string
  url: string
}
