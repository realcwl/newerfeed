import { take } from 'lodash'
import { RootState } from '../types'
import { all, fork, select, takeLatest } from 'typed-redux-saga'
import axios, { AxiosResponse } from 'axios'
import { constants } from '@devhub/core'
import { bugsnag } from '../../libs/bugsnag'
import { put } from 'redux-saga/effects'
import * as actions from '../actions'

function* init() {
  const initialAction = yield* take(['REFRESH_COLUMNS'])
}

function* fetchAllFeeds() {
  const state: RootState = yield* select()
  try {
    const response: AxiosResponse = yield axios.post(
      constants.GRAPHQL_ENDPOINT,
      {
        // TODISCUSS: we should return all posts, not per feed
        query: `query AllFeeds {
          allFeeds {
            id
            name
            creator{
              id
              name
            }
            posts{
              id
              title
              comment
              feeds{
                id
              }
            }
          }
        }
      `,
      },
    )

    const { data, errors } = response.data
    if (errors && errors.length) {
      throw Object.assign(new Error('GraphQL Error'), { response })
    }
    yield put(actions.updateFeeds(response.data.allFeeds))
  } catch (error) {
    const description = 'fetch feeds failed'
    console.error(description, error)
    bugsnag.notify(error, { description })
  }
}

export function* dataSagas() {
  yield* all([yield* takeLatest(['SET_THEME'], fetchAllFeeds)])
  // yield* all([yield* fork(init)])
}
