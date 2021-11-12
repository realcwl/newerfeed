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
  /////////////////////////////////////
  //          Column Related         //
  /////////////////////////////////////

  // All column ids, each id is a hex string. The rendering order will be the
  // same as the list order.
  allColumnIds: string[]

  // All shared column ids
  sharedColumnIds: string[]

  // byId maps the hex string column id to the Column type, where details of the
  // Column such as column header, type, are defined. Note that this is only a
  // definition of the column, the mapping between column->data are defined in
  // each Column, and actual data is stored in data reducer.
  columnById: Record<string, Column>

  /////////////////////////////////////
  //           Data Related          //
  /////////////////////////////////////

  // Contains all data IDs, that can be referenced by multiple columns.
  allDataIds: string[]
  // Contains data id to actual data mapping.
  dataById: Record<string, NewsFeedData>
  // Saved ID list that can be rendered together in the Saved column.
  savedDataIds: string[]
  // Last time the data list is updated.
  dataUpdatedAt: string | undefined
  // loading data id
  loadingDataId: string
}

const initialState: State = {
  /*===== Column Initial State =====*/
  allColumnIds: [],
  sharedColumnIds: [],
  columnById: {},
  /*===== Data Initial State =====*/
  allDataIds: [],
  dataById: {},
  savedDataIds: [],
  dataUpdatedAt: undefined,
  loadingDataId: '',
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
        draft.columnById = draft.columnById || {}

        // Get normalized state expression for the action payload, which
        // basically converts from the action payload to actual state.
        const normalized = normalizeColumns([{ ...action.payload }])

        // Must only contain a single column id.
        if (!(normalized.allIds.length === 1)) return

        // Is id exists, this is an attribute modification and we should replace
        // the value with new payload and return.
        if (draft.allColumnIds.includes(normalized.allIds[0])) {
          draft.columnById[normalized.allIds[0]] =
            normalized.byId[normalized.allIds[0]]
          return
        }
        draft.allColumnIds.push(normalized.allIds[0])
        _.merge(draft.columnById, normalized.byId)
      })
    case 'DELETE_COLUMN':
      return immer(state, (draft) => {
        if (draft.allColumnIds)
          draft.allColumnIds = draft.allColumnIds.filter(
            (id) => id !== action.payload.columnId,
          )
        if (
          draft.columnById &&
          draft.columnById[action.payload.columnId]?.visibility === 'PRIVATE'
        )
          delete draft.columnById[action.payload.columnId]
      })
    case 'MOVE_COLUMN':
      return immer(state, (draft) => {
        if (!draft.allColumnIds) return

        const currentIndex = draft.allColumnIds.findIndex(
          (id) => id === action.payload.columnId,
        )
        if (!(currentIndex >= 0 && currentIndex < draft.allColumnIds.length))
          return

        const newIndex = Math.max(
          0,
          Math.min(action.payload.columnIndex, draft.allColumnIds.length - 1),
        )
        if (Number.isNaN(newIndex)) return

        // move column inside array
        const columnId = draft.allColumnIds[currentIndex]
        draft.allColumnIds = draft.allColumnIds.filter((id) => id !== columnId)
        draft.allColumnIds.splice(newIndex, 0, columnId)
      })
    case 'UPDATE_SEED_STATE':
      return immer(state, (draft) => {
        const feedSeedStates = action.payload.feedSeedState
        const newAllIds = feedSeedStates.map((v) => v.id)

        // Get all added feeds as objects
        const addFeeds = feedSeedStates.filter(
          (v) => !draft.allColumnIds.includes(v.id),
        )

        // All existing feeds that might require update on feed seed state
        const updateFeeds = feedSeedStates.filter(
          (v) => draft.allColumnIds.includes(v.id) && newAllIds.includes(v.id),
        )

        // Get all deleted feeds as ids
        const delIds = draft.allColumnIds.filter(
          (v) => !newAllIds.includes(v) && !draft.sharedColumnIds.includes(v),
        )

        // Only update when the ids in feed change. It should:
        // 1. substitude the ids
        // 2. remove deleted ones
        // 3. update common feeds
        // 4. add new ids
        if (!_.isEqual(newAllIds, draft.allColumnIds)) {
          draft.allColumnIds = newAllIds
        }

        delIds.forEach((v) => {
          if (draft.columnById) delete draft.columnById[v]
        })

        updateFeeds.forEach((v) => {
          draft.columnById[v.id].title = v.name
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

          draft.columnById[normalized.allIds[0]] =
            normalized.byId[normalized.allIds[0]]
        })
      })
    case 'REPLACE_COLUMN_FILTER':
      return immer(state, (draft) => {
        const { columnId, filter } = action.payload
        if (draft.columnById[columnId]) {
          draft.columnById[columnId].filters = filter
        }
      })
    case 'SET_COLUMN_SAVED_FILTER':
      return immer(state, (draft) => {
        const { columnId, saved } = action.payload
        if (draft.columnById[columnId]) {
          draft.columnById[columnId].filters = {
            ...draft.columnById[columnId].filters,
            saved: saved,
          }
        }
      })
    case 'SET_COLUMN_OPTION': {
      return immer(state, (draft) => {
        const { columnId, option, value } = action.payload
        if (!draft.columnById) return

        const column = draft.columnById[columnId]
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
        if (draft.columnById[columnId]) {
          draft.columnById[columnId].state = 'loading'
        }
      })
    case 'SET_SHARED_COLUMNS':
      return immer(state, (draft) => {
        if (!action.payload.feeds || action.payload.feeds.length === 0) return
        draft.sharedColumnIds = action.payload.feeds.map((f) => f.id)
        action.payload.feeds.forEach((v) => {
          draft.columnById[v.id] = {
            ...draft.columnById[v.id],
            id: v.id,
            icon: draft.columnById[v.id]?.icon ?? v.icon,
            creator: v.creator,
            sources: v.sources ?? [],
            dataExpression: v.dataExpression,
            title: v.title,
            visibility: v.visibility,
            updatedAt: v.updatedAt,
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
        const idx = draft.allColumnIds.indexOf(prevId)
        if (idx === -1) {
          console.error('cannot find the original id: ' + prevId)
          return
        }
        draft.allColumnIds[idx] = updatedId
        draft.columnById[updatedId] = draft.columnById[prevId]
        draft.columnById[updatedId].id = updatedId
        delete draft.columnById[prevId]
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

        // insert into data reducer if not already exist.
        for (const singleData of data) {
          if (singleData.id in draft.dataById) continue
          draft.dataById[singleData.id] = singleData
          draft.allDataIds.push(singleData.id)
        }

        const column = draft.columnById[columnId]
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
        // Append only if un duplicated

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
        const column = draft.columnById[columnId]
        if (!column) return

        column.refreshedAt = new Date().toISOString()
        column.state = 'not_loaded'
      })

    case 'MARK_ITEM_AS_SAVED':
      return immer(state, (draft) => {
        const { itemNodeId, save } = action.payload
        const now = new Date().toISOString()
        if (!(itemNodeId in draft.dataById)) {
          // if the item isn't in the data list, it indicates that we might
          // encountered an error and should return directly.
          console.warn(
            "trying to favorite/unfavorite an item that's not in the data list: ",
            itemNodeId,
          )
          return
        }
        const entry = draft.dataById[itemNodeId]
        entry.isSaved = save
        draft.dataUpdatedAt = now

        // update savedIds array
        if (save && !draft.savedDataIds.includes(itemNodeId)) {
          draft.savedDataIds.push(itemNodeId)
        } else if (!save && draft.savedDataIds.includes(itemNodeId)) {
          const index = draft.savedDataIds.findIndex((id) => id === itemNodeId)
          if (index > -1) {
            draft.savedDataIds.splice(index, 1)
          }
        } else {
          console.warn(`
              item ${itemNodeId} was already ${save ? 'saved' : 'unsaved'}`)
        }
      })
    case 'MARK_ITEM_AS_READ':
      return immer(state, (draft) => {
        const { itemNodeIds, read } = action.payload
        const now = new Date().toISOString()
        for (const itemNodeId of itemNodeIds) {
          if (!(itemNodeId in draft.dataById)) {
            // if the item isn't in the data list, it indicates that we might
            // encountered an error and should return directly.
            console.warn(
              "trying to read/unread an item that's not in the data list: ",
              itemNodeId,
            )
            return
          }
          const entry = draft.dataById[itemNodeId]
          entry.isRead = read
          draft.dataUpdatedAt = now
        }
      })
    case 'FETCH_POST':
      return immer(state, (draft) => {
        const { id } = action.payload
        draft.loadingDataId = id
      })
    case 'FETCH_POST_SUCCESS':
      return immer(state, (draft) => {
        const { data } = action.payload
        // replace it if it already exists
        draft.dataById[data.id] = data
        if (!draft.allDataIds.includes(data.id)) {
          draft.allDataIds.push(data.id)
        }
        draft.loadingDataId = ''
      })
    case 'FETCH_POST_FAILURE':
      return immer(state, (draft) => {
        const { id } = action.payload
        draft.loadingDataId = ''
      })
    default:
      return state
  }
}
