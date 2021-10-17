import _ from 'lodash'

import {
  Column,
  ColumnCreation,
  NewsFeedColumn,
  NewsFeedData,
  normalizeColumns,
} from '@devhub/core'
import { Reducer } from '../types'
import immer from 'immer'

export interface State {
  // All column ids, each id is a hex string. The rendering order will be the
  // same as the list order.
  allIds: string[]

  // All shared column ids
  sharedIds: string[]

  // byId maps the hex string column id to the Column type, where details of the
  // Column such as column header, type, are defined. Note that this is only a
  // definition of the column, the mapping between column->data are defined in
  // each Column, and actual data is stored in data reducer.
  byId: Record<string, Column>
}

const initialState: State = {
  allIds: [],
  sharedIds: [],
  byId: {},
}

// Update the cursor window for this column
function updateColumnCursor(
  column: NewsFeedColumn,
  data: NewsFeedData[],
  dataByNodeId: Record<string, NewsFeedData>,
): void {
  if (data.length === 0) return

  let maxCursor = -1,
    minCursor = Number.MAX_SAFE_INTEGER,
    maxIdx = -1,
    minIdx = -1
  for (let idx = 0; idx < data.length; idx++) {
    if (data[idx].cursor > maxCursor) {
      maxCursor = data[idx].cursor
      maxIdx = idx
    }
    if (data[idx].cursor < minCursor) {
      minCursor = data[idx].cursor
      minIdx = idx
    }
  }

  // Either cursor item doesn't exist (empty string), or exist but smaller/
  // larger than the returning data's cursor.
  if (
    !column.newestItemId ||
    (dataByNodeId[column.newestItemId] &&
      dataByNodeId[column.newestItemId].cursor < maxCursor)
  ) {
    column.newestItemId = data[maxIdx].id
  }
  if (
    !column.oldestItemId ||
    (dataByNodeId[column.oldestItemId] &&
      dataByNodeId[column.oldestItemId].cursor > minCursor)
  ) {
    column.oldestItemId = data[minIdx].id
  }
}

