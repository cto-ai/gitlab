import { sdk, ux } from '@cto.ai/sdk'
import { createLabels, createGroupLabels, setToken } from '../utils/apiCalls'
import { promptUserInput, addAsGroupLabel } from '../prompts/label:add'
import { CommandOptions } from '../types/Config'
import { checkCurrentProject, checkIfGroupProject } from '../utils/helpers'
import { handleError } from '../errors'
import { handleSuccess } from '../utils/success'

export const labelAdd = async (cmdOptions: CommandOptions) => {
  try {
    await setToken()
    await checkCurrentProject(cmdOptions)
    const { name, description, color } = await promptUserInput()
    const { namespace, repo } = cmdOptions.currentRepo
    const labelArr = [
      {
        name,
        description,
        color: `#${color}`,
      },
    ]
    const isGroup = await checkIfGroupProject(cmdOptions.currentRepo)
    if (isGroup) {
      const addAsGroup = await addAsGroupLabel(namespace)
      if (addAsGroup) {
        await createGroupLabels(namespace, labelArr)
      } else {
        await createLabels(`${namespace}/${repo}`, labelArr)
      }
    } else {
      await createLabels(`${namespace}/${repo}`, labelArr)
    }
    await handleSuccess('label:add', {
      name,
    })
  } catch (err) {
    await handleError(err, 'label:add')
  }
}
