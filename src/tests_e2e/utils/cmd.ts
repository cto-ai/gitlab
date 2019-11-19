import { spawn, ChildProcess, SpawnOptions } from 'child_process'
import { cleanupFn } from './cleanupFn'
import { sdk } from '@cto.ai/sdk'
import Debug from 'debug'
import concat from 'concat-stream'

import {
  OP_NAME,
  OP_PATH,
  TEAM_NAME_IDENTIFIER,
  EXISTING_USER_NAME,
  EXISTING_USER_PASSWORD,
} from './constants'
import { pExec } from '../../utils/helpers'

const debugVerbose = Debug('cmd:verbose')

const defaultEnv = {
  NODE_ENV: 'test',
}

const setEnv = (
  defaultEnv: NodeJS.ProcessEnv,
  processEnv: NodeJS.ProcessEnv,
) => {
  return { ...defaultEnv, ...processEnv }
}

interface cmdObj {
  args: string[]
  inputs?: string[]
  timeout?: number
  command?: string
  options?: SpawnOptions
}

async function run({
  args = [],
  inputs = [],
  timeout = 5000,
  command = OP_PATH,
  options = {},
}: cmdObj): Promise<any> {
  const env = setEnv(defaultEnv, process.env)
  const childProcess = spawn(command, ['run', OP_NAME, ...args], {
    env,
    ...options,
  })

  if (inputs.length > 0) {
    sendInput(inputs, childProcess, timeout)
  }

  return new Promise(resolve => {
    // to enable verbose logs set DEBUG=cmd*
    childProcess.stderr.on('data', errChunk => {
      debugVerbose(errChunk.toString())
    })

    childProcess.stdout.on('data', chunk => {
      debugVerbose(chunk.toString())
    })

    childProcess.stdout.pipe(
      concat((buffer: Buffer) => {
        const result = buffer.toString()

        resolve(result)
      }),
    )
  })
}

const sendInput = function(
  inputs: string[],
  child: ChildProcess,
  timeout: number,
) {
  if (!inputs.length) {
    return child.stdin.end()
  }

  const [firstInput, ...remainingInputs] = inputs

  setTimeout(() => {
    try {
      if (child.stdin.writable) {
        child.stdin.write(firstInput)
      }
    } catch (error) {
      console.log('%O', error)
    }

    sendInput(remainingInputs, child, timeout)
  }, timeout)
}

const resetConfig = async () => {
  try {
    const config = await sdk.getConfigPath()
    await pExec(`rm -rf ${config}`)
  } catch (err) {
    console.error(err)
  }
}

const cleanup = async (command: string) => {
  try {
    await cleanupFn[command]()
    console.log('cleanup endpoint hit successfully')
  } catch (err) {
    console.error({ err })
  }
}

const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(() => resolve(), milliseconds))
}

const signin = async (
  user: string = EXISTING_USER_NAME,
  password: string = EXISTING_USER_PASSWORD,
) => {
  {
    return await pExec(`${OP_PATH} account:signin -u ${user} -p ${password}`)
  }
}

const signout = async () => {
  return await pExec(`${OP_PATH} account:signout`)
}

export { run, sleep, cleanup, signin, signout, resetConfig }
