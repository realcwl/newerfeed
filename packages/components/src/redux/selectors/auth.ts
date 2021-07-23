import { EMPTY_OBJ } from '../../utils/constants'
import { RootState } from '../types'

const s = (state: RootState) => state.auth || EMPTY_OBJ

export const authErrorSelector = (state: RootState) => s(state).error

export const isLoggingInSelector = (state: RootState) => s(state).isLoggingIn

export const isLoggedSelector = (state: RootState) => true

export const appTokenSelector = (state: RootState) =>
  s(state).appToken || undefined

export const currentUserSelector = (state: RootState) => {
  const user = s(state).user
  if (!isLoggedSelector(state)) return undefined
  return user
}

export const currentUserIdSelector = (state: RootState) => {
  return state.auth.user?.id
}
