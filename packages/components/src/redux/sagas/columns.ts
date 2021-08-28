import { AppState, InteractionManager } from 'react-native'
import {
  all,
  call,
  put,
  delay,
  select,
  fork,
  takeEvery,
  takeLatest,
} from 'typed-redux-saga'
import axios, { AxiosResponse } from 'axios'
import { emitter } from '../../libs/emitter'
import * as actions from '../actions'
import { jsonToGraphQLQuery } from 'json-to-graphql-query'
import * as selectors from '../selectors'
import { ExtractActionFromActionCreator } from '../types/base'
import { ColumnCreation, constants } from '@devhub/core'
import { WrapUrlWithToken } from '../../utils/api'

// Helper function to extract all subSources to create a column.
function ExtractSubSourceIdsFromColumnCreation(
  payload: ColumnCreation,
): string[] {
  const subSourceIds: string[] = []
  for (const source of payload.sources) {
    for (const subSourceId of source.subSourceIds) {
      subSourceIds.push(subSourceId)
    }
  }
  return subSourceIds
}

function EncodeDataExpressionFromColumnCreation(
  payload: ColumnCreation,
): string {
  if (!payload.dataExpression) return ''
  return JSON.stringify(payload)
}

// columnRefresher is a saga that indefinetly refresh columns if it's outdated.
function* columnRefresher() {
  while (true) {
    // Try refresh all columns every 10 seconds.
    yield delay(10 * 1000)

    const allColumnsWithRefreshTime = yield* select(
      selectors.columnsWithRefreshTimeSelector,
    )

    yield* all(
      allColumnsWithRefreshTime.map(function* (columnWithRefreshTime) {
        if (!columnWithRefreshTime) return
        const oneMinutes = 1000 * 60 * 1
        const timeDiff = Date.now() - columnWithRefreshTime.refreshedAt

        if (timeDiff < oneMinutes) {
          return
        }

        return yield put(
          actions.fetchColumnDataRequest({
            columnId: columnWithRefreshTime.id,
            direction: 'NEW',
          }),
        )
      }),
    )
  }
}

function* onAddColumn(
  action: ExtractActionFromActionCreator<typeof actions.addColumn>,
) {
  const placeHolderColumnId = action.payload.id

  if (AppState.currentState === 'active')
    yield* call(InteractionManager.runAfterInteractions)

  emitter.emit('FOCUS_ON_COLUMN', {
    animated: true,
    columnId: placeHolderColumnId,
    highlight: true,
    scrollTo: true,
  })

  yield* put(actions.setColumnLoading({ columnId: placeHolderColumnId }))

  const appToken = yield* select(selectors.appTokenSelector)
  const userId = yield* select(selectors.userIdSelector)

  let updatedId = ''
  try {
    // 1. Create Feed and get new feed Id
    const createFeedResponse: AxiosResponse = yield axios.post(
      WrapUrlWithToken(constants.DEV_GRAPHQL_ENDPOINT, appToken),
      {
        query: jsonToGraphQLQuery({
          mutation: {
            createFeed: {
              __args: {
                input: {
                  userId: userId,
                  name: action.payload.title,
                  filterDataExpression: EncodeDataExpressionFromColumnCreation(
                    action.payload,
                  ),
                  subSourceIds: ExtractSubSourceIdsFromColumnCreation(
                    action.payload,
                  ),
                },
              },
              id: true,
              updatedAt: true,
            },
          },
        }),
      },
    )
    const { id, updatedAt } = createFeedResponse.data.data.createFeed
    updatedId = id

    // 2. Subscribe to that feed.
    const subscribeFeedResponse: AxiosResponse = yield axios.post(
      WrapUrlWithToken(constants.DEV_GRAPHQL_ENDPOINT, appToken),
      {
        query: jsonToGraphQLQuery({
          mutation: {
            subscribe: {
              __args: {
                input: {
                  userId: userId,
                  feedId: updatedId,
                },
              },
              id: true,
            },
          },
        }),
      },
    )
  } catch (err) {
    const allIds = yield* select(selectors.columnIdsSelector)
    const columnIndex = allIds.indexOf(placeHolderColumnId)
    yield put(
      actions.deleteColumn({ columnId: placeHolderColumnId, columnIndex }),
    )

    // TODO(chenweilunster): Also call deleteFeed() to handle the case where
    // Feed is created successfully, while subscribe fails. Also show error
    // banner with reason.
    return
  }

  // Update column id to be the id returned from backend.
  yield put(
    actions.updateColumnId({
      prevId: placeHolderColumnId,
      updatedId: updatedId,
    }),
  )

  yield put(
    actions.fetchColumnDataRequest({
      columnId: updatedId,
      // Initial request for fetching data is always of direction "OLD"
      direction: 'OLD',
    }),
  )
}

