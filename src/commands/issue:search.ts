import { ux, sdk } from '@cto.ai/sdk'
import { LABELS } from '../constants'
import { pExec } from '../utils/helpers'
import { checkForLocalBranch, makeInitialCommit } from '../utils/git'
import { CheckboxQuestion } from '@cto.ai/inquirer'
import { AutoCompleteQuestion } from '@cto.ai/inquirer'
import stripAnsi from 'strip-ansi'
import { CommandOptions } from '../types/Config'
import { checkCurrentProject } from '../utils/helpers'
import {
  listLabels,
  listAssignees,
  listMilestones,
  searchIssues,
  editIssueLabels,
  setToken,
} from '../utils/apiCalls'
import {
  IssueSelection,
  IssueSelectionItem,
  HelpInfo,
  DataForFilter,
} from '../types/Issues'
import { AnsFilterSelect, AnsIssueSelect } from '../types/Answers'
import { handleError } from '../errors'
import { handleSuccess } from '../utils/success'

const filterSelectPrompt = (
  list: string[],
): AutoCompleteQuestion<AnsFilterSelect>[] => [
  {
    type: 'autocomplete',
    name: 'filter',
    message: 'Please select the filter',
    autocomplete: list,
    pageSize: process.stdout.rows,
  },
]

const issueSelectPrompt = (
  list: IssueSelection[],
): AutoCompleteQuestion<AnsIssueSelect>[] => [
  {
    type: 'autocomplete',
    name: 'issue',
    message: 'Please select the issue (use ➡️  key to view description)',
    autocomplete: list,
    pageSize: process.stdout.rows,
  },
]

const checkboxPrompt = (
  list: HelpInfo[],
): CheckboxQuestion<AnsFilterSelect>[] => {
  return [
    {
      type: 'checkbox',
      name: 'issueFilter',
      message: 'Please select the filter',
      choices: list,
      pageSize: process.stdout.rows,
    },
  ]
}

const promptForfilter = async (list: HelpInfo[]): Promise<string[]> => {
  const { issueFilter } = await ux.prompt(checkboxPrompt(list))
  return issueFilter
}

const getDataForFilter = async (
  namespace: string,
  repo: string,
  filters: string[],
): Promise<DataForFilter[]> => {
  const projectPath = `${namespace}/${repo}`
  const dataForfilter = await Promise.all(
    filters.map(async filter => {
      switch (filter) {
        case 'label':
          const labels = await listLabels(projectPath)
          const labelNames = labels.map(label => {
            return `${ux.colors.hex(label.color).bold(`${label.name}`)}`
          })
          return {
            name: filter,
            prompt: labelNames && filterSelectPrompt(labelNames),
          }
        case 'assignee':
          const assignees = await listAssignees(projectPath)
          const assigneesNames = assignees.map(assignee => {
            assignee = JSON.parse(assignee)
            return assignee.username
          })
          return {
            name: filter,
            prompt: assigneesNames && filterSelectPrompt(assigneesNames),
          }
        case 'milestone':
          const milestone = await listMilestones(projectPath)
          const milestoneNames = milestone.map(milestone => {
            milestone = JSON.parse(milestone)
            return milestone.title
          })
          return {
            name: filter,
            prompt: milestoneNames && filterSelectPrompt(milestoneNames),
          }
        case 'state':
          return {
            name: filter,
            prompt: filterSelectPrompt(['opened', 'closed']),
          }
      }
    }),
  )
  return dataForfilter
}

const buildHelpInfo = (examples: string[]): string => {
  const { bold, italic } = ux.colors
  const spreadExamples = examples.join(', ')
  const helpInfo = bold.italic.grey('EXAMPLES: ') + italic.grey(spreadExamples)
  return helpInfo
}

