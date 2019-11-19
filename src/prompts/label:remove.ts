import { ux } from '@cto.ai/sdk'
import { AutoCompleteQuestion } from '@cto.ai/inquirer'
import { AnsSelectLabelEdit } from '../types/Answers'
import { GitLabLabelRes } from '../types/GitLabRes'

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
    message: `Choose a label to delete!:\n${secondary(
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
