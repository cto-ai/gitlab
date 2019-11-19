import { CommandOptions } from '../types/Config'
import { checkCurrentProject } from '../utils/helpers'
import { handleError } from '../errors'
import { listLabels, setToken } from '../utils/apiCalls'
import { labelSelection } from '../prompts/label:remove'
import { handleSuccess } from '../utils/success'

export const labelRemove = async (cmdOptions: CommandOptions) => {
  try {
    await setToken()
    await checkCurrentProject(cmdOptions)
    const {
      currentRepo: { namespace, repo },
    } = cmdOptions
    const labels = await listLabels(`${namespace}/${repo}`)
    const labelToDelete = await labelSelection(labels, namespace)
    await handleSuccess('label:remove', { ...labelToDelete, namespace, repo })
  } catch (err) {
    await handleError(err, 'labelRemove()')
  }
}
