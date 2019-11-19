import { ux } from '@cto.ai/sdk'
import { AutoCompleteQuestion, Question } from '@cto.ai/inquirer'
import { AnsBaseProject, AnsSyncProjects } from '../types/Answers'
import { Project } from '../types/Projects'

export const getBaseProject = async (projectList: Project[]) => {
  const formattedProjectList = projectList.map(
    project => `${project.namespace}/${project.name}`,
  )
  const selectBaseRepoPrompt: AutoCompleteQuestion<AnsBaseProject> = {
    type: 'autocomplete',
    name: 'baseProject',
    message: 'Please select the base project that you want to sync to.',
    autocomplete: formattedProjectList,
  }
  const { baseProject } = await ux.prompt<AnsBaseProject>(selectBaseRepoPrompt)
  return baseProject
}

export const selectProjectsToSync = async (
  projectList: Project[],
  baseProject: string,
): Promise<Project[]> => {
  const filteredProjectList = projectList.filter(
    project => `${project.namespace}/${project.name}` !== baseProject,
  )
  const question: Question<AnsSyncProjects> = {
    type: 'checkbox',
    name: 'syncProjects',
    message: 'Select the projects you wish to sync the labels of.',
    choices: filteredProjectList.map(project => {
      return {
        name: `${project.namespace}/${project.name}`,
        value: {
          name: project.name,
          namespace: project.namespace,
        },
      }
    }),
  }
  const { syncProjects } = await ux.prompt<AnsSyncProjects>(question)
  return syncProjects
}
