import { sdk, ux } from '@cto.ai/sdk'
import {
  NOT_GIT_REPO_ERROR_MSG,
  NO_CMD_ERROR_MSG,
  MASTER_BRANCH_ERROR_MSG,
  NO_ISSUE_ERROR_MSG,
  NO_CHANGES_SAVE_ERROR_MSG,
  NO_SYNCPROJECTS_ERROR_MSG,
  NO_MERGES_ERROR_MSG,
  NOT_A_GIT_REPO_ERROR_MSG,
} from './messages'
import { setConfig } from '@cto.ai/sdk/dist/sdk'
import { logProvideCmdMsg } from '../utils/helpers'
import { commands, GITLAB_URL } from '../constants'

const ERROR_TAGS = ['gitlab', 'error']
const { actionBlue, callOutCyan, secondary } = ux.colors

export const handleError = async (
  err: any,
  command: string,
  labelName?: string,
  repoName?: string,
) => {
  if (!err || !err.message) return

  await sdk.track(ERROR_TAGS, {
    event: `GitLab Op running ${command}`,
    error: err.message,
    user: await sdk.user(),
  })
  const errorMessage = err.message.toLowerCase()
  if (errorMessage.includes(NOT_GIT_REPO_ERROR_MSG)) {
    sdk.log(
      `This directory is not a git repository, please run ${actionBlue(
        'project:create',
      )} or ${actionBlue('project:clone')} to get started!`,
    )
    process.exit(1)
  } else if (errorMessage.includes(NO_CMD_ERROR_MSG)) {
    sdk.log(
      `✋ Sorry, we didn't recognize ${secondary(command)} as a valid command!`,
    )
    await logProvideCmdMsg(commands)
    process.exit(1)
  } else if (errorMessage.includes(MASTER_BRANCH_ERROR_MSG)) {
    sdk.log(
      `\n❌ Sorry, you cannot create a merge request with master as head. Checkout to a feature branch.\n`,
    )
    process.exit(1)
  } else if (errorMessage.includes(NOT_A_GIT_REPO_ERROR_MSG)) {
    sdk.log(
      `\n❌ Sorry, this command needs to be ran in a valid GitLab repository!\n`,
    )
    process.exit(1)
  } else if (errorMessage.includes(NO_ISSUE_ERROR_MSG)) {
    sdk.log(`\n❌ There are no open issues. Create one with 'issue:create'.\n`)
    process.exit(1)
  } else if (errorMessage.includes(NO_CHANGES_SAVE_ERROR_MSG)) {
    sdk.log(`\n❌ There are no changes to save!`)
    process.exit(1)
  } else if (errorMessage.includes(NO_SYNCPROJECTS_ERROR_MSG)) {
    sdk.log(
      '😮 You did not choose any projects to sync up with. The op will now exit!',
    )
    process.exit(1)
  } else if (errorMessage.includes(NO_MERGES_ERROR_MSG)) {
    sdk.log('🤔 There are no open merge requests for the current project!')
  } else if (
    err.response &&
    err.response.status === 401 &&
    command === 'getUser()'
  ) {
    sdk.log(
      `😢 Looks like you're using an invalid token. Try running ${secondary(
        'token:update',
      )} to update your token.\nThe Op is currently configured to be used with ${secondary(
        GITLAB_URL,
      )}!\nIf you want to use the Op with a custom Gitlab instance, please refer to the README for setup!`,
    )
    // This removes the invalid token from the config
    // It prevents a deadlock scenario where the user
    // cannot update their config
    await setConfig('accessToken', '')
    process.exit(1)
  } else if (
    err.response &&
    err.response.status === 404 &&
    (command === 'deleteProjectLabel()' || command === 'deleteGroupLabel')
  ) {
    sdk.log(`😅 This label does not exist ${callOutCyan(labelName)}!`)
  } else if (
    err.response &&
    err.response.status === 404 &&
    command === 'getLabel()'
  ) {
    sdk.log(
      `😅 The label ${callOutCyan(labelName)} does not exist for this project!`,
    )
    process.exit(1)
  } else if (
    err.response &&
    err.response.status === 404 &&
    command === 'getProject()'
  ) {
    sdk.log(
      `😅 This GitLab project either does not exist, or you do not have user permissions to access this project's details!`,
    )
    process.exit(1)
  } else if (err.response && err.response.status === 410) {
    sdk.log(
      `The information you are trying to access is moved. Refer to the error message for more details: ${err.message}`,
    )
    process.exit(1)
  } else if (
    err.response &&
    err.response.status === 409 &&
    command === 'createLabels()'
  ) {
    sdk.log(
      `❌ Label ${callOutCyan(
        labelName,
      )} already exists in the project ${secondary(
        repoName,
      )}! Create a label with a different name!`,
    )
    process.exit(1)
  } else if (
    err.response &&
    err.response.status === 400 &&
    command === 'createProject()'
  ) {
    sdk.log(
      `❌ Creating project failed due to a bad request! \n🏷  Make sure you are not at the project limit or trying to create a project with the same name!\n`,
    )
    ux.spinner.stop('❌')
    process.exit(1)
  } else if (err.response && err.response.status === 401) {
    sdk.log(
      `🤔 You do not have the specific user permissions to this group or project!\n 🏷  Please check your access token's scope and user permissions!`,
    )
  } else if (
    err.response &&
    err.response.status === 500 &&
    command === 'getAllIssues()'
  ) {
    sdk.log(
      `❗️ Listing out all issues available on ${secondary(
        'gitlab.com',
      )} is not possible due to the fact there are too many records.\n 👉 Please use ${callOutCyan(
        'issue:search',
      )} to narrow down your search!`,
    )
    process.exit(1)
  } else if (command === 'createLabel()') {
    sdk.log(
      `😅 Sorry, failed to create ${callOutCyan(
        labelName,
      )} in project ${secondary(repoName)}. Refer to ${err} for more details.`,
    )
    process.exit(1)
  } else if (err.response && err.response.status === 404) {
    sdk.log(
      `😅 It seems like the GitLab resource does not exist or you do not have permissions to view it!`,
    )
    process.exit(1)
  } else {
    // base case
    sdk.log(err)
    process.exit(1)
  }
}
