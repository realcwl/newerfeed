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
import { jsonToGraphQLQuery, EnumType } from 'json-to-graphql-query'
import * as selectors from '../selectors'
import { ExtractActionFromActionCreator } from '../types/base'
import {
  Attachment,
  ColumnCreation,
  constants,
  FeedVisibility,
  NewsFeedColumn,
  NewsFeedColumnCreation,
  NewsFeedColumnSource,
  NewsFeedData,
  NewsFeedDataExpressionWrapper,
} from '@devhub/core'
import { WrapUrlWithToken } from '../../utils/api'
import {
  COLUMN_OUT_OF_SYNC_TIME_IN_MILLI_SECOND,
  EMPTY_ARRAY,
} from '@devhub/core/src/utils/constants'
import { notify } from '../../utils/notify'

import { saveViewToClipboard } from '../../libs/html-to-image'

export interface Post {
  id: string
  title: string
  content: string
  cursor: number
  subSource: {
    id: string
    name: string
    avatarUrl: string
    externalIdentifier: string
  }
  sharedFromPost: Post
  imageUrls: string[]
  fileUrls: string[]
  contentGeneratedAt: string
  crawledAt: string
  originUrl: string
  semanticHashing: string
  tags: string[]
  replyThread: Post[]
}

interface FeedResponse {
  id: string
  updatedAt: string
  name: string
  creator: {
    id: string
    name: string
    email: string
  }
  filterDataExpression: string
  subSources: {
    id: string
    source: {
      id: string
    }
  }[]
  visibility: FeedVisibility
}

interface FeedResponseWithSubscriberCount extends FeedResponse {
  subscriberCount: number
}

interface FeedWithPostsResponse extends FeedResponse {
  posts: Post[]
}

interface FeedsResponse {
  data: {
    feeds: FeedWithPostsResponse[]
  }
}

// clean data when:
// 1. mismatch updatedAt
// 2. post.length == limit
function shouldDropExistingData(
  response: FeedsResponse,
  originalUpdatedAt: string,
  currentUpdatedAt: string,
  direction: 'NEW' | 'OLD',
): boolean {
  if (response.data.feeds.length === 0) return false
  return (
    originalUpdatedAt != currentUpdatedAt ||
    (direction === 'NEW' &&
      response.data.feeds[0].posts.length === constants.FEED_FETCH_LIMIT)
  )
}

function convertFeedResponseToSources(
  feedResponse: FeedResponse,
): NewsFeedColumnSource[] {
  const sources: NewsFeedColumnSource[] = []
  if (feedResponse.subSources.length === 0) return sources
  for (const subSource of feedResponse.subSources) {
    const source = sources.find((s) => s.sourceId == subSource.source.id)
    if (source) {
      source.subSourceIds.push(subSource.id)
      continue
    }
    sources.push({
      sourceId: subSource.source.id,
      subSourceIds: [subSource.id],
    })
  }
  return sources
}

function convertFeedsResponseToSources(
  response: FeedsResponse,
): NewsFeedColumnSource[] {
  const sources: NewsFeedColumnSource[] = []
  if (response.data.feeds.length === 0) return sources
  return convertFeedResponseToSources(response.data.feeds[0])
}

// contructt profile url based on profileId and originaUrl
function constructProfileUrl(profileId: string, originUrl: string) {
  if (originUrl && originUrl.includes('://m.weibo.cn/')) {
    return `https://weibo.com/u/${profileId}`
  }
  return undefined
}

export const postToNewsFeedData = (post: Post): NewsFeedData => {
  let attachments: Attachment[] = []
  if (post.imageUrls.length !== 0) {
    attachments = attachments.concat(
      post.imageUrls.map((url) => {
        return { id: url, dataType: 'img', url: url }
      }),
    )
  }
  if (post.fileUrls && post.fileUrls.length !== 0) {
    attachments = attachments.concat(
      post.fileUrls.map((url) => {
        return {
          id: url,
          dataType: 'file',
          name: url.split('/')[url.split('/').length - 1],
          url: url,
        }
      }),
    )
  }
  return {
    id: post.id,
    title: post.title,
    text: post.content,
    crawledTime: post.crawledAt,
    postTime: post.contentGeneratedAt ? post.contentGeneratedAt : undefined,
    cursor: post.cursor,
    subSource: {
      id: post.subSource.id,
      name: post.subSource.name,
      avatarURL: post.subSource.avatarUrl,
      profileURL: constructProfileUrl(
        post.subSource.externalIdentifier,
        post.originUrl,
      ),
    },
    repostedFrom: post.sharedFromPost
      ? postToNewsFeedData(post.sharedFromPost)
      : undefined,
    url: post.originUrl,
    isRead: false,
    isSaved: false,
    attachments: attachments,
    semanticHashing: post.semanticHashing,
    tags: post.tags,
    thread: !!post.replyThread
      ? post.replyThread.map((p) => postToNewsFeedData(p))
      : undefined,
  }
}

