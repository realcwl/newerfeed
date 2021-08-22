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

import { emitter } from '../../libs/emitter'
import * as actions from '../actions'
import * as selectors from '../selectors'
import { ExtractActionFromActionCreator } from '../types/base'

// columnRefresher is a saga that indefinetly refresh columns if it's outdated.
function* columnRefresher() {
  while (true) {
    // Try refresh all columns every 10 seconds.
    yield delay(10 * 1000)
    console.log('try refreshing')

    const allColumnsWithRefreshTime = yield* select(
      selectors.columnsWithRefreshTimeSelector,
    )
    console.log(allColumnsWithRefreshTime)

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
  const columnId = action.payload.id

  if (AppState.currentState === 'active')
    yield* call(InteractionManager.runAfterInteractions)

  emitter.emit('FOCUS_ON_COLUMN', {
    animated: true,
    columnId,
    highlight: true,
    scrollTo: true,
  })

  yield* put(
    actions.fetchColumnDataRequest({
      columnId: columnId,
      // Initial request for fetching data is always of direction "OLD", and
      // update timestamp as 0, so that it will receive new data.
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
