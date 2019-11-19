import { sdk } from '@cto.ai/sdk'
import branch from 'git-branch'
import { checkLocalChanges } from '../utils/git'
import { getCommitMsg } from '../prompts/issue:save'
import { handleError } from '../errors'
import { pExec, setupGPGKey } from '../utils/helpers'
import { NoChangesToSaveError } from '../errors/classes'
import { handleSuccess } from '../utils/success'

export const issueSave = async () => {
  try {
    await setupGPGKey()
    const hasLocalChanges = await checkLocalChanges()
    if (!hasLocalChanges) {
      throw new NoChangesToSaveError()
    }
    await pExec(`git add .`)
    const message = await getCommitMsg()
    await pExec(`git commit -m "${message}"`)
    const currentBranch = await branch()
    await pExec(`git push --set-upstream origin ${currentBranch}`)
    await handleSuccess('issue:save', {})
  } catch (err) {
    await handleError(err, 'issue:save')
  }
}
