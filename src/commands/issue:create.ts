import { sdk, ux } from '@cto.ai/sdk'
import { checkCurrentProject, hasIssueEnabled } from '../utils/helpers'
import { CommandOptions } from '../types/Config'
import { handleError } from '../errors'
import { enableProjectIssues, createIssue, setToken } from '../utils/apiCalls'
import { getIssueInfo } from '../prompts/issue:create'
import { handleSuccess } from '../utils/success'

export const issueCreate = async (cmdOptions: CommandOptions) => {
  try {
    await setToken()
    await checkCurrentProject(cmdOptions)
    const { repo, namespace } = cmdOptions.currentRepo
    await ux.spinner.start(`🔍 Checking if GitLab project has issues enabled`)
    const hasIssues = await hasIssueEnabled(`${namespace}/${repo}`)
    if (!hasIssues) {
      await ux.spinner.stop('❌')
      sdk.log(`🏃 Trying to update repo to enable issues!`)
      await enableProjectIssues(`${namespace}/${repo}`)
      sdk.log('✅ Issues has been enabled for the current project!')
    } else {
      await ux.spinner.stop('✅')
    }
    const { title, body, labels } = await getIssueInfo()
    const createResponse = await createIssue(
      `${namespace}/${repo}`,
      title,
      body,
      labels,
    )
    await handleSuccess('issue:create', {
      title,
      name: repo,
      web_url: createResponse.web_url,
    })
  } catch (err) {
    await handleError(err, 'issue:create')
  }
}
