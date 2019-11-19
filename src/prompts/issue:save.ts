import { ux } from '@cto.ai/sdk'
import { Question } from '@cto.ai/inquirer'
import { AnsIssueSave } from '../types/Answers'

const question: Question<AnsIssueSave> = {
  type: 'input',
  name: 'message',
  message: `\n📝 Please enter a commit message:\n`,
  afterMessage: `Message: `,
  validate: input => {
    if (input === '') {
      return ' Commit message cannot be empty!'
    } else {
      return true
    }
  },
}

export const getCommitMsg = async (): Promise<string> => {
  const { message } = await ux.prompt<AnsIssueSave>(question)
  return message
}
