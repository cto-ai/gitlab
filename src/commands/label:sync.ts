import { ux, sdk } from '@cto.ai/sdk'
import {
  listProjects,
  listLabels,
  createLabels,
  setToken,
} from '../utils/apiCalls'
import { formatProjectList } from '../utils/helpers'
import { handleError } from '../errors'
import {
  ProjectWithLabelsToAdd,
  LabelList,
  ProjectLabel,
} from '../types/Labels'
import { getBaseProject, selectProjectsToSync } from '../prompts/label:sync'
import { GitLabLabelRes } from '../types/GitLabRes'
import { NoSyncProjectsError } from '../errors/classes'
import { handleSuccess } from '../utils/success'

const compareLabels = (
  baseList: LabelList[],
  syncList: LabelList[],
): ProjectLabel[] => {
  const labels: ProjectLabel[] = []
  const baseName = baseList.map(label => label.name)
  const syncName = syncList.map(label => label.name)
  baseName.forEach(label => {
    if (!syncName.includes(label)) {
      const labelToAdd = baseList.find(labelObj => label === labelObj.name)
      labels.push(labelToAdd.value)
    }
  })
  return labels
}

const formatList = (labels: GitLabLabelRes[]): LabelList[] => {
  return labels.map(label => {
    const { name, description, color } = label
    return {
      name: `${name}`,
      value: {
        name,
        description,
        color,
      },
    }
  })
}

export const labelSync = async () => {
  await setToken()
  const labelList: ProjectWithLabelsToAdd[] = []
  try {
    const projects = await listProjects()
    const formattedProjects = formatProjectList(projects)
    const baseProject = await getBaseProject(formattedProjects)
    const syncProjects = await selectProjectsToSync(
      formattedProjects,
      baseProject,
    )
    if (!syncProjects.length) {
      throw new NoSyncProjectsError()
    }
    const { name, namespace } = formattedProjects.find(
      project => `${project.namespace}/${project.name}` === baseProject,
    )

    const baseProjectLabelList = await listLabels(`${namespace}/${name}`)
    const formattedBaseProjectList = formatList(baseProjectLabelList)
    // Check and consolidate all labels that needed to be added
    sdk.log('⚙️ Finding labels that needs to be added!')
    await Promise.all(
      syncProjects.map(async project => {
        try {
          const projectLabelList = await listLabels(
            `${project.namespace}/${project.name}`,
          )
          const formattedLabelList = formatList(projectLabelList)
          const labelsToAdd = compareLabels(
            formattedBaseProjectList,
            formattedLabelList,
          )
          return await labelList.push({
            project,
            labels: labelsToAdd,
          })
        } catch (err) {
          await handleError(err, 'getAllLabelsForRepo()')
        }
      }),
    )
    // Take missing labels and add them in
    try {
      await Promise.all(
        labelList.map(async ({ project, labels }) => {
          const { name, namespace } = project
          if (labels.length > 0) {
            const labelStr = labels.map(
              label => `${ux.colors.hex(label.color)(label.name)}`,
            )
            sdk.log(
              `🏃 Adding labels: ${labelStr.join(
                ', ',
              )} to ${namespace}/${name}.`,
            )
          } else {
            sdk.log(
              `${namespace}/${name} already has labels synced with base repo!`,
            )
          }
          await createLabels(`${namespace}/${name}`, labels)
        }),
      )
    } catch (err) {
      await handleError(err, 'createLabels()')
    }
    await handleSuccess('label:sync', {})
  } catch (err) {
    await handleError(err, 'label:sync')
  }
}
