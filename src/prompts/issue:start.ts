import { ux } from '@cto.ai/sdk'
import { Question } from '@cto.ai/inquirer'
import { AnsSelectIssueStart } from '../types/Answers'
import { GitLabIssueRes } from '../types/GitLabRes'

export const selectIssue = async (issues: GitLabIssueRes[]) => {
  const questions: Question<AnsSelectIssueStart> = {
    type: 'list',
    message: 'Select an issue to start:\n',
    name: 'issue',
    choices: issues.map(issue => {
      const { iid, title, labels } = issue
      return {
        name: `# ${iid} - ${title}`,
        value: {
          iid,
          title,
          labels,
        },
      }
    }),
  }

  const answers = await ux.prompt<AnsSelectIssueStart>(questions)
  const { issue } = answers
  return issue
}
