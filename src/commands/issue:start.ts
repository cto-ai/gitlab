import { sdk, ux } from '@cto.ai/sdk'
import { CommandOptions } from '../types/Config'
import { checkCurrentProject, pExec } from '../utils/helpers'
import { LABELS } from '../constants'
import { handleError } from '../errors'
import {
  listIssueForProject,
  editIssueLabels,
  getUser,
  assignIssue,
  setToken,
} from '../utils/apiCalls'
import { selectIssue } from '../prompts/issue:start'
import { checkForLocalBranch, makeInitialCommit } from '../utils/git'
import { NoIssueError } from '../errors/classes'
import { handleSuccess } from '../utils/success'

const { callOutCyan } = ux.colors

export const issueStart = async (cmdOptions: CommandOptions) => {
  await setToken()
  await checkCurrentProject(cmdOptions)
  const { repo, namespace } = cmdOptions.currentRepo
  const issues = await listIssueForProject(`${namespace}/${repo}`)
  const filteredIssues = issues.filter(issue => {
    return !issue.merge_requests_count
  })
  if (!filteredIssues || !filteredIssues.length) {
    throw new NoIssueError()
  }

  const { title, iid, labels } = await selectIssue(filteredIssues)
  const branchName = `${title.replace(/ /g, '-')}/${iid}`
  const hasLocalBranch = await checkForLocalBranch(branchName)
  // Assigns issue to user + edit labels
  const { id } = await getUser()
  await assignIssue(`${namespace}/${repo}`, iid, id)
  await editIssueLabels(
    `${namespace}/${repo}`,
    iid,
    labels,
    LABELS.PM_TODO.name,
    LABELS.PM_DOING.name,
  )
  try {
    if (!hasLocalBranch) {
      await pExec(`git checkout -b ${branchName}`)
      await makeInitialCommit()
    } else {
      await pExec(`git checkout ${branchName}`)
    }
  } catch (err) {
    await handleError(err, 'createLocalBranch')
  }
  await handleSuccess('issue:start', {
    iid,
    title,
  })
}
