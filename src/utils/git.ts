import { pExec, setupGPGKey } from '../utils/helpers'
import { handleError } from '../errors'
import { PromiseExec } from '../types/Promises'

export const checkForLocalBranch = async (branchName: string) => {
  let localBranches: PromiseExec
  try {
    localBranches = await pExec(`git branch`)
  } catch (err) {
    await handleError(err, 'checkForLocalBranch()')
  }

  return localBranches.stdout.indexOf(branchName) !== -1
}

export const makeInitialCommit = async (repoName?: string) => {
  try {
    await setupGPGKey()
    if (repoName) {
      await pExec(
        `cd ${repoName} && git commit --allow-empty -m 'initial commit' && git push`,
      )
      return true
    }
    await pExec(`git commit --allow-empty -m 'initial commit'`)
    return true
  } catch (err) {
    await handleError(err, 'makeInitialCommit()')
  }
}

export const checkLocalChanges = async () => {
  try {
    const response = await pExec(`git status --porcelain`)
    if (response.stdout !== '') {
      return true
    }
    return false
  } catch (err) {
    await handleError(err, 'checkLocalChanges()')
  }
}
