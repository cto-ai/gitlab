import { sdk, ux } from '@cto.ai/sdk'
import * as fs from 'fs-extra'
import * as path from 'path'
import simplegit from 'simple-git/promise'
import {
  getUser,
  createLabels,
  listNamespaces,
  createProject,
  setToken,
} from '../utils/apiCalls'
import { GitLabNamespaceRes } from '../types/GitLabRes'
import { getProjectInfoFromUser } from '../prompts/project:create'
import {
  saveProjectToConfig,
  insertTokenInUrl,
  pExec,
  setupGPGKey,
} from '../utils/helpers'
import { LABELS } from '../constants'
import { handleError } from '../errors'
import { handleSuccess } from '../utils/success'

export const projectCreate = async ({ accessToken }) => {
  try {
    await setupGPGKey()
    await setToken()
    const orgs: GitLabNamespaceRes[] = await listNamespaces()
    const { username } = await getUser()
    const answers = await getProjectInfoFromUser(orgs, username)

    sdk.log('')
    ux.spinner.start('Creating project')
    const {
      name,
      http_url_to_repo,
      path_with_namespace,
      namespace: { full_path },
      id,
    } = await createProject(answers)

    // add labels to the repo
    await createLabels(path_with_namespace, Object.values(LABELS))

    // clone repo
    const urlWithToken = insertTokenInUrl(
      http_url_to_repo,
      accessToken,
      username,
    )
    try {
      await simplegit().clone(urlWithToken, name)
    } catch (err) {
      await handleError(err, 'repo clone')
    }

    // set config
    saveProjectToConfig(full_path, name, username, id)
    await fs.ensureDir(`${name}`)

    // copies select template files
    const issueSrc = path.resolve(__dirname, '../templates/issues')
    const issueDest = path.resolve(
      process.cwd(),
      `${name}/.gitlab/ISSUE_TEMPLATE`,
    )
    await fs.copy(issueSrc, issueDest)
    const gitignoreSrc = path.resolve(__dirname, '../templates/gitignore')
    const gitignoreDest = path.resolve(process.cwd(), name)
    await fs.copy(gitignoreSrc, gitignoreDest)
    await pExec(
      `cd "${name}" && git add . && git commit --allow-empty -m 'Initial commit' && git push origin master`,
    )
    await handleSuccess('project:create', { name })
  } catch (err) {
    ux.spinner.stop(`${ux.colors.red('failed!')}\n`)
    await handleError(err, 'project:create')
  }
}
