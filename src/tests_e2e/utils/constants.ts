export const DOWN = '\x1B\x5B\x42'
export const UP = '\x1B\x5B\x41'
export const ENTER = '\x0D'
export const SPACE = '\x20'
export const A = '\x61'
export const Q = '\x71'
export const N = '\x6E'
export const COLON = '\x3A'
export const X = '\x78'
export const T = '\x74'
export const G = '\x67'
export const H = '\x68'

export const OP_NAME =
  process.env.OP_NAME === '$OP_NAME' || !process.env.OP_NAME
    ? ''
    : process.env.OP_NAME
export const OP_PATH = 'ops'
export const TEAM_NAME_IDENTIFIER = 'Team Name:'
export const EXISTING_USER_NAME = process.env.EXISTING_USER_NAME
export const EXISTING_USER_PASSWORD = process.env.EXISTING_USER_PASSWORD
