import { sdk } from '@cto.ai/sdk'
import { GITLAB_TEST_TOKEN } from '../../constants'
import { setToken, getUser, listLabels } from '../../utils/apiCalls'
import { resetConfig, run, cleanup } from '../utils/cmd'
import { A, ENTER } from '../utils/constants'

beforeAll(async () => {
  await resetConfig()
  await sdk.setConfig('accessToken', GITLAB_TEST_TOKEN)
})

afterAll(async () => {
  await cleanup('label:add')
})

describe('label:add happy path', () => {
  test('should add in a label', async () => {
    await run({
      args: ['project:create'],
      inputs: [ENTER, A, ENTER, A, ENTER, ENTER, ENTER],
      timeout: 8000,
    })
    await setToken()
    const { username } = await getUser()
    const originalLabels = await listLabels(`${username}/a`)
    process.chdir('a')
    await run({
      args: ['label:add'],
      inputs: [A, ENTER, A, ENTER, A, A, A, A, A, A, ENTER],
      timeout: 5000,
    })
    const labels = await listLabels(`${username}/a`)
    expect(labels.length).toBeGreaterThan(originalLabels.length)
  })
})
