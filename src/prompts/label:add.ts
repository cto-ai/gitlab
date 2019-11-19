import { ux } from '@cto.ai/sdk'
import { Question } from '@cto.ai/inquirer'
import { ProjectLabel } from '../types/Labels'
import { AnsAddAsGroup } from '../types/Answers'

const { secondary, white } = ux.colors
/*
 * checks that a string is a valid hex color code without the preceding `#`
 */
export const isValidColor = color => {
  const validColor = /^([0-9A-F]{3}$|[0-9A-F]{6}$)/i
  return validColor.test(color)
}

export const promptUserInput = async () => {
  const questions: Question<ProjectLabel>[] = [
    {
      type: 'input',
      name: 'name',
      message: `\nPlease enter your label name:`,
      afterMessage: `Name:`,
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
      message: `\nPlease enter your label description:`,
      afterMessage: `Description:`,
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
      message: `\nProvide a valid hex code for your label color (without #):`,
      afterMessage: `Color:`,
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

export const addAsGroupLabel = async (namespace: string) => {
  const question: Question<AnsAddAsGroup> = {
    type: 'confirm',
    name: 'group',
    message: `\nWould you like to add this label as a Group label?\n${secondary(
      'A Group label will exist for all the projects within the current namespace',
    )} ${white(namespace)}`,
  }

  const { group } = await ux.prompt<AnsAddAsGroup>(question)
  return group
}
