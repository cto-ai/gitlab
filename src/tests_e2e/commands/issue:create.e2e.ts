import { run, cleanup, resetConfig, signin } from '../utils/cmd'
import { GITLAB_TEST_TOKEN } from '../../constants'
import { ENTER, A, Q, COLON } from '../utils/constants'
import { getUser, getProject, setToken } from '../../utils/apiCalls'
import { sdk } from '@cto.ai/sdk'

beforeAll(async () => {
  await signin()
  await resetConfig()
  await sdk.setConfig('accessToken', GITLAB_TEST_TOKEN)
})

afterAll(async () => {
  await cleanup('issue:create')
})

describe('issue:create happy path', () => {
  test(
    'should successfully create an issue',
    async () => {
      await run({
        args: ['project:create'],
        inputs: [ENTER, A, ENTER, A, ENTER, ENTER, ENTER],
        timeout: 8000,
      })

      process.chdir('a')

      await run({
        args: ['issue:create'],
        inputs: [A, ENTER, ENTER, ENTER, COLON, Q, ENTER],
        timeout: 10000,
      })
      await setToken()
      const { username } = await getUser()
      const { open_issues_count } = await getProject(`${username}/a`)
      expect(open_issues_count).toBeGreaterThan(0)
    },
    2000 * 60 * 3,
  )
})
