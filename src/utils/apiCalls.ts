import axios from 'axios'
import { API_URL } from '../constants/index'
import { getConfig } from './config'
import { handleError } from '../errors'
import { ProjectLabel, LabelEdit } from '../types/Labels'
import {
  GitLabLabelRes,
  GitLabUserRes,
  GitLabNamespaceRes,
  GitLabProjectRes,
  GitLabIssueRes,
  GitLabMemberRes,
} from '../types/GitLabRes'
import { AnsProjectCreate } from '../types/Answers'

export const setToken = async () => {
  const accessToken = await getConfig('accessToken')
  axios.defaults.baseURL = API_URL
  axios.defaults.headers.common['Private-Token'] = accessToken
  axios.defaults.headers.post['Content-Type'] =
    'application/x-www-form-urlencoded'
  await getUser()
}

const formatProjectPath = (projectPath: string): string =>
  projectPath.replace(/\//g, '%2F')

export const getUser = async (): Promise<GitLabUserRes> => {
  try {
    const { data } = await axios.get('/user')
    return data
  } catch (err) {
    await handleError(err, 'getUser()')
  }
}

export const getProject = async (
  projectPath: string | number,
): Promise<GitLabProjectRes> => {
  const projectId =
    typeof projectPath === 'string'
      ? formatProjectPath(projectPath)
      : projectPath
  try {
    const { data } = await axios.get(`/projects/${projectId}`)
    return data
  } catch (err) {
    await handleError(err, 'getProject()')
  }
}

export const getIssue = async (projectPath: string, issue_iid: number) => {
  const projectId = formatProjectPath(projectPath)

  try {
    const { data } = await axios.get(
      `/projects/${projectId}/issues/${issue_iid}`,
    )
    return data
  } catch (err) {
    await handleError(err, 'getIssue()')
  }
}

export const getAllIssues = async (): Promise<GitLabIssueRes[]> => {
  try {
    const { data } = await axios.get('/issues', {
      params: {
        state: 'opened',
        per_page: 100,
        scope: 'all',
      },
    })
    return data
  } catch (err) {
    await handleError(err, 'getAllIssues()')
  }
}

export const listNamespaces = async (): Promise<GitLabNamespaceRes[]> => {
  try {
    const { data } = await axios.get('/namespaces')
    return data
  } catch (err) {
    await handleError(err, 'list Orgs')
  }
}

export const listProjects = async (): Promise<GitLabProjectRes[]> => {
  try {
    const { data } = await axios({
      method: 'get',
      url: '/projects',
      params: {
        membership: true,
        per_page: 100,
      },
    })
    return data
  } catch (err) {
    await handleError(err, 'list Projects')
  }
}

export const enableProjectIssues = async (
  projectPath: string,
): Promise<void> => {
  const projectId = formatProjectPath(projectPath)

  try {
    await axios.put(`/projects/${projectId}`, {
      issues_access_level: 'enabled',
    })
  } catch (err) {
    await handleError(err, 'enableProjectIssues()')
  }
}

export const createProject = async ({
  namespace,
  name,
  description,
  privateOrPublic,
}: AnsProjectCreate) => {
  const options = {
    namespace_id: namespace,
    name,
    description,
    visibility: privateOrPublic,
    issues_access_level: 'enabled',
  }

  try {
    const { data } = await axios.post('/projects', options)
    return data
  } catch (err) {
    await handleError(err, 'createProject()')
  }
}

export const deleteProject = async (projectPath: string) => {
  const projectId = formatProjectPath(projectPath)
  try {
    await axios.delete(`/projects/${projectId}`)
  } catch (err) {
    await handleError(err, 'deleteProject', '', projectPath)
  }
}

export const createLabels = async (
  projectPath: string,
  labels: ProjectLabel[],
): Promise<void[]> => {
  const projectId = formatProjectPath(projectPath)

  return await Promise.all(
    labels.map(async label => {
      const { name } = label
      try {
        await axios.post(`/projects/${projectId}/labels`, label)
      } catch (err) {
        await handleError(err, 'createLabels()', name, projectPath)
      }
    }),
  )
}

export const createGroupLabels = async (
  projectPath: string,
  labels: ProjectLabel[],
): Promise<void[]> => {
  const projectId = formatProjectPath(projectPath)

  return await Promise.all(
    labels.map(async label => {
      const { name } = label
      try {
        await axios.post(`/groups/${projectId}/labels`, label)
      } catch (err) {
        await handleError(err, 'createGroupLabels()', name, projectPath)
      }
    }),
  )
}

export const listLabels = async (projectPath: string): Promise<any> => {
  const projectId = formatProjectPath(projectPath)

  try {
    const { data } = await axios.get(`/projects/${projectId}/labels`, {
      params: { per_page: 100 },
    })
    return data
  } catch (err) {
    await handleError(err, 'listLabels()', '', projectId)
  }
}

export const editProjectLabel = async (
  projectPath: string,
  oldLabel: LabelEdit,
  newLabel: ProjectLabel,
): Promise<void> => {
  const projectId = formatProjectPath(projectPath)
  const { id, name } = oldLabel
  const { color, description } = newLabel

  const formattedNewLabel = {
    new_name: newLabel.name,
    label_id: id,
    color: `#${color}`,
    description,
  }
  try {
    await axios.put(`/projects/${projectId}/labels/`, formattedNewLabel)
  } catch (err) {
    await handleError(err, 'editProjectLabel()', name, projectPath)
  }
}

export const editGroupLabel = async (
  namespace: string,
  oldLabel: LabelEdit,
  newLabel: ProjectLabel,
): Promise<void> => {
  const formattedNamespace = formatProjectPath(namespace)
  const { id, name } = oldLabel
  const { color, description } = newLabel

  const formattedNewLabel = {
    name: newLabel.name,
    label_id: id,
    color: `#${color}`,
    description,
  }
  try {
    await axios.put(`/groups/${formattedNamespace}/labels/`, formattedNewLabel)
  } catch (err) {
    await handleError(err, 'editProjectLabel()', name, namespace)
  }
}

export const deleteProjectLabel = async (
  projectPath: string,
  labelId: number,
) => {
  const projectId = formatProjectPath(projectPath)

  try {
    await axios.delete(`/projects/${projectId}/labels/`, {
      params: { label_id: labelId },
    })
  } catch (err) {
    await handleError(err, 'deleteProjectLabel()', '', projectPath)
  }
}

export const deleteGroupLabel = async (namespace: string, labelId: number) => {
  const formattedNamespace = formatProjectPath(namespace)

  try {
    await axios.delete(`/groups/${formattedNamespace}/labels/`, {
      params: { label_id: labelId },
    })
  } catch (err) {
    await handleError(err, 'deleteGroupLabel()', '', namespace)
  }
}

export const createMergeRequest = async (
  projectPath: string,
  title: string,
  description: string,
  labels: string[],
  assignees: number[],
  source_branch: string,
  resolveStr: string,
) => {
  const projectId = formatProjectPath(projectPath)

  try {
    const { data } = await axios.post(`/projects/${projectId}/merge_requests`, {
      title,
      source_branch,
      target_branch: 'master',
      description: `${resolveStr}${description}`,
      labels: labels.join(','),
      assignee_ids: assignees,
    })
    return data
  } catch (err) {
    await handleError(err, 'createMR()')
  }
}

export const listMergeRequests = async (projectPath: string) => {
  const projectId = formatProjectPath(projectPath)

  try {
    const { data } = await axios.get(`/projects/${projectId}/merge_requests`, {
      params: { state: 'opened', per_page: 100 },
    })
    return data
  } catch (err) {
    await handleError(err, 'listMergeRequests()')
  }
}

export const createIssue = async (
  projectPath: string,
  title: string,
  description: string,
  labels: string[],
) => {
  const projectId = formatProjectPath(projectPath)

  try {
    const { data } = await axios.post(`/projects/${projectId}/issues`, {
      title,
      description,
      labels: labels.join(','),
    })
    return data
  } catch (err) {
    await handleError(err, 'createIssue()')
  }
}

export const assignIssue = async (
  projectPath: string,
  iid: number,
  userId: number,
) => {
  const projectId = formatProjectPath(projectPath)

  try {
    await axios.put(`/projects/${projectId}/issues/${iid}`, {
      assignee_ids: [userId],
    })
  } catch (err) {
    await handleError(err, 'assignIssue()')
  }
}

export const editIssueLabels = async (
  projectPath: string,
  iid: number,
  labels: string[],
  labelToRemove: string,
  labelToAdd: string,
) => {
  const projectId = formatProjectPath(projectPath)

  const newLabels = labels.filter(label => label !== labelToRemove)
  newLabels.push(labelToAdd)
  try {
    const { data } = await axios.put(`/projects/${projectId}/issues/${iid}`, {
      labels: newLabels.join(','),
    })
    return data
  } catch (err) {
    await handleError(err, 'editIssueLabels()', '', projectPath)
  }
}

export const listIssueForProject = async (
  projectPath: string,
): Promise<GitLabIssueRes[]> => {
  const projectId = formatProjectPath(projectPath)

  try {
    const { data } = await axios.get(`/projects/${projectId}/issues`, {
      params: { state: 'opened', per_page: 100 },
    })
    return data
  } catch (err) {
    await handleError(err, 'listIssueForProject', '', projectPath)
  }
}

export const listMembersForProject = async (
  projectPath: string,
): Promise<GitLabMemberRes[]> => {
  const projectId = formatProjectPath(projectPath)

  try {
    const { data } = await axios.get(`/projects/${projectId}/members`)
    return data
  } catch (err) {
    await handleError(err, 'listMembersForProject()', '', projectPath)
  }
}

export const listAssignees = async (projectPath: string) => {
  const projectId = formatProjectPath(projectPath)

  try {
    const { data } = await axios.get(`/projects/${projectId}/issues`)
    let assignees = []
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].assignees.length; j++) {
        if (!assignees.includes(JSON.stringify(data[i].assignees[j]))) {
          assignees.push(JSON.stringify(data[i].assignees[j]))
        }
      }
    }

    return assignees
  } catch (err) {
    await handleError(err, 'listAssignees()', '', projectId)
  }
}

export const listMilestones = async (projectPath: string) => {
  const projectId = formatProjectPath(projectPath)

  try {
    const { data } = await axios.get(`/projects/${projectId}/issues`)
    let milestones = []
    for (let i = 0; i < data.length; i++) {
      if (!milestones.includes(JSON.stringify(data[i].milestone))) {
        milestones.push(JSON.stringify(data[i].milestone))
      }
    }

    return milestones
  } catch (err) {
    await handleError(err, 'listMilestones()', '', projectId)
  }
}

export const searchIssues = async (projectPath: string, query: Object) => {
  const projectId = formatProjectPath(projectPath)

  try {
    const { data } = await axios.get(`/projects/${projectId}/issues`, {
      params: query,
    })

    return data
  } catch (err) {
    await handleError(err, 'searchIssues()', '', projectId)
  }
}
