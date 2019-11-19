import { run, cleanup, signin } from '../utils/cmd'
import { ENTER, T, G, H } from '../utils/constants'
import { setConfig } from '../../utils/config'
import { GITLAB_TEST_TOKEN } from '../../constants'

beforeAll(async () => {
  await signin()
  await setConfig('accessToken', GITLAB_TEST_TOKEN)
})

afterAll(async () => {
  await cleanup('project:clone')
})

describe('project:clone happy path', () => {
  test(
    'should successfully clone project from GitLab',
    async () => {
      const result = await run({
        args: ['project:clone'],
        inputs: [T, G, H, ENTER, ENTER],
        timeout: 5000,
      })

      await expect(result).toContain('Successfully cloned project!')
    },
    1000 * 60 * 3,
  )
})
