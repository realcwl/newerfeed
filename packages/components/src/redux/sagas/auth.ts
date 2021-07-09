import { REHYDRATE } from 'redux-persist'
import { all, fork, put, select, take, takeLatest } from 'typed-redux-saga'

import * as github from '../../libs/github'
import { clearOAuthQueryParams } from '../../utils/helpers/auth'
import * as actions from '../actions'
import * as selectors from '../selectors'
import { ExtractActionFromActionCreator } from '../types/base'

function* init() {
  yield take('LOGIN_SUCCESS')
  // TODO(chenweilunster): Implement Init function.
}

function* onRehydrate() {
  const appToken = yield* select(selectors.appTokenSelector)
  if (!appToken) return

  yield put(actions.loginRequest({ appToken }))
}

function* onLoginRequest(
  action: ExtractActionFromActionCreator<typeof actions.loginRequest>,
) {}

function* onLoginSuccess(
  _action: ExtractActionFromActionCreator<typeof actions.loginSuccess>,
) {}

function* onLoginFailure(
  action: ExtractActionFromActionCreator<typeof actions.loginFailure>,
) {}

function onLogout() {
  github.clearOctokitInstances()
  clearOAuthQueryParams()
}

export function* authSagas() {
  yield* all([
    yield* fork(init),
    yield* takeLatest(REHYDRATE, onRehydrate),
    yield* takeLatest('LOGIN_REQUEST', onLoginRequest),
    yield* takeLatest('LOGIN_FAILURE', onLoginFailure),
    yield* takeLatest('LOGIN_SUCCESS', onLoginSuccess),
    yield* takeLatest('LOGOUT', onLogout),
  ])
}
