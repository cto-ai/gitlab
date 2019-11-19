import { run, cleanup, resetConfig, signin } from '../utils/cmd'
import { ENTER, A, Q, N, COLON } from '../utils/constants'
import { pExec } from '../../utils/helpers'
import { listMergeRequests, setToken, getUser } from '../../utils/apiCalls'
import { setConfig } from '@cto.ai/sdk/dist/sdk'
import { GITLAB_TEST_TOKEN } from '../../constants'

beforeAll(async () => {
  await signin()
  await resetConfig()
  await setConfig('accessToken', GITLAB_TEST_TOKEN)
  await setToken()
})

afterAll(async () => {
  await cleanup('config:remote')
  await cleanup('project:create')
})

describe('issue:done happy path', () => {
  test(
    'should create merge request',
    async () => {
      await run({
        args: ['project:create'],
        inputs: [ENTER, A, ENTER, A, ENTER, ENTER, ENTER],
        timeout: 8000,
      })

      process.chdir('a')

      await run({
        args: ['issue:create'],
        inputs: [A, ENTER, ENTER, ENTER, COLON, Q, ENTER, ENTER],
        timeout: 8000,
      })

      await run({
        args: ['issue:start'],
        inputs: [ENTER],
        timeout: 5000,
      })

      await pExec('touch helloworld')

      await run({
        args: ['issue:save'],
        inputs: [A, ENTER],
        timeout: 5000,
      })

      await run({
        args: ['issue:done'],
        inputs: [A, ENTER, A, ENTER, N, ENTER],
        timeout: 8000,
      })
      process.chdir('../')
      const { username } = await getUser()
      const merge = await listMergeRequests(`${username}/a`)
      expect(merge.length).toBeGreaterThan(0)
    },
    1000 * 180 * 3,
  )
})
