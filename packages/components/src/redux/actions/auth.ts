import { User } from '@devhub/core'
import { createAction, createErrorAction } from '../helpers'
import { AuthError, State as AuthState } from '../reducers/auth'

export function clearAuthError() {
  return createAction('CLEAR_AUTH_ERROR')
}

export function loginRequest(payload: { email: string; password: string }) {
  return createAction('LOGIN_REQUEST', payload)
}

export function signUpRequest(payload: { email: string; password: string }) {
  return createAction('SIGN_UP_REQUEST', payload)
}

export function loginSuccess(payload: {
  appToken: string
  refreshToken: string
  user: NonNullable<User>
  // lastAuthTime denotes the last timestamp user is authed, if not provided it
  // will be defaultly set to Date.now()
  lastAuthTime?: number
}) {
  return createAction('LOGIN_SUCCESS', payload)
}

export function signUpSuccess() {
  return createAction('SIGN_UP_SUCCESS')
}

export function authFailure<E extends AuthError>(error: E) {
  return createErrorAction('AUTH_FAILURE', error)
}

export function logout() {
  return createAction('LOGOUT')
}
