import { ux } from '@cto.ai/sdk'
import { Question } from '@cto.ai/inquirer'
import { AnsToken } from '../types/Answers'
import { setConfig } from '../utils/config'
import { handleError } from '../errors'
import { GITLAB_URL } from '../constants/index'
import { handleSuccess } from '../utils/success'

const { actionBlue, multiPurple, reset, white } = ux.colors

export const promptForToken = async () => {
  const question: Question<AnsToken> = {
    type: 'password',
    name: 'token',
    message: `\n${actionBlue(
      '➡️  A GitLab access token is required to run commands. Follow the steps below to create a GitLab access token:',
    )}\n\n${white(
      `• Follow the link below to create an access token. For detailed instructions, please refer to the link provided in the README.md! \n 🔗 ${multiPurple(
        `https://${GITLAB_URL}/profile/personal_access_tokens`,
      )} \n\n• Remember to select all the scopes to grant to this access token.\n\n• Copy the access token and provide it below 👇.`,
    )} \n\n\n🔑 Please enter your GitLab token:`,
    afterMessage: `${reset.green('✓')} Access Token`,
    afterMessageAppend: `${reset(' added!')}`,
    mask: '*',
    validate: (input: string) =>
      !!input.trim() || 'Please enter a valid GitLab Access Token',
  }
  return await ux.prompt<AnsToken>(question)
}

export const updateAccessToken = async () => {
  try {
    const answers = await promptForToken()
    await setConfig('accessToken', answers.token)
    await handleSuccess('token:update', {})
  } catch (err) {
    await handleError(err, 'token:update')
  }
}