function convertFeedsResponseToNewsFeedData(
  response: FeedsResponse,
): NewsFeedData[] {
  if (response.data.feeds.length === 0) return EMPTY_ARRAY
  return response.data.feeds[0].posts.map((post) => {
    return postToNewsFeedData(post)
  })
}

export function StringToDataExpressionWrapper(
  jsonString: string,
): NewsFeedDataExpressionWrapper {
  const wrapper: NewsFeedDataExpressionWrapper = JSON.parse(jsonString)
  return wrapper
}

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

// The only different is that input should contain 'feedId' on column update,
// otherwise no feedId should be provided on feed creation. Due to the
// limitation of jsonToGraphQLQuery, there isn't an easy way of omitting
// certain field at runtime, thus we have to duplicate it.
// P.S. It might be possible to ignoring certain field with the following
// method, but I've not tested whether nested field can adopt the same approach.
// https://github.com/vkolgi/json-to-graphql-query#ignoring-fields-in-the-query-object
function getUpsertFeedRequest(
  columnCreation: NewsFeedColumnCreation,
  userId: string,
  isUpdate: boolean,
): string {
  if (isUpdate) {
    return jsonToGraphQLQuery({
      mutation: {
        upsertFeed: {
          __args: {
            input: {
              feedId: columnCreation.id,
              userId: userId,
              name: columnCreation.title,
              filterDataExpression:
                EncodeDataExpressionFromColumnCreation(columnCreation),
              subSourceIds:
                ExtractSubSourceIdsFromColumnCreation(columnCreation),
              visibility: new EnumType(columnCreation.visibility),
            },
          },
          id: true,
        },
      },
    })
  }
  return jsonToGraphQLQuery({
    mutation: {
      upsertFeed: {
        __args: {
          input: {
            userId: userId,
            name: columnCreation.title,
            filterDataExpression:
              EncodeDataExpressionFromColumnCreation(columnCreation),
            subSourceIds: ExtractSubSourceIdsFromColumnCreation(columnCreation),
            visibility: new EnumType(columnCreation.visibility),
          },
        },
        id: true,
      },
    },
  })
}

function EncodeDataExpressionFromColumnCreation(
  payload: ColumnCreation,
): string {
  if (!payload.dataExpression) return ''
  return JSON.stringify(payload.dataExpression)
}

function constructFeedRequest(
  userId: string,
  column: NewsFeedColumn,
  direction: 'NEW' | 'OLD',
  dataByNodeId: Record<string, NewsFeedData>,
): string {
  let { updatedAt } = column
  let cursor = 0
  if (direction == 'NEW') {
    const data = dataByNodeId[column.newestItemId]
    if (data) cursor = data.cursor
    else updatedAt = ''
  } else {
    const data = dataByNodeId[column.oldestItemId]
    if (data) cursor = data.cursor
    else updatedAt = ''
  }

  return jsonToGraphQLQuery({
    query: {
      feeds: {
        __args: {
          input: {
            userId: userId,
            feedRefreshInputs: [
              {
                feedId: column.id,
                limit: constants.FEED_FETCH_LIMIT,
                cursor: cursor,
                direction: new EnumType(direction),
                feedUpdatedTime: !!updatedAt
                  ? new Date(updatedAt).toISOString()
                  : null,
              },
            ],
          },
        },
        id: true,
        updatedAt: true,
        name: true,
        posts: {
          id: true,
          title: true,
          content: true,
          cursor: true,
          subSource: {
            id: true,
            name: true,
            avatarUrl: true,
            externalIdentifier: true,
          },
          originUrl: true,
          imageUrls: true,
          fileUrls: true,
          contentGeneratedAt: true,
          sharedFromPost: {
            id: true,
            title: true,
            content: true,
            subSource: {
              id: true,
              name: true,
              avatarUrl: true,
              externalIdentifier: true,
            },
            imageUrls: true,
            contentGeneratedAt: true,
            originUrl: true,
            tags: true,
          },
          semanticHashing: true,
          tags: true,
          replyThread: {
            id: true,
            title: true,
            content: true,
            cursor: true,
            subSource: {
              id: true,
              name: true,
              avatarUrl: true,
            },
            originUrl: true,
            imageUrls: true,
            fileUrls: true,
            contentGeneratedAt: true,
            sharedFromPost: {
              id: true,
              title: true,
              content: true,
              subSource: {
                id: true,
                name: true,
                avatarUrl: true,
              },
              imageUrls: true,
              contentGeneratedAt: true,
              originUrl: true,
            },
          },
        },
        subSources: {
          id: true,
          source: {
            id: true,
          },
        },
        filterDataExpression: true,
        visibility: true,
      },
    },
  })
}

