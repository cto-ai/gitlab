import branch from 'git-branch'
import { sdk, ux } from '@cto.ai/sdk'
import { checkCurrentProject } from '../utils/helpers'
import { CommandOptions } from '../types/Config'
import { LABELS } from '../constants'
import { handleError } from '../errors'
import {
  listMembersForProject,
  getIssue,
  createMergeRequest,
  setToken,
} from '../utils/apiCalls'
import {
  getMRInfo,
  promptForAssignees,
  selectAssignees,
} from '../prompts/issue:done'
import { MasterBranchError } from '../errors/classes'
import { handleSuccess } from '../utils/success'


export const issueDone = async (cmdOptions: CommandOptions) => {
  try {
    await setToken()
    await checkCurrentProject(cmdOptions)
    const { namespace, repo } = cmdOptions.currentRepo
    const currentBranch = await branch()

    if (currentBranch === 'master') {
      throw new MasterBranchError()
    }
    const members = await listMembersForProject(`${namespace}/${repo}`)
    // Refer to GitLab API doc for more information about access levels
    // https://docs.gitlab.com/ee/api/members.html
    // Make sure reviewers have the role: developer or higher
    const filteredMembers = members.filter(member => member.access_level >= 30)
    // Get the current issue number from the branch
    const issueNumber = currentBranch.slice(-1)
    const RESOLVE_STR = `Resolves #${issueNumber}.\n`
    const { title, comment } = await getMRInfo()
    const haveAssignees = await promptForAssignees()
    let assignees = []
    if (haveAssignees) {
      assignees = await selectAssignees(filteredMembers)
    }
    const { labels } = await getIssue(`${namespace}/${repo}`, issueNumber)
    const filteredLabels = labels.filter(
      label => label !== LABELS.PM_DOING.name,
    )
    filteredLabels.push(LABELS.PM_REVIEW.name)
    // Create MR
    const { web_url } = await createMergeRequest(
      `${namespace}/${repo}`,
      title,
      comment,
      filteredLabels,
      assignees,
      currentBranch,
      RESOLVE_STR,
    )
    await handleSuccess('issue:done', { web_url })
  } catch (err) {
    await handleError(err, 'issue:done')
  }
}
