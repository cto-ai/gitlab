import {
  cloneProject,
  insertTokenInUrl,
  saveProjectToConfig,
} from '../utils/helpers'
import { handleError } from '../errors'
import { selectProject } from '../prompts/project:clone'
import { getUser, setToken } from '../utils/apiCalls'
import { handleSuccess } from '../utils/success'

export const projectClone = async options => {
  try {
    await setToken()
    const { username } = await getUser()
    const { name, namespace, url } = await selectProject()
    const urlWithToken = await insertTokenInUrl(
      url,
      options.accessToken,
      username,
    )
    await cloneProject(urlWithToken)
    await saveProjectToConfig(namespace, name, username)
    await handleSuccess('project:clone', { name })
  } catch (err) {
    await handleError(err, 'project:clone')
  }
}