function* onMoveColumn(
  action: ExtractActionFromActionCreator<typeof actions.moveColumn>,
) {
  const ids: string[] = yield* select(selectors.columnIdsSelector)
  if (!(ids && ids.length)) return

  const columnIndex = Math.max(
    0,
    Math.min(action.payload.columnIndex, ids.length - 1),
  )
  if (Number.isNaN(columnIndex)) return

  const columnId = action.payload.columnId

  emitter.emit('FOCUS_ON_COLUMN', {
    animated: true,
    highlight: false,
    scrollTo: true,
    ...action.payload,
    columnId,
    focusOnVisibleItem: true,
  })

  // Column ordering is seedState, sync up
  yield* put(actions.syncUp())
}

function* onDeleteColumn(
  action: ExtractActionFromActionCreator<typeof actions.deleteColumn>,
) {
  const ids: string[] = yield* select(selectors.columnIdsSelector)
  if (!(ids && ids.length)) return

  // Fixes blank screen on Android after removing the last column.
  // If removed the last column,
  // scroll to the new last valid column
  if (action.payload.columnIndex > ids.length - 1) {
    emitter.emit('FOCUS_ON_COLUMN', {
      animated: false,
      columnId: ids[ids.length - 1],
      highlight: false,
      scrollTo: true,
    })
  }
}

function* onClearColumnOrColumns(
  action: ExtractActionFromActionCreator<
    typeof actions.setColumnClearedAtFilter | typeof actions.clearAllColumns
  >,
) {
  if (action.payload.clearedAt === null) return
  yield put(actions.cleanupArchivedItems())
}

// fetchColumnData is the unified saga that handles feed request.
function* onFetchColumnDataRequest(
  action: ExtractActionFromActionCreator<typeof actions.fetchColumnDataRequest>,
) {
  // TODO(boning): Construct the actual post request here and call backend for
  // more data.

  // TODO(boning): This is just to simulate the delay for actual data fetching,
  // should be removed once the data fetching is implemented.
  yield delay(1000)

  yield put(
    actions.fetchColumnDataSuccess({
      columnId: action.payload.columnId,
      data: [
        {
          id: 'dummyCard1',
          title: `I am dummyCard's dummy title with more than one line as well`,
          text: `first card with some real real real long descriptions www.google.com and real long text and see if it works shorturl.at/ijksA !`,
          author: {
            avatar: {
              imageURL:
                'https://gravatar.com/avatar/09644abc0162e221e1c9ffb8a20c57ed?s=400&d=robohash&r=x',
            },
            name: 'John Doe',
            profileURL: '/',
          },
          crawledTimestamp: new Date('2021-01-02'),
          attachments: [
            {
              id: 'dummyImg',
              dataType: 'img',
              url: 'https://images.unsplash.com/photo-1544526226-d4568090ffb8?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8aGQlMjBpbWFnZXxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80',
            },
            {
              id: 'dummyImg2',
              dataType: 'img',
              url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/2560px-Image_created_with_a_mobile_phone.png',
            },
          ],
          isSaved: false,
          isRead: false,
        },
        {
          id: 'dummyCard2',
          title: `I am dummyCard2's dummy title with more than one line as well`,
          text: `www.facebook.com second card with some descriptions!`,
          author: {
            avatar: {
              imageURL:
                'https://gravatar.com/avatar/09644abc0162e221e1c9ffb8a20c57ed?s=400&d=robohash&r=x',
            },
            name: 'John Doe',
            profileURL: '/',
          },
          attachments: [
            {
              id: 'dummyData3',
              dataType: 'img',
              url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/TEIDE.JPG/2880px-TEIDE.JPG',
            },
            {
              id: 'dummyData4',
              dataType: 'img',
              url: 'https://hbimg.huabanimg.com/300251098bb1d62a1d89f40c2e8018bbb415414c912fc-5z5wMR_fw658',
            },
          ],
          crawledTimestamp: new Date('2021-05-02'),
          isSaved: false,
          isRead: false,
        },
        {
          id: 'dummyCard3',
          title: `I am dummyCard3's dummy title with more than one line as well`,
          text: `third card with some longest descriptions \nwww.google.com and real long text \n
        and see if it works shorturl.at/ijksA again\n let's see!`,
          author: {
            avatar: {
              imageURL:
                'https://gravatar.com/avatar/09644abc0162e221e1c9ffb8a20c57ed?s=400&d=robohash&r=x',
            },
            name: 'John Doe',
            profileURL: '/',
          },
          crawledTimestamp: new Date('2021-06-02'),
          isSaved: false,
          isRead: false,
        },
      ],
      updatedAt: 0,
      dropExistingData: true,
      direction: 'OLD',
    }),
  )
}

export function* columnsSagas() {
  yield* all([
    yield* fork(columnRefresher),
    yield* takeEvery('ADD_COLUMN', onAddColumn),
    yield* takeEvery('FETCH_COLUMN_DATA_REQUEST', onFetchColumnDataRequest),
    yield* takeEvery('MOVE_COLUMN', onMoveColumn),
    yield* takeEvery('DELETE_COLUMN', onDeleteColumn),
    yield* takeLatest(
      ['SET_COLUMN_CLEARED_AT_FILTER', 'CLEAR_ALL_COLUMNS'],
      onClearColumnOrColumns,
    ),
  ])
}
