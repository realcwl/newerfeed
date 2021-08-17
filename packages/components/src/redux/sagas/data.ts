import { take } from 'lodash'
import { RootState } from '../types'
import { all, fork, select, takeLatest } from 'typed-redux-saga'
import axios, { AxiosResponse } from 'axios'
import { constants } from '@devhub/core'
import { bugsnag } from '../../libs/bugsnag'
import { put } from 'redux-saga/effects'
import * as actions from '../actions'

function* fetchAllFeedsPosts() {
  const state: RootState = yield* select()
  try {
    const response: AxiosResponse<{
      data: {
        allFeeds: {
          id: string
          name: string
          creator: { id: string; name: string }
          posts: { id: string; title: string; content: string }[]
        }[]
      }
      errors: any[]
    }> = yield axios.post(constants.GRAPHQL_ENDPOINT, {
      query: `query AllFeeds {
          allFeeds {
            id
            name
            creator{
              id
              name
            }
            posts {
              id
              title
              content
            }
          }
        }
      `,
    })

    const { data, errors } = response.data
    if (errors && errors.length) {
      throw Object.assign(new Error('GraphQL Error'), { response })
    }
    yield put(actions.fetchFeedsSuccess({ feeds: data.allFeeds }))
  } catch (error) {
    const description = 'fetch feeds failed'
    console.error(description, error)
    bugsnag.notify(error, { description })
  }
}

export function* dataSagas() {
  yield* all([yield* takeLatest('FETCH_FEEDS_REQUEST', fetchAllFeedsPosts)])
}
