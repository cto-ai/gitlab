import { run, cleanup, signin } from '../utils/cmd'
import { GITLAB_TEST_TOKEN } from '../../constants'
import { ENTER, A, Q, COLON } from '../utils/constants'
import { setConfig } from '../../utils/config'
import { checkForLocalBranch } from '../../utils/git'
import { setToken } from '../../utils/apiCalls'

beforeAll(async () => {
  await signin()
  await setConfig('accessToken', GITLAB_TEST_TOKEN)
})

afterAll(async () => {
  await cleanup('issue:start')
})
describe('issue:start happy path', () => {
  test(
    'should checkout new branch',
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
        timeout: 10000,
      })

      await run({
        args: ['issue:start'],
        inputs: [ENTER],
        timeout: 10000,
      })
      await setToken()
      const hasLocalBranch = await checkForLocalBranch('1')
      expect(hasLocalBranch).toBeTruthy()
    },
    10000 * 60 * 3,
  )
})
