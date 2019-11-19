import { sdk } from '@cto.ai/sdk'
import { handleError } from '../errors/index'

export const getConfig = async key => {
  try {
    return await sdk.getConfig(key)
  } catch (err) {
    await handleError(err, 'getConfig()')
  }
}

export const setConfig = async (key, value) => {
  try {
    return await sdk.setConfig(key, value)
  } catch (err) {
    await handleError(err, 'setConfig()')
  }
}
