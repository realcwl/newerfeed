import {
  all,
  delay,
  put,
  takeLatest,
  select,
  takeEvery,
} from 'typed-redux-saga'
import { jsonToGraphQLQuery } from 'json-to-graphql-query'
import axios, { AxiosResponse } from 'axios'

import { saveViewToClipboard } from '../../libs/html-to-image'
import { capatureView, setBannerMessage } from '../actions'
import { ExtractActionFromActionCreator } from '../types/base'
import * as actions from '../actions'
import { WrapUrlWithToken } from '../../utils/api'
import * as selectors from '../selectors'
import { Post, postToNewsFeedData } from './columns'
import { constants } from '@devhub/core'

const DEFAULT_ERROR_MESSAGE = 'Failed to save to clipboard'
const DEFAULT_SUCCESS_MESSAGE = 'Copied to clipboard'

function* onCaptureItemView(
  action: ExtractActionFromActionCreator<typeof capatureView>,
) {
  try {
    yield delay(50) // wait for potential show more rerender
    yield saveViewToClipboard(
      action.payload.viewRef,
      action.payload.backgroundColor,
    )
    yield put(
      setBannerMessage({
        id: 'clipboard',
        type: 'BANNER_TYPE_SUCCESS',
        message: DEFAULT_SUCCESS_MESSAGE,
        autoClose: true,
      }),
    )
  } catch (e) {
    let message = DEFAULT_ERROR_MESSAGE
    if (e instanceof Error) {
      message = e.message
    }
    yield put(
      setBannerMessage({
        id: 'clipboard',
        type: 'BANNER_TYPE_ERROR',
        message: message,
        autoClose: true,
      }),
    )
  }
}

function constructFetchPostByIdRequest(id: string): string {
  return jsonToGraphQLQuery({
    query: {
      post: {
        __args: {
          input: {
            id,
          },
        },

        id: true,
        title: true,
        content: true,
        cursor: true,
        subSource: {
          id: true,
          name: true,
          avatarUrl: true,
        },
        sharedFromPost: {
          id: true,
          title: true,
          content: true,
          cursor: true,
          subSource: {
            id: true,
            name: true,
            avatarUrl: true,
          },
          imageUrls: true,
          fileUrls: true,
          contentGeneratedAt: true,
          crawledAt: true,
          originUrl: true,
        },
        imageUrls: true,
        fileUrls: true,
        contentGeneratedAt: true,
        crawledAt: true,
        originUrl: true,
      },
    },
  })
}

function* onFetchPostById(
  action: ExtractActionFromActionCreator<typeof actions.fetchPost>,
) {
  const id = action.payload.id
  const appToken = yield* select(selectors.appTokenSelector) // testing purpose

  try {
    console.log('YZ will make fetch post call', appToken)
    const response: AxiosResponse = yield axios.post(
      WrapUrlWithToken(constants.GRAPHQL_ENDPOINT, ''), //appToken || ''),
      { query: constructFetchPostByIdRequest(id) },
    )
    const post: Post = response.data.data.post
    const data = postToNewsFeedData(post)
    yield put(
      actions.fetchPostSuccess({
        id,
        data,
      }),
    )
  } catch (e) {
    yield put(
      actions.fetchPostFailure({
        id,
      }),
    )
    console.error(e)
  }
}

export function* dataSagas() {
  yield* all([
    yield* takeLatest('CAPTURE_VIEW', onCaptureItemView),
    yield* takeEvery('FETCH_POST', onFetchPostById),
  ])
}
