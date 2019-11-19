import { sdk, ux } from '@cto.ai/sdk'
import { CommandOptions } from '../types/Config'
import { checkCurrentProject } from '../utils/helpers'
import { handleError } from '../errors'
import { listMergeRequests, setToken } from '../utils/apiCalls'
import { promptMergeRequestSelection } from '../prompts/merges:list'
import { handleSuccess } from '../utils/success'
import { NoMergeRequestError } from '../errors/classes'

// main function
export const mergesList = async (cmdOptions: CommandOptions) => {
  try {
    await setToken()
    await checkCurrentProject(cmdOptions)
    const { namespace, repo } = cmdOptions.currentRepo
    const merges = await listMergeRequests(`${namespace}/${repo}`)
    if (merges.length) {
      const merge = await promptMergeRequestSelection(repo, merges)
      await handleSuccess('merges:list', merge)
    } else {
      throw new NoMergeRequestError()
    }
  } catch (err) {
    await handleError(err, 'pulls:list')
  }
}
