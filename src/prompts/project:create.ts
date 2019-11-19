import { ux } from '@cto.ai/sdk'
import { Question } from '@cto.ai/inquirer'
import { GitLabNamespaceRes } from '../types/GitLabRes'
import { AnsProjectCreate } from '../types/Answers'
/**
 * prompt user to obtain project name, description, privateOrPublic
 */
export const getProjectInfoFromUser = async (
  namespaces: GitLabNamespaceRes[],
  personalAccountLogin: string,
): Promise<AnsProjectCreate> => {
  const { green } = ux.colors.reset
  const namespaceList = namespaces.map(namespace => {
    if (namespace.full_path === personalAccountLogin) {
      return {
        name: `${personalAccountLogin} ${ux.colors.dim('[Personal Account]')}`,
        value: namespace.id,
      }
    } else {
      return {
        name: namespace.full_path,
        value: namespace.id,
      }
    }
  })
  const questions: Question<AnsProjectCreate>[] = [
    {
      type: 'list',
      name: 'namespace',
      message: `\nPlease select the namespace of your project →`,
      choices: namespaceList,
      afterMessage: `${green('✓')} Namespace`,
    },
    {
      type: 'input',
      name: 'name',
      message: `\nPlease enter the name of the project →
      \n${ux.colors.white('📝 Enter Name')}`,
      afterMessage: `${green('✓')} Name`,
      validate: input => {
        if (!input) {
          return 'The project name cannot be blank!'
        } else {
          return true
        }
      },
    },
    {
      type: 'input',
      name: 'description',
      message: `\nPlease enter the description of the project →
      \n${ux.colors.white('📝 Enter Description')}`,
      afterMessage: `${green('✓')} Description`,
    },
    {
      type: 'list',
      name: 'privateOrPublic',
      message: 'Do you want to create a public project or a private project?',
      choices: [
        { name: '🔐 private', value: 'private' },
        { name: '🌎 public', value: 'public' },
      ],
      afterMessage: `${green('✓')} Type`,
    },
  ]
  const answers = await ux.prompt<AnsProjectCreate>(questions)
  return answers
}
