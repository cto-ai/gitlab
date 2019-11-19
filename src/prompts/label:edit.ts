import { ux } from '@cto.ai/sdk'
import { AutoCompleteQuestion, Question } from '@cto.ai/inquirer'
import { AnsSelectLabelEdit } from '../types/Answers'
import { ProjectLabel } from '../types/Labels'
import { GitLabLabelRes } from '../types/GitLabRes'
import { isValidColor } from './label:add'

const { secondary, white } = ux.colors

const formatList = (labels: GitLabLabelRes[]) => {
  return labels.map(label => {
    const { id, name, description, color, is_project_label } = label
    if (!is_project_label) {
      return {
        name: `${name} [Group Label]`,
        value: {
          id,
          name,
          description,
          color,
          is_project_label,
        },
      }
    } else {
      return {
        name: `${name}`,
        value: {
          id,
          name,
          description,
          color,
          is_project_label,
        },
      }
    }
  })
}

export const labelSelection = async (data, namespace: string) => {
  const labels = formatList(data)
  const questions: AutoCompleteQuestion<AnsSelectLabelEdit> = {
    type: 'autocomplete',
    message: `Choose a label to edit:\n${secondary(
      'A Group label is a label that exists for all the projects within the current namespace',
    )} ${white(namespace)}`,
    name: 'label',
    //@ts-ignore: TS2322 autocomplete accepts
    autocomplete: labels,
    bottomContent: '',
  }

  const { label } = await ux.prompt<AnsSelectLabelEdit>(questions)
  return label
}

export const promptLabelEdit = async ({
  name,
  description,
  color,
}: ProjectLabel): Promise<ProjectLabel> => {
  const questions: Question<ProjectLabel>[] = [
    {
      type: 'input',
      name: 'name',
      message: 'Enter a new name for the label:',
      // cut off # from gitlab response
      default: name.substring(1),
      afterMessage: `${ux.colors.reset.green('✓')} Name`,
      validate: input => {
        if (!input) {
          return ' Label name cannot be blank!'
        } else {
          return true
        }
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Enter a new description for the label:',
      default: description,
      afterMessage: `${ux.colors.reset.green('✓')} Description`,
      validate: input => {
        if (input.length > 100) {
          return ' Label description must be under 100 characters in length!'
        } else {
          return true
        }
      },
    },
    {
      type: 'input',
      name: 'color',
      message: 'Enter a new color for the label (without #):',
      default: color,
      afterMessage: `${ux.colors.reset.green('✓')} Color`,
      validate: input => {
        if (!isValidColor(input)) {
          return ' That is not a valid hex code!'
        } else {
          return true
        }
      },
    },
  ]
  const answers = await ux.prompt<ProjectLabel>(questions)
  return answers
}
