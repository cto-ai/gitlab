const parse = require('parse-git-config')
import { promisify } from 'util'
import { exec } from 'child_process'
import { sdk, ux } from '@cto.ai/sdk'
import { getUser, getProject } from './apiCalls'
import { GITLAB_URL, GPG_KEY, GPG_PASSPHRASE } from '../constants'
import { getConfig, setConfig } from './config'
import { handleError } from '../errors'
import { RemoteProject, Project } from '../types/Projects'
import { CommandOptions } from '../types/Config'
import { GitLabProjectRes } from '../types/GitLabRes'

export const pExec = promisify(exec)

const { actionBlue, callOutCyan, multiPurple, primary, secondary } = ux.colors

const getTable = async commands => {
  const data = Object.keys(commands).map(item => {
    return {
      name: ` ${callOutCyan(item)}`,
      description: `  ${secondary(commands[item].description)}`,
    }
  })
  await ux.table(
    data,
    {
      name: {},
      description: {},
    },
    {
      'no-header': true,
    },
  )
}

export const logProvideCmdMsg = async commands => {
  const msgPre = `\n☝️  ${primary(
    `Please provide a valid command to run gitlab op:\n👉 ${multiPurple(
      'ops run gitlab <command>',
    )}`,
  )}\n\n${actionBlue(`Here's a list of all the commands that we support →`)}\n`
  const msgPost = `\n➡️  Try cloning a project using ${multiPurple(
    'ops run gitlab project:clone',
  )} to get started!\n`
  sdk.log(msgPre)
  // ux.table returns void but console logs the table
  await getTable(commands)
  sdk.log(msgPost)
}

//TODO: fix remoteRepo entries => don't keep adding new ones if already exists
/**
 * save project to config
 * @param namespace project namespace
 * @param name project name
 * @param username GitLab username
 * @param id project id
 */
export const saveProjectToConfig = async (
  namespace: string,
  name: string,
  username: string,
  id: number,
): Promise<string> => {
  try {
    const oldRemoteRepos = (await getConfig('remoteRepos')) || []
    const accessToken = await getConfig('accessToken')
    const url = `https://${username}:${accessToken}@${GITLAB_URL}/${namespace}/${name}.git`
    const remoteRepos = [
      ...oldRemoteRepos,
      {
        namespace,
        repo: name,
        url,
        id,
      },
    ]
    await setConfig('remoteRepos', remoteRepos)
    return url
  } catch (err) {
    handleError(err, 'saveRemoteRepoToConfig()')
  }
}

/**
 * Insert token in github url
 * @param {string} repoUrl
 * @param {string} token
 * @param {string} username
 * @returns url with token
 */
export const insertTokenInUrl = (
  repoUrl: string,
  token: string,
  username: string,
): string => {
  const pos = 8 // insert token after https://
  return `${repoUrl.slice(0, pos)}${username}:${token}@${repoUrl.slice(pos)}`
}

// execute git clone
export const cloneProject = async urlWithToken => {
  try {
    await pExec(`git clone ${urlWithToken}`)
  } catch (err) {
    await handleError(err, 'cloneRepo()')
  }
}

/**
 * Finds if the repo is cloned or not
 * @param {string} namespace
 * @param {string} projectName
 * @param {RemoteProject[]} remoteProjects
 * @returns {boolean}
 */
export const isProjectCloned = (
  namespace: string,
  projectName: string,
  remoteProjects: RemoteProject[],
): boolean => {
  for (let item of remoteProjects) {
    if (item.namespace === namespace && item.repo === projectName) return true
  }
  return false
}

const PROJECT_NAMESPACE_REGEX = /(?<=\/|:0-9*|@[a-z]+\.[a-z]+:)[a-z0-9A-Z-/]+(?=\/.+\.git)/g
const PROJECT_NAME_REGEX = /(?<=\/)[a-zA-Z0-9-]+(?=\.git)/g

export const filterForProjectInfo = (url: string) => {
  const projectNamespaceMatch = url.match(PROJECT_NAMESPACE_REGEX)
  const projectNameMatch = url.match(PROJECT_NAME_REGEX)
  if (projectNamespaceMatch && projectNameMatch) {
    return {
      namespace: projectNamespaceMatch[0],
      repo: projectNameMatch[0],
    }
  } else {
    sdk.log(
      `❗️ Failed to parse gitconfig for project info! Please make sure the project's remote "origin" is set to a valid GitLab project!`,
    )
    process.exit()
  }
}

export const checkCurrentProject = async (cmdOptions: CommandOptions) => {
  const { actionBlue } = ux.colors
  const { accessToken, currentRepo } = cmdOptions
  if (!accessToken) {
    sdk.log(
      `🤔 It seems like you have not configured your GitLab access token. Please run ${actionBlue(
        'token:update',
      )} to set your access token!`,
    )
    process.exit()
  }
  if (!currentRepo) {
    try {
      const gitconfig = await parse()
      const originUrl = gitconfig['remote "origin"'].url
      if (!originUrl.includes(GITLAB_URL)) {
        sdk.log(
          `❗ This repo's remote "origin" is not currently set for a GitLab project`,
        )
        process.exit()
      } else {
        const { namespace, repo } = filterForProjectInfo(originUrl)
        const { username } = await getUser()
        const { id } = await getProject(`${namespace}/${repo}`)
        const url = await saveProjectToConfig(namespace, repo, username, id)
        await pExec(`git remote set-url origin ${url}`)
        cmdOptions.currentRepo = { namespace, repo, url }
      }
    } catch (err) {
      await handleError(err, 'checkForRepo()')
    }
  }
}

export const setupGPGKey = async () => {
  sdk.log('⚙️ Checking to see if you have a GPG key set...')
  if (GPG_KEY) {
    try {
      ux.spinner.start('🏃 Setting up GPG key')
      await pExec(
        'echo -e $GPG_KEY > PRIVATE_GPG_KEY.asc && gpg --batch --pinentry-mode loopback --import PRIVATE_GPG_KEY.asc',
      )
      await pExec(
        `echo "test" | gpg --clearsign --passphrase=${GPG_PASSPHRASE}  --pinentry-mode loopback --no-tty`,
      )
      await pExec('rm -rf PRIVATE_GPG_KEY.asc')
      ux.spinner.stop('✅')
    } catch (err) {
      ux.spinner.stop('Failed ❌')
      await handleError(err, 'GPG key import failed.')
    }
  } else {
    sdk.log('No GPG key set, commits will not be signed with GPG!')
  }
}

export const checkIfGroupProject = async ({
  namespace,
  repo,
}: RemoteProject) => {
  const data = await getProject(`${namespace}/${repo}`)
  const { web_url } = data.namespace
  return web_url.includes('group') ? true : false
}

export const formatProjectList = (projects: GitLabProjectRes[]): Project[] => {
  return projects.map(project => {
    const {
      path,
      namespace: { full_path },
      id,
    } = project
    return {
      name: path,
      namespace: full_path,
      id,
    }
  })
}

export const hasIssueEnabled = async (projectPath: string) => {
  const { issues_enabled } = await getProject(projectPath)
  return issues_enabled
}

export const accessLevelConvert = (accessLevel: number) => {
  switch (accessLevel) {
    case 10:
      return 'Guest'
    case 20:
      return 'Reporter'
    case 30:
      return 'Developer'
    case 40:
      return 'Maintainer'
    case 50:
      return 'Owner'
  }
}
