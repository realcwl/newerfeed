import { constants, SeedState } from '@devhub/core'
import _ from 'lodash'
import { all, fork, select, take, takeLatest } from 'typed-redux-saga'
import axios from 'axios'
import { jsonToGraphQLQuery } from 'json-to-graphql-query'
import * as actions from '../actions'
import { appTokenSelector, selectSeedStateFromRootState } from '../selectors'
import { RootState } from '../types'
import { ExtractActionFromActionCreator } from '../types/base'
import { useReduxState } from '../../hooks/use-redux-state'
import { WrapUrlWithToken } from '../../utils/api'

function* init() {
  // Do not monitoring before login success happen
  yield take('LOGIN_SUCCESS')
}

// Note: Lodash debounce was not working as expected with generators
// so we now use normal async/await in the sync functions
function* onSyncUp() {
  const state: RootState = yield* select()
  void debounceSyncUp(state)
}

// Note: Lodash debounce was not working as expected with generators
async function syncUp(state: RootState) {
  const seedState = selectSeedStateFromRootState(state)
  if (!seedState) return

  try {
    const response = await axios.post(
      WrapUrlWithToken(constants.GRAPHQL_ENDPOINT, appTokenSelector(state)),
      {
        query: jsonToGraphQLQuery({
          mutation: {
            syncUp: {
              __args: {
                input: {
                  userSeedState: seedState.userSeedState,
                  feedSeedState: seedState.feedSeedState,
                },
              },
              userSeedState: {
                name: true,
                avatarUrl: true,
              },
              feedSeedState: {
                id: true,
                name: true,
              },
            },
          },
        }),
      },
    )
    const { errors } = response.data

    if (errors && errors.length) {
      throw Object.assign(new Error('GraphQL Error'), { response })
    }
  } catch (error) {
    console.log(error)
  }
}

const debounceSyncUp = _.debounce(syncUp, 1000, {
  leading: false,
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
    yield* takeLatest('SYNC_UP', onSyncUp),
  ])
}
