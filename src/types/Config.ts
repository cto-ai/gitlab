import { RemoteProject } from './Projects'

export interface CommandOptions {
  accessToken: string
  username: string
  currentRepo: RemoteProject
}