function* initialRefreshAllOutdatedColumn() {
  yield* refreshAllOutdatedColumn({ notifyOnNewPosts: false })
  yield* fetchSharedFeeds()
}

function* refreshAllOutdatedColumn({ notifyOnNewPosts = false }) {
  const allColumnsWithRefreshTimeAndNotifySetting = yield* select(
    selectors.columnsWithRefreshTimeAndNotifySettingSelector,
  )

  yield* all(
    allColumnsWithRefreshTimeAndNotifySetting.map(function* (
      columnWithRefreshTimeAndNofitySetting,
    ) {
      if (!columnWithRefreshTimeAndNofitySetting) return
      const timeDiff =
        Date.now() -
        Date.parse(columnWithRefreshTimeAndNofitySetting.refreshedAt)

      if (timeDiff < COLUMN_OUT_OF_SYNC_TIME_IN_MILLI_SECOND) {
        return
      }

      return yield put(
        actions.fetchColumnDataRequest({
          notifyOnNewPosts:
            notifyOnNewPosts &&
            columnWithRefreshTimeAndNofitySetting.notifyOnNewPosts,
          columnId: columnWithRefreshTimeAndNofitySetting.id,
          direction: 'NEW',
        }),
      )
    }),
  )
}

// columnRefresher is a saga that indefinetly refresh columns if it's outdated.
function* columnRefresher() {
  while (true) {
    // Try refresh all columns every 10 seconds.
    yield delay(10 * 1000)

    // Refresh all outdated column
    yield* refreshAllOutdatedColumn({ notifyOnNewPosts: true })
  }
}

