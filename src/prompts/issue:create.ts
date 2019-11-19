import * as fs from 'fs'
import * as path from 'path'
import { ux } from '@cto.ai/sdk'
import { AnsIssueTitleType, AnsIssueDescription } from '../types/Answers'

let templateDir = path.resolve(__dirname, `../templates/issues`)
if (fs.existsSync(`.gitlab/ISSUE_TEMPLATE`)) {
  templateDir = path.resolve(process.cwd(), `.gitlab/ISSUE_TEMPLATE`)
}

export const getIssueInfo = async () => {
  const { title, type } = await ux.prompt<AnsIssueTitleType>([
    {
      type: 'input',
      name: 'title',
      message: `\n📝 Please enter your issue title:`,
      afterMessage: `Title: `,
    },
    {
      type: 'list',
      name: 'type',
      message: `\n📝 Select your issue type: \n${ux.colors.reset(
        'Your default editor will be opened to allow editing of the issue details.',
      )}`,
      choices: fs.readdirSync(templateDir),
      afterMessage: `Type: `,
    },
  ])

  const defaultDescription = fs.readFileSync(
    path.resolve(templateDir, type),
    'utf8',
  )

  const { description } = await ux.prompt<AnsIssueDescription>({
    type: 'editor',
    name: 'description',
    message: `\n`,
    default: defaultDescription,
  })

  const labels = description
    .match(/-{3}(\n.*)*-{3}/m)[0]
    .match(/labels:.*/g)[0]
    .split('labels: ')[1]
    .split(', ')
    .map(label => {
      return label.replace("'", '')
    })
  const body = description.replace(/-{3}(\n.*)*-{3}/m, '')

  return { title, labels, body }
}
