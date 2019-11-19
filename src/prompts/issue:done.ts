import { ux } from '@cto.ai/sdk'
import { Question } from '@cto.ai/inquirer'
import {
  AnsMergeRequest,
  AnsSelectYesNo,
  AnsSelectAssignees,
} from '../types/Answers'
import { GitLabMemberRes } from '../types/GitLabRes'
import { accessLevelConvert } from '../utils/helpers'

const mergeRequestQuestions: Question<AnsMergeRequest>[] = [
  {
    type: 'input',
    name: 'title',
    message: 'Enter a title for the Merge Request:',
    afterMessage: `${ux.colors.reset.green('✓')} Title`,
  },
  {
    type: 'input',
    name: 'comment',
    message: 'Enter a comment or description for your Merge Request',
    afterMessage: `${ux.colors.reset.green('✓')} Comment`,
  },
]

export const getMRInfo = async (): Promise<AnsMergeRequest> => {
  const answer = await ux.prompt<AnsMergeRequest>(mergeRequestQuestions)
  return answer
}

export const promptForAssignees = async (): Promise<boolean> => {
  const { yesOrNo } = await ux.prompt<AnsSelectYesNo>({
    type: 'confirm',
    name: 'yesOrNo',
    message: 'Would you like to assign someone to your Merge Request?',
  })
  return yesOrNo
}

export const selectAssignees = async (membersList: GitLabMemberRes[]) => {
  const { assignees } = await ux.prompt<AnsSelectAssignees>({
    type: 'checkbox',
    name: 'assignees',
    message: `${ux.colors.reset(
      'Select the assignee(s) you would like to add from the list below:',
    )}`,
    choices: membersList.map(member => {
      const { id, username, access_level } = member
      return {
        name: username,
        helpInfo: accessLevelConvert(access_level),
        value: id,
      }
    }),
  })
  return assignees
}
