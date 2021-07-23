import { User } from '@devhub/core'
import { createAction, createErrorAction } from '../helpers'
import { AuthError, State as AuthState } from '../reducers/auth'

export function loginRequest() {
  return createAction('LOGIN_REQUEST')
}

export function loginSuccess(payload: {
  appToken: string
  user: NonNullable<User>
}) {
  return createAction('LOGIN_SUCCESS', payload)
}

export function loginFailure<E extends AuthError>(error: E) {
  return createErrorAction('LOGIN_FAILURE', error)
}

export function logout() {
  return createAction('LOGOUT')
}
