import { EMPTY_OBJ } from '../../utils/constants'
import { RootState } from '../types'

const s = (state: RootState) => state.auth || EMPTY_OBJ

export const authErrorSelector = (state: RootState) => s(state).error

export const signUpSuccessMsgSelector = (state: RootState) =>
  s(state).signUpSuccessMsg

export const isLoggingInSelector = (state: RootState) => s(state).isLoggingIn

export const isLoggedSelector = (state: RootState) => true

export const appTokenSelector = (state: RootState) =>
  s(state).appToken || undefined

export const refreshTokenSelector = (state: RootState) => s(state).refreshToken

export const lastAuthTimeSelector = (state: RootState) => s(state).lastAuthTime

export const currentUserSelector = (state: RootState) => {
  const user = s(state).user
  if (!isLoggedSelector(state)) return undefined
  return user
}

export const currentUserIdSelector = (state: RootState) => {
  return s(state).user?.id
}
