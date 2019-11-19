import { ux, sdk } from '@cto.ai/sdk'
import { CommandOptions } from '../types/Config'
import { checkCurrentProject } from '../utils/helpers'
import { handleError } from '../errors'
import {
  listLabels,
  editProjectLabel,
  editGroupLabel,
  setToken,
} from '../utils/apiCalls'
import { labelSelection, promptLabelEdit } from '../prompts/label:edit'
import { handleSuccess } from '../utils/success'

export const labelEdit = async (cmdOptions: CommandOptions) => {
  try {
    await setToken()
    await checkCurrentProject(cmdOptions)
    const {
      currentRepo: { namespace, repo },
    } = cmdOptions
    const labels = await listLabels(`${namespace}/${repo}`)
    const labelToEdit = await labelSelection(labels, namespace)
    const { name, is_project_label } = labelToEdit
    const newLabel = await promptLabelEdit(labelToEdit)
    if (is_project_label) {
      await editProjectLabel(`${namespace}/${repo}`, labelToEdit, newLabel)
    } else {
      await editGroupLabel(namespace, labelToEdit, newLabel)
    }
    await handleSuccess('label:edit', { name })
  } catch (err) {
    await handleError(err, 'label:edit')
  }
}
