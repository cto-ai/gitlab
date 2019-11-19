const parse = require('parse-git-config')
import { asyncPipe } from './utils/asyncPipe'
import { getConfig } from './utils/config'
import { updateAccessToken } from './commands/token:update'
import { logProvideCmdMsg } from './utils/helpers'
import { sdk } from '@cto.ai/sdk'
import { handleError } from './errors'
import { commands, GITLAB_TEST_TOKEN } from './constants'
import { setConfig } from '@cto.ai/sdk/dist/sdk'

type Pipeline = {
  args: string[]
  currentRepo: any
}

const shouldSkipTokenAuthentication = (args: string[]): boolean =>
  !!args &&
  !!args[0] &&
  !!commands[args[0]] &&
  !!commands[args[0]].skipTokenAuthentication

const parseArguments = async (): Promise<Partial<Pipeline>> => {
  const args = sdk.yargs.argv

  if (!args._.length) {
    // log user friendly message when user does not provide a command
    await logProvideCmdMsg(commands)
    process.exit()
  }

  return { args: args._ }
}

const checkAccessToken = async ({
  args,
}: Partial<Pipeline>): Promise<Partial<Pipeline>> => {
  let accessToken = await getConfig('accessToken')
  if (!accessToken && GITLAB_TEST_TOKEN) {
    accessToken = GITLAB_TEST_TOKEN
    await setConfig('accessToken', accessToken)
  } else {
    const skipTokenAuthentication = shouldSkipTokenAuthentication(args)
    if (!skipTokenAuthentication && !accessToken) {
      await updateAccessToken()
    }
  }
  return { args }
}

const getCurrentRepo = async ({
  args,
}: Partial<Pipeline>): Promise<Pipeline> => {
  const remoteRepos = (await getConfig('remoteRepos')) || []
  let currentRepo
  let gitConfig
  gitConfig = await parse()
  if (remoteRepos.length && gitConfig) {
    currentRepo = remoteRepos.find(remoteRepo => {
      return gitConfig['remote "origin"'].url.includes(remoteRepo.url)
    })
  }
  return { args, currentRepo }
}

const runCommand = async ({
  currentRepo,
  ...rest
}: Pipeline): Promise<Pipeline> => {
  try {
    const accessToken = await getConfig('accessToken')
    const remoteRepos = await getConfig('remoteRepos')

    await commands[process.argv[2].toLowerCase()].functionName({
      accessToken,
      currentRepo,
      remoteRepos,
    })
  } catch (err) {
    await handleError(err, process.argv[2])
  }

  return {
    currentRepo,
    ...rest,
  }
}

const main = async () => {
  const mainAsyncPipe = asyncPipe(
    parseArguments,
    checkAccessToken,
    getCurrentRepo,
    runCommand,
  )
  await mainAsyncPipe()
}

main()
