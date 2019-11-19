import { projectCreate } from '../commands/project:create'
import { projectClone } from '../commands/project:clone'
import { issueList } from '../commands/issue:list'
import { issueSearch } from '../commands/issue:search'
import { issueCreate } from '../commands/issue:create'
import { issueStart } from '../commands/issue:start'
import { issueSave } from '../commands/issue:save'
import { issueDone } from '../commands/issue:done'
import { mergesList } from '../commands/merges:list'
import { labelAdd } from '../commands/label:add'
import { labelEdit } from '../commands/label:edit'
import { labelRemove } from '../commands/label:remove'
import { labelSync } from '../commands/label:sync'
import { updateAccessToken } from '../commands/token:update'

// If an env is not set on host machine, env will take $(var name) as the value and not be undefined!
export const GITLAB_URL =
  process.env.GITLAB_URL === '$GITLAB_URL' || !process.env.GITLAB_URL
    ? 'gitlab.com'
    : process.env.GITLAB_URL
export const GPG_KEY =
  process.env.GPG_KEY === '$GPG_KEY' || !process.env.GPG_KEY
    ? ''
    : process.env.GPG_KEY
export const GPG_PASSPHRASE =
  process.env.GPG_PASSPHRASE === '$GPG_PASSPHRASE' ||
  !process.env.GPG_PASSPHRASE
    ? ''
    : process.env.GPG_PASSPHRASE
export const GITLAB_TEST_TOKEN =
  process.env.GITLAB_TEST_TOKEN === '$GITLAB_TEST_TOKEN' ||
  !process.env.GITLAB_TEST_TOKEN
    ? ''
    : process.env.GITLAB_TEST_TOKEN
export const API_URL = `https://${GITLAB_URL}/api/v4/`
export const LABELS = {
  IMPACT_MAJOR: {
    name: 'Impact: Major',
    description: 'When you make incompatible API changes',
    color: '#69D100',
  },

  IMPACT_MINOR: {
    name: 'Impact: Minor',
    description: 'When you add functionality in a backwards-compatible manner',
    color: '#5CB85C',
  },
  IMPACT_PATCH: {
    name: 'Impact: Patch',
    description: 'When you make backwards-compatible bug fixes.',
    color: '#A8D695',
  },
  PM_DESIGN: {
    name: 'PM: Design',
    description: 'The feature is that are currently in design.',
    color: '#386DBD',
  },
  PM_DESIGN_NEEDED: {
    name: 'PM: Design Needed',
    description: '',
    color: '#5843AD',
  },
  PM_DOING: {
    name: 'PM: Doing',
    description: ' Currently under development',
    color: '#009DDD',
  },
  PM_RELEASE: {
    name: 'PM: Ready for Release',
    description:
      'All merge requests which have been reviewed and are ready for release.',
    color: '#5CB85C',
  },
  PM_REVIEW: {
    name: 'PM: Ready for Review',
    description: ' Ready for review',
    color: '#05D3F8',
  },
  PM_TODO: {
    name: 'PM: To Do',
    description:
      'tickets ready to go for development. Devs can pull from this queue ',
    color: '#428BCA',
  },
  PRIORITY_CRITICAL: {
    name: 'Priority: Critical',
    description: 'Everyone needs to jump in and try to get the work done',
    color: '#FF0000',
  },
  PRIORITY_HIGH: {
    name: 'Priority: High',
    description:
      'It requires attention, the necessary work needs to be done as quickly as possible.',
    color: '#C70000',
  },
  PRIORITY_LOW: {
    name: 'Priority: Low',
    description: 'Need to be done someday in the quarter',
    color: '#4F0000',
  },
  PRIORITY_MEDIUM: {
    name: 'Priority: Medium',
    description:
      'It needs to be done, in the current development cycle (sprint)',
    color: '#8C0000',
  },
  TYPE_BUG: {
    name: 'Type: Bug',
    description:
      "Changes in the code to fix something that already exist, but isn't working properly",
    color: '#FF0000',
  },
  TYPE_ENHANCEMENT: {
    name: 'Type: Enhancement',
    description:
      'Changes in the code that improves that, e.g.: refactoring a function, fixing typos',
    color: '#F8CA00',
  },
  TYPE_EPIC: {
    name: 'Type: Epic',
    description:
      "GitLab doesn't allow Epics to be viewed on the board, so we use an issue with a Label!",
    color: '#0033CC',
  },
  TYPE_FEATURE: {
    name: 'Type: Feature',
    description:
      'Changes in the code that adds new functionalities, e.g.: generate reports',
    color: '#5CB85C',
  },
  TYPE_RD: {
    name: 'Type: R&D',
    description: 'Research and Development',
    color: '#34495E',
  },
}

export const commands = {
  'project:create': {
    functionName: projectCreate,
    description: 'Creates a project',
  },
  'project:clone': {
    functionName: projectClone,
    description: 'Clones a project',
  },
  'issue:list': { functionName: issueList, description: 'Lists issues' },
  'issue:search': {
    functionName: issueSearch,
    description: 'Search issues [-q <+querystring> | --query <+querystring>]',
  },
  'issue:create': {
    functionName: issueCreate,
    description: 'Creates an issue',
  },
  'issue:start': { functionName: issueStart, description: 'Starts an issue' },
  'issue:save': {
    functionName: issueSave,
    description: 'Commits and push the code',
  },
  'issue:done': {
    functionName: issueDone,
    description: 'Creates a pull request once the issue is done',
  },
  'merges:list': {
    functionName: mergesList,
    description: 'Lists merge-requests',
  },
  'label:add': {
    functionName: labelAdd,
    description: 'Adds labels to project',
  },
  'label:edit': { functionName: labelEdit, description: 'Edits label' },
  'label:remove': { functionName: labelRemove, description: 'Removes label' },
  'label:sync': {
    functionName: labelSync,
    description: 'Sync up labels across projects',
  },
  'token:update': {
    functionName: updateAccessToken,
    description: 'Updates a GitLab token',
    skipTokenAuthentication: true,
  },
}