export const columnsReducer: Reducer<State> = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case 'ADD_COLUMN':
      return immer(state, (draft) => {
        // Initialize state byId it's not already initialized.
        draft.byId = draft.byId || {}

        // Get normalized state expression for the action payload, which
        // basically converts from the action payload to actual state.
        const normalized = normalizeColumns([{ ...action.payload }])

        // Must only contain a single column id.
        if (!(normalized.allIds.length === 1)) return

        // Is id exists, this is an attribute modification and we should replace
        // the value with new payload and return.
        if (draft.allIds.includes(normalized.allIds[0])) {
          draft.byId[normalized.allIds[0]] =
            normalized.byId[normalized.allIds[0]]
          return
        }
        draft.allIds.push(normalized.allIds[0])
        _.merge(draft.byId, normalized.byId)
      })
    case 'DELETE_COLUMN':
      return immer(state, (draft) => {
        if (draft.allIds)
          draft.allIds = draft.allIds.filter(
            (id) => id !== action.payload.columnId,
          )
        if (
          draft.byId &&
          draft.byId[action.payload.columnId].visibility === 'PRIVATE'
        )
          delete draft.byId[action.payload.columnId]
      })
    case 'MOVE_COLUMN':
      return immer(state, (draft) => {
        if (!draft.allIds) return

        const currentIndex = draft.allIds.findIndex(
          (id) => id === action.payload.columnId,
        )
        if (!(currentIndex >= 0 && currentIndex < draft.allIds.length)) return

        const newIndex = Math.max(
          0,
          Math.min(action.payload.columnIndex, draft.allIds.length - 1),
        )
        if (Number.isNaN(newIndex)) return

        // move column inside array
        const columnId = draft.allIds[currentIndex]
        draft.allIds = draft.allIds.filter((id) => id !== columnId)
        draft.allIds.splice(newIndex, 0, columnId)
      })
    case 'UPDATE_SEED_STATE':
      return immer(state, (draft) => {
        const feedSeedStates = action.payload.feedSeedState
        const newAllIds = feedSeedStates.map((v) => v.id)

        // Get all added feeds as objects
        const addFeeds = feedSeedStates.filter(
          (v) => !draft.allIds.includes(v.id),
        )

        // All existing feeds that might require update on feed seed state
        const updateFeeds = feedSeedStates.filter(
          (v) => draft.allIds.includes(v.id) && newAllIds.includes(v.id),
        )

        // Get all deleted feeds as ids
        const delIds = draft.allIds.filter(
          (v) => !newAllIds.includes(v) && !draft.sharedIds.includes(v),
        )

        // Only update when the ids in feed change. It should:
        // 1. substitude the ids
        // 2. remove deleted ones
        // 3. update common feeds
        // 4. add new ids
        if (!_.isEqual(newAllIds, draft.allIds)) {
          draft.allIds = newAllIds
        }

        delIds.forEach((v) => {
          if (draft.byId) delete draft.byId[v]
        })

        updateFeeds.forEach((v) => {
          draft.byId[v.id].title = v.name
        })

        addFeeds.forEach((v) => {
          const columnCreation: ColumnCreation = {
            title: v.name,
            type: 'COLUMN_TYPE_NEWS_FEED',
            icon: {
              // TODO(chenweilunster): Since SeedState doesn't include icon as
              // of today, for newly added feeds, we don't really know the icon
              // for them, thus using default rss-feed instead. Later we should
              // change this to be deduct from seedState once icon information
              // is included.
              family: 'material',
              name: 'rss-feed',
            },
            id: v.id,
            itemListIds: [],
            newestItemId: '',
            oldestItemId: '',
            sources: [],
            state: 'not_loaded',
            dataExpression: undefined,
            options: { enableAppIconUnreadIndicator: true },
            visibility: 'PRIVATE',
            subscriberCount: 1,
          }
          const normalized = normalizeColumns([{ ...columnCreation }])

          if (!(normalized.allIds.length === 1)) return

          draft.byId[normalized.allIds[0]] =
            normalized.byId[normalized.allIds[0]]
        })
      })
    case 'REPLACE_COLUMN_FILTER':
      return immer(state, (draft) => {
        const { columnId, filter } = action.payload
        if (draft.byId[columnId]) {
          draft.byId[columnId].filters = filter
        }
      })
    case 'SET_COLUMN_SAVED_FILTER':
      return immer(state, (draft) => {
        const { columnId, saved } = action.payload
        if (draft.byId[columnId]) {
          draft.byId[columnId].filters = {
            ...draft.byId[columnId].filters,
            saved: saved,
          }
        }
      })
    case 'SET_COLUMN_OPTION': {
      return immer(state, (draft) => {
        const { columnId, option, value } = action.payload
        if (!draft.byId) return

        const column = draft.byId[columnId]
        if (!column) return

        if (!option) return

        column.options = column.options || {}

        column.options[option] = value
      })
    }
    case 'FETCH_COLUMN_DATA_REQUEST':
    case 'SET_COLUMN_LOADING':
      return immer(state, (draft) => {
        const { columnId } = action.payload
        if (draft.byId[columnId]) {
          draft.byId[columnId].state = 'loading'
        }
      })
    case 'SET_SHARED_COLUMNS':
      return immer(state, (draft) => {
        draft.sharedIds = action.payload.feeds.map((f) => f.id)
        action.payload.feeds.forEach((v) => {
          draft.byId[v.id] = {
            ...draft.byId[v.id],
            id: v.id,
            icon: draft.byId[v.id]?.icon ?? v.icon,
            creator: v.creator,
            sources: v.sources ?? [],
            dataExpression: v.dataExpression,
            title: v.title,
            visibility: v.visibility,
            subscriberCount: v.subscriberCount,
          }
        })
      })
    case 'UPDATE_COLUMN_ID': {
      return immer(state, (draft) => {
        const { prevId, updatedId } = action.payload
        if (prevId === updatedId) {
          // This could happen when updating feed, where same feedId is returned
          return
        }
        const idx = draft.allIds.indexOf(prevId)
        if (idx === -1) {
          console.error('cannot find the original id: ' + prevId)
          return
        }
        draft.allIds[idx] = updatedId
        draft.byId[updatedId] = draft.byId[prevId]
        draft.byId[updatedId].id = updatedId
        delete draft.byId[prevId]
      })
    }
    case 'FETCH_COLUMN_DATA_SUCCESS':
      return immer(state, (draft) => {
        const {
          columnId,
          updatedAt,
          data,
          direction,
          dropExistingData,
          dataExpression,
          sources,
          dataByNodeId,
        } = action.payload

        const column = draft.byId[columnId]
        if (!column) return

        // if explicit drop is requested, we drop all data and the cursors.
        if (dropExistingData) {
          column.itemListIds = []
          column.newestItemId = ''
          column.oldestItemId = ''
        }

        // update cursor
        updateColumnCursor(column, data, dataByNodeId)

        // append of insert front based on the direction. Assuming there's no
        // overlap between returned data and original data. We don't insert the
        // same data into column item list to keep this reducer idempotent.
        const filteredData = data.filter(
          (d) => !column.itemListIds.includes(d.id),
        )
        if (direction == 'NEW') {
          column.itemListIds = filteredData
            .map((d) => d.id)
            .concat(column.itemListIds)
        } else {
          column.itemListIds = column.itemListIds.concat(
            filteredData.map((d) => d.id),
          )
        }

        // if data expression or sources is returned, update them.
        column.dataExpression = dataExpression
          ? dataExpression
          : column.dataExpression
        column.sources = sources ? sources : column.sources

        // update the updatedAt timestamp.
        column.updatedAt = updatedAt
        column.refreshedAt = new Date().toISOString()
        column.state = 'loaded'
      })
    case 'FETCH_COLUMN_DATA_FAILURE':
      return immer(state, (draft) => {
        const { columnId } = action.payload
        const column = draft.byId[columnId]
        if (!column) return

        column.refreshedAt = new Date().toISOString()
        column.state = 'not_loaded'
      })
    default:
      return state
  }
}
