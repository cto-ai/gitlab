import { AutoCompleteQuestion } from '@cto.ai/inquirer'
import { AnsProjectCloneSelect } from '../types/Answers'
import { getConfig } from '@cto.ai/sdk/dist/sdk'
import { listProjects } from '../utils/apiCalls'
import { isProjectCloned } from '../utils/helpers'
import { sdk, ux } from '@cto.ai/sdk'

const formatList = async () => {
  const remoteProjects = (await getConfig('remoteRepos')) || []
  const projectList = await listProjects()
  const formattedProjects = projectList.map(project => {
    const {
      path_with_namespace,
      http_url_to_repo,
      namespace: { full_path },
      path,
      id,
    } = project
    if (isProjectCloned(full_path, path, remoteProjects)) {
      return {
        name: `🤖 ${path_with_namespace}`,
        value: {
          name: path,
          url: http_url_to_repo,
          namespace: full_path,
          id,
        },
      }
    }
    return {
      name: path_with_namespace,
      value: {
        name: path,
        url: http_url_to_repo,
        namespace: full_path,
        id,
      },
    }
  })
  return formattedProjects
}

export const selectProject = async () => {
  const projectList = await formatList()
  const list: AutoCompleteQuestion<AnsProjectCloneSelect> = {
    type: 'autocomplete',
    name: 'project',
    pageSize: 7,
    message:
      'Select a project to clone. Projects with 🤖 are already cloned.\n',
    // @ts-ignore TS2322, autocomplete will accept
    autocomplete: projectList,
    bottomContent: '',
  }
  const { project } = await ux.prompt<AnsProjectCloneSelect>(list)
  const { name, namespace } = project
  const remoteProjects = (await getConfig('remoteRepos')) || []
  if (isProjectCloned(namespace, name, remoteProjects)) {
    sdk.log(`\n ❌ You have already cloned this repo!`)
    process.exit()
  }
  return project
}
