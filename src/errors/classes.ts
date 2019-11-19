import {
  MASTER_BRANCH_ERROR_MSG,
  NO_ISSUE_ERROR_MSG,
  NO_CHANGES_SAVE_ERROR_MSG,
  NO_SYNCPROJECTS_ERROR_MSG,
  NO_MERGES_ERROR_MSG,
} from './messages'

export class MasterBranchError extends Error {
  constructor() {
    super(MASTER_BRANCH_ERROR_MSG)
  }
}

export class NoIssueError extends Error {
  constructor() {
    super(NO_ISSUE_ERROR_MSG)
  }
}

export class NoChangesToSaveError extends Error {
  constructor() {
    super(NO_CHANGES_SAVE_ERROR_MSG)
  }
}

export class NoSyncProjectsError extends Error {
  constructor() {
    super(NO_SYNCPROJECTS_ERROR_MSG)
  }
}

export class NoMergeRequestError extends Error {
  constructor() {
    super(NO_MERGES_ERROR_MSG)
  }
}
