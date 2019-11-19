import { ux } from '@cto.ai/sdk'
import { Question } from '@cto.ai/inquirer'
import { AnsIssueList } from '../types/Answers'
import { GitLabIssueRes } from '../types/GitLabRes'
import { IssueValue } from '../types/Issues'

export const formatIssues = (issues: GitLabIssueRes[]) => {
  return issues.map(issue => {
    const { iid, title } = issue
    return {
      name: `# ${iid} - ${title}`,
      value: {
        number: iid,
        title,
      },
    }
  })
}

export const formatAllIssues = issues => {
  return issues.map(issue => {
    const { iid, title, projectName, path, full_path } = issue
    return {
      name: `${projectName} -> # ${iid} - ${title}`,
      value: {
        path,
        full_path,
      },
    }
  })
}

export const promptIssueSelection = async (issues): Promise<IssueValue> => {
  const question: Question<AnsIssueList> = {
    type: 'autocomplete',
    message: `\nHere are a list of issues: \n${ux.colors.reset(
      `🔍 Start work on an issue by running 'ops run gitlab issue:start'!`,
    )}\n`,
    name: 'issue',
    autocomplete: issues,
    bottomContent: '',
  }
  const { issue } = await ux.prompt<AnsIssueList>(question)
  return issue
}
