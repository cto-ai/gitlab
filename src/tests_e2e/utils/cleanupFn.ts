import { pExec } from '../../utils/helpers'
import { sdk } from '@cto.ai/sdk'
import { deleteProject, getUser } from '../../utils/apiCalls'

const cleanRepoCreate = async () => {
  try {
    const { username } = await getUser()
    await deleteProject(`${username}/a`)
    await pExec('rm -rf ./a')
  } catch (err) {
    console.error({ err })
  }
}

const cleanRemoteRepoInConfig = async () => {
  try {
    const configPath = await sdk.getConfigPath()
    await pExec(`rm -rf ${configPath}`)
  } catch (err) {
    console.error({ err })
  }
}

const cleanRepoClone = async () => {
  try {
    await pExec('rm -rf ./testgh')
    await cleanRemoteRepoInConfig()
  } catch (err) {
    console.error({ err })
  }
}
const cleanIssueCreate = async () => {
  try {
    process.chdir('../')
    await cleanRepoCreate()
  } catch (err) {
    console.error({ err })
  }
}

const cleanIssueStart = async () => {
  try {
    await cleanRepoCreate()
  } catch (err) {
    console.error({ err })
  }
}

export const cleanupFn = {
  'project:create': cleanRepoCreate,
  'project:clone': cleanRepoClone,
  'issue:create': cleanIssueCreate,
  'issue:start': cleanIssueStart,
  'config:remote': cleanRemoteRepoInConfig,
  'label:add': cleanIssueCreate,
}
