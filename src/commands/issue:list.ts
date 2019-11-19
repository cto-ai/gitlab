import { sdk } from '@cto.ai/sdk'
import {
  promptIssueSelection,
  formatIssues,
  formatAllIssues,
} from '../prompts/issue:list'
import { handleError } from '../errors'
import { getConfig } from '../utils/config'
import { CommandOptions } from '../types/Config'
import {
  listIssueForProject,
  getAllIssues,
  getProject,
  setToken,
} from '../utils/apiCalls'
import { isProjectCloned } from '../utils/helpers'
import { NoIssueError } from '../errors/classes'
import { handleSuccess } from '../utils/success'

export const issueList = async ({ currentRepo }: CommandOptions) => {
  await setToken()
  try {
    if (currentRepo) {
      // list issues specific to the repo
      const { namespace, repo } = currentRepo
      const issues = await listIssueForProject(`${namespace}/${repo}`)

      // check if issues exist
      if (!issues || !issues.length) {
        throw new NoIssueError()
      }
      const formattedIssues = formatIssues(issues)
      const selectedIssue = await promptIssueSelection(formattedIssues)
      await handleSuccess('issue:list', selectedIssue, true)
    }

    // If current repo is undefined, list all issues
    const issues = await getAllIssues()

    // check if issues exist
    if (!issues || !issues.length) {
      throw new NoIssueError()
    }
    const issuesWithProjectName = await Promise.all(
      issues.map(async issue => {
        const { iid, title, project_id } = issue
        const {
          path,
          namespace: { full_path },
        } = await getProject(project_id)
        return {
          iid,
          title,
          projectName: `${full_path}/${path}`,
          path,
          full_path,
        }
      }),
    )
    const formattedIssues = formatAllIssues(issuesWithProjectName)
    const { path, full_path } = await promptIssueSelection(formattedIssues)

    const remoteProjects = (await getConfig('remoteRepos')) || []
    const cloned = isProjectCloned(full_path, path, remoteProjects)
    await handleSuccess('issue:list', { cloned, path }, false)
  } catch (err) {
    await handleError(err, 'issue:list')
  }
}
