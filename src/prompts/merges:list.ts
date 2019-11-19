import { ux } from '@cto.ai/sdk'
import { Question } from '@cto.ai/inquirer'
import { AnsSelectMerge } from '../types/Answers'
import { MergeValue } from '../types/Merges'

const formatList = pulls => {
  return pulls.map(pull => {
    const { iid, title, web_url } = pull
    return {
      name: `# ${iid} - ${title}`,
      value: {
        iid,
        title,
        web_url,
      },
    }
  })
}

export const promptMergeRequestSelection = async (
  repo: string,
  list,
): Promise<MergeValue> => {
  const formattedList = formatList(list)
  const questions: Question<AnsSelectMerge> = {
    type: 'autocomplete',
    message: `Here's a list of merge requests for ${repo}:`,
    name: 'mergeRequest',
    autocomplete: formattedList,
    bottomContent: '',
  }

  const { mergeRequest } = await ux.prompt<AnsSelectMerge>(questions)
  return mergeRequest
}
