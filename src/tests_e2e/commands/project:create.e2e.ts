import { run, cleanup, sleep, signin } from '../utils/cmd'
import { GITLAB_TEST_TOKEN } from '../../constants'
import { ENTER, A } from '../utils/constants'
import { setConfig } from '../../utils/config'
import { getUser, getProject, setToken } from '../../utils/apiCalls'

beforeAll(async () => {
  await signin()
  await setConfig('accessToken', GITLAB_TEST_TOKEN)
})

afterAll(async () => {
  await cleanup('project:create')
})

describe('project:create happy path', () => {
  test(
    'should successfully create project in gitlab',
    async () => {
      await run({
        args: ['project:create'],
        inputs: [ENTER, A, ENTER, A, ENTER, ENTER, ENTER],
        timeout: 10000,
      })
      await setToken()
      const { username } = await getUser()
      const { name } = await getProject(`${username}/a`)
      expect(name).toEqual('a')
    },
    5000 * 60 * 3,
  )
})