function* onAddColumn(
  action: ExtractActionFromActionCreator<typeof actions.addColumn>,
) {
  const placeHolderOrColumnId = action.payload.id

  const isUpdate = !!action.payload.isUpdate
  const subscribeOnly = !!action.payload.subscribeOnly

  if (AppState.currentState === 'active')
    yield* call(InteractionManager.runAfterInteractions)

  emitter.emit('FOCUS_ON_COLUMN', {
    animated: true,
    columnId: placeHolderOrColumnId,
    highlight: true,
    scrollTo: true,
  })

  yield* put(actions.setColumnLoading({ columnId: placeHolderOrColumnId }))

  const appToken = yield* select(selectors.appTokenSelector)
  const userId = yield* select(selectors.currentUserIdSelector)
  if (!userId) {
    yield put(actions.authFailure(Error('no user id found')))
    return
  }

  let updatedId = ''
  try {
    // 1. Upsert Feed and get new/old feed Id
    // For subscribe case, we reuse the columnId created by others
    if (subscribeOnly) {
      updatedId = placeHolderOrColumnId
    } else {
      const createFeedResponse: AxiosResponse = yield axios.post(
        WrapUrlWithToken(constants.GRAPHQL_ENDPOINT, appToken),
        {
          query: getUpsertFeedRequest(action.payload, userId, isUpdate),
        },
      )

      const { id } = createFeedResponse.data.data.upsertFeed
      updatedId = id
    }

    // 2. Subscribe to that feed if this is a feed creation (isUpdate == false)
    if (!isUpdate || subscribeOnly) {
      const subscribeFeedResponse: AxiosResponse = yield axios.post(
        WrapUrlWithToken(constants.GRAPHQL_ENDPOINT, appToken),
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
    }
  } catch (err) {
    console.error(err)

    // Fail to create should trigger feed deletion.
    if (!isUpdate) {
      const allIds = yield* select(selectors.columnIdsSelector)
      const columnIndex = allIds.indexOf(placeHolderOrColumnId)
      yield put(
        actions.deleteColumn({ columnId: placeHolderOrColumnId, columnIndex }),
      )
    }

    return
  }

  // Update column id to be the id returned from backend. In the case of feed
  // update, this action is no-op.
  yield put(
    actions.updateColumnId({
      prevId: placeHolderOrColumnId,
      updatedId: updatedId,
    }),
  )

  yield put(
    actions.fetchColumnDataRequest({
      columnId: updatedId,
      // Initial request for fetching data is always of direction "OLD"
      direction: 'OLD',
      notifyOnNewPosts: false,
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
  if (ids && ids.length) {
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

  // call backend for feed deletion.
  const appToken = yield* select(selectors.appTokenSelector)
  const userId = yield* select(selectors.currentUserIdSelector)
  try {
    const deleteFeedResponse: AxiosResponse = yield axios.post(
      WrapUrlWithToken(constants.GRAPHQL_ENDPOINT, appToken),
      {
        query: jsonToGraphQLQuery({
          mutation: {
            deleteFeed: {
              __args: {
                input: {
                  userId: userId,
                  feedId: action.payload.columnId,
                },
              },
              id: true,
            },
          },
        }),
      },
    )
  } catch (err) {
    // intentionally not handling delete feed error. Reason being that fail to
    // delete won't be a big problem. The feed might comeback in the next
    // seedState push, but user could just try again to force the delete.
    // Otherwise, we'll need to handle a very complex delete-reversion.
    console.error('fail to delete feed ', action.payload.columnId, err)
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
// There are 4 scenarios this saga is executed:
// 1. At normal feed refresh time:
// In this case, requesting updatedAt is getting from redux store, direction is
// set to NEW, and cursor is set as the largest in feed. If the coming request
// contains ${feedRefreshLimit} items, it (most likely) means there's a gap
// between current data and returning data, and frontend should drop all
// existing data by setting ${dropExistingData}.
// 2. At normal feed load more:
// This case requesting updatedAt is getting from redux store, and direction is
// set to OLD, with cursor setting as smallest in feed. Frontend should just
// append the incoming items to the data list of the column under action.
// 3. At column creation time:
// In this case, requesting updatedAt is undefined, and direction is set to OLD,
// with cursor setting as integer.MAX. Response is a bit slow in this case
// because it requires on-the-fly database join.
// 4. At column update time:
// Requesting with updatedAt getting from Redux store, direction is set to NEW
// and cursor is set to largest in feed. If the returning response contains
// different updatedAt, it means local feed's attributes/content is out-of-sync,
// and frontend should drop all existing data by setting ${dropExistingData} for
// the column under action.
function* onFetchColumnDataRequest(
  action: ExtractActionFromActionCreator<typeof actions.fetchColumnDataRequest>,
) {
  const appToken = yield* select(selectors.appTokenSelector)
  const userId = yield* select(selectors.currentUserIdSelector)
  const column = yield* select(
    selectors.columnSelector,
    action.payload.columnId,
  )
  if (!appToken || !column || !userId) {
    yield put(
      actions.fetchColumnDataFailure({ columnId: action.payload.columnId }),
    )
    return
  }
  const dataByNodeId = yield* select(selectors.dataByNodeIdOrId)

  const { updatedAt } = column

  try {
    const fetchDataResponse: AxiosResponse<FeedsResponse> = yield axios.post(
      WrapUrlWithToken(constants.GRAPHQL_ENDPOINT, appToken),
      {
        query: constructFeedRequest(
          userId,
          column,
          action.payload.direction,
          dataByNodeId,
        ),
      },
    )

    if (
      !fetchDataResponse.data.data ||
      fetchDataResponse.data.data.feeds.length !== 1
    ) {
      yield put(actions.fetchColumnDataFailure({ columnId: column.id }))
      return
    }

    const feed = fetchDataResponse.data.data.feeds[0]

    const posts = convertFeedsResponseToNewsFeedData(fetchDataResponse.data)
    if (action.payload.notifyOnNewPosts && action.payload.direction === 'NEW') {
      for (const post of posts) {
        notify(post)
      }
    }

    yield put(
      actions.fetchColumnDataSuccess({
        columnId: column.id,
        data: posts,
        updatedAt: fetchDataResponse.data.data.feeds[0].updatedAt,
        direction: action.payload.direction,
        dropExistingData: shouldDropExistingData(
          fetchDataResponse.data,
          updatedAt,
          feed.updatedAt,
          action.payload.direction,
        ),
        sources: convertFeedsResponseToSources(fetchDataResponse.data),
        dataExpression: StringToDataExpressionWrapper(
          feed.filterDataExpression,
        ),
        dataByNodeId: dataByNodeId,
      }),
    )
  } catch (err) {
    yield put(actions.fetchColumnDataFailure({ columnId: column.id }))
    console.error(err)
  }
}

function* fetchSharedFeeds() {
  const appToken = yield* select(selectors.appTokenSelector)

  try {
    const visibleFeeds: AxiosResponse = yield axios.post(
      WrapUrlWithToken(constants.GRAPHQL_ENDPOINT, appToken),
      {
        query: jsonToGraphQLQuery({
          query: {
            allVisibleFeeds: {
              id: true,
              name: true,
              creator: {
                id: true,
                name: true,
              },
              updatedAt: true,
              filterDataExpression: true,
              subSources: {
                id: true,
                name: true,
                source: {
                  id: true,
                },
                externalIdentifier: true,
              },
              visibility: true,
              subscriberCount: true,
            },
          },
        }),
      },
    )

    yield put(
      actions.setSharedColumns({
        feeds: visibleFeeds.data.data.allVisibleFeeds?.map((f: any) => {
          return {
            ...f,
            title: f.name,
            sources: convertFeedResponseToSources(f),
            type: 'COLUMN_TYPE_NEWS_FEED',
            icon: {
              family: 'material',
              name: 'rss-feed',
            },
            creator: f.creator,
            dataExpression: StringToDataExpressionWrapper(
              f.filterDataExpression,
            ),
            itemListIds: [],
            newestItemId: '',
            oldestItemId: '',
            refreshedAt: '',
            state: 'not_loaded',
            options: { enableAppIconUnreadIndicator: true },
            subscriberCount: f.subscriberCount,
          }
        }),
      }),
    )
  } catch (err) {
    console.error(err)
  }
}

const DEFAULT_ERROR_MESSAGE = 'Failed to save to clipboard'
const DEFAULT_SUCCESS_MESSAGE = 'Copied to clipboard'

function* onCaptureItemView(
  action: ExtractActionFromActionCreator<typeof actions.capatureView>,
) {
  try {
    yield delay(50) // wait for potential show more rerender
    yield saveViewToClipboard(
      action.payload.viewRef,
      action.payload.backgroundColor,
    )
    yield put(
      actions.capatureViewCompleted({
        itemNodeId: action.payload.itemNodeId,
      }),
    )
    yield put(
      actions.setBannerMessage({
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
      actions.capatureViewCompleted({
        itemNodeId: action.payload.itemNodeId,
      }),
    )
    yield put(
      actions.setBannerMessage({
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
          externalIdentifier: true,
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
            externalIdentifier: true,
          },
          imageUrls: true,
          fileUrls: true,
          contentGeneratedAt: true,
          crawledAt: true,
          originUrl: true,
          tags: true,
        },
        imageUrls: true,
        fileUrls: true,
        contentGeneratedAt: true,
        crawledAt: true,
        originUrl: true,
        tags: true,
      },
    },
  })
}

function* onFetchPostById(
  action: ExtractActionFromActionCreator<typeof actions.fetchPost>,
) {
  const id = action.payload.id
  const appToken = yield* select(selectors.appTokenSelector)

  try {
    const response: AxiosResponse = yield axios.post(
      WrapUrlWithToken(constants.GRAPHQL_ENDPOINT, appToken || ''),
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

export function* columnsSagas() {
  yield* all([
    yield* fork(columnRefresher),
    yield* takeEvery('UPDATE_SEED_STATE', initialRefreshAllOutdatedColumn),
    yield* takeEvery('ADD_COLUMN', onAddColumn),
    yield* takeEvery('FETCH_COLUMN_DATA_REQUEST', onFetchColumnDataRequest),
    yield* takeEvery('MOVE_COLUMN', onMoveColumn),
    yield* takeEvery('DELETE_COLUMN', onDeleteColumn),
    yield* takeLatest(
      ['SET_COLUMN_CLEARED_AT_FILTER', 'CLEAR_ALL_COLUMNS'],
      onClearColumnOrColumns,
    ),
    yield* takeLatest('CAPTURE_VIEW', onCaptureItemView),
    yield* takeEvery('FETCH_POST', onFetchPostById),
  ])
}