export const issueSearch = async (cmdOptions: CommandOptions) => {
  try {
    await setToken()
    await checkCurrentProject(cmdOptions)
    // list issues specific to the repo
    const { namespace, repo } = cmdOptions.currentRepo
    const projectPath = `${namespace}/${repo}`

    const checkBoxlist = [
      {
        name: 'state',
        helpInfo: buildHelpInfo(['opened', 'closed']),
      },
      {
        name: 'label',
        helpInfo: buildHelpInfo(['bug', 'feature', 'docs']),
      },
      {
        name: 'milestone',
        helpInfo: buildHelpInfo(['1.0.0', '1.5.0']),
      },
      {
        name: 'assignee',
        helpInfo: buildHelpInfo(['octocat', 'gopher']),
      },
    ]
    const filter = await promptForfilter(checkBoxlist)

    const dataForfilter = await getDataForFilter(namespace, repo, filter)
    let query = {}
    const pickedFilter = []
    for (let i = 0; i < dataForfilter.length; i++) {
      const { filter } = await ux.prompt(dataForfilter[i].prompt)

      pickedFilter[i] = {}
      pickedFilter[i].name = dataForfilter[i].name
      pickedFilter[i].filter = stripAnsi(filter) // removes color ansi created by chalk api
      switch (pickedFilter[i].name) {
        case 'label':
          query['labels'] = pickedFilter[i].filter
          break
        case 'assignee':
          query['assignee_username'] = pickedFilter[i].filter
          break
        case 'milestone':
          query['milestone'] = pickedFilter[i].filter
          break
        case 'state':
          query['state'] = pickedFilter[i].filter
          break
      }
    }
    ux.spinner.start('Searching for issues...')
    const issueList = await searchIssues(projectPath, query)
    ux.spinner.stop('done')

    const filteredData = issueList.map(issue => {
      return {
        iid: issue.iid,
        title: issue.title,
        description: issue.description,
        web_url: issue.web_url,
        state: issue.state,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        labels: issue.labels,
        user_notes_count: issue.user_notes_count,
        assignee: issue.assignee,
      }
    })

    const issueSelectionList = filteredData.map((issue: IssueSelectionItem) => {
      const { successGreen, errorRed, multiOrange, secondary } = ux.colors
      const {
        title,
        web_url,
        state,
        user_notes_count,
        assignee,
        description,
        iid,
        labels,
      } = issue

      const strBuilder = () => {
        let stateStr
        if (state === 'open') {
          stateStr = successGreen(`state:${state}`)
        } else {
          stateStr = errorRed(`state:${state}`)
        }
        const commentStr = multiOrange(`comments:${user_notes_count}`)

        const assigneeStr = multiOrange(
          `assignee:${(assignee && assignee.name) || 'none'}`,
        )
        return `${title} (${web_url})
  ${stateStr}\t ${commentStr}\t ${assigneeStr}\n`
      }

      return {
        name: strBuilder(),
        helpInfo: `\n${secondary(description)}\n`,
        value: {
          iid,
          title,
          labels,
        }, //value will be returned from prompt
      }
    })

    const { issue } = await ux.prompt(issueSelectPrompt(issueSelectionList))
    ux.spinner.start('🚧 Setting up a branch...')
    // get user to name the branch with current user

    const branchName = `${issue.title.replace(/ /g, '-')}/${issue.iid}`
    const hasLocalBranch = await checkForLocalBranch(branchName)

    if (!hasLocalBranch) {
      await pExec(`git checkout -b ${branchName}`)
      await makeInitialCommit()
    } else {
      await pExec(`git checkout ${branchName}`)
    }
    ux.spinner.stop('complete!')
    try {
      await editIssueLabels(
        projectPath,
        issue.iid,
        issue.labels,
        LABELS.PM_TODO.name,
        LABELS.PM_DOING.name,
      )
    } catch (err) {
      await handleError(err, 'Remove and Add Labels', LABELS.PM_TODO.name)
    }
    await handleSuccess('issue:search', issue)
  } catch (err) {
    await handleError(err, 'issue:search')
  }
}
