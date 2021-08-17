import _ from 'lodash'
import { all, fork, select, take, takeLatest } from 'typed-redux-saga'

import * as actions from '../actions'
import * as selectors from '../selectors'
import { RootState } from '../types'
import { ExtractActionFromActionCreator } from '../types/base'

function* init() {
  yield take('LOGIN_SUCCESS')
}

// Note: Lodash debounce was not working as expected with generators
// so we now use normal async/await in the sync functions
function* onSyncUp() {
  const state: RootState = yield* select()
  void debounceSyncUp(state)
}

function* onSyncDown() {
  const state: RootState = yield* select()

  const appToken = selectors.appTokenSelector(state)
  if (!appToken) return
}

// Note: Lodash debounce was not working as expected with generators
// remove async now to make lint pass
function syncUp(state: RootState) {
  const appToken = selectors.appTokenSelector(state)
  if (!appToken) return
}

const debounceSyncUp = _.debounce(syncUp, 5000, {
  leading: true,
  maxWait: 30000,
  trailing: true,
})

function* onLoginSuccess(
  action: ExtractActionFromActionCreator<typeof actions.loginSuccess>,
) {
  const state: RootState = yield* select()
}

export function* apiSagas() {
  yield* all([
    yield* fork(init),
    yield* takeLatest('LOGIN_SUCCESS', onLoginSuccess),
    yield* takeLatest('SYNC_DOWN', onSyncDown),
    yield* takeLatest('SYNC_UP', onSyncUp),
  ])
}
