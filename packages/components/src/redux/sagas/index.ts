import { all, fork } from 'typed-redux-saga'

import { apiSagas } from './api'
import { authSagas } from './auth'
import { columnsSagas } from './columns'
import { configSagas } from './config'
import { appSagas } from './app'

export function* rootSaga() {
  yield* all([
    yield* fork(apiSagas),
    yield* fork(authSagas),
    yield* fork(columnsSagas),
    yield* fork(configSagas),
    yield* fork(appSagas),
  ])
}
