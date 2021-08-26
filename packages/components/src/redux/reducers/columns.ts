import _ from 'lodash'

import { Column, ColumnCreation, normalizeColumns } from '@devhub/core'
import { Reducer } from '../types'
import immer from 'immer'

export interface State {
  // All column ids, each id is a hex string. The rendering order will be the
  // same as the list order.
  allIds: string[]

  // byId maps the hex string column id to the Column type, where details of the
  // Column such as column header, type, are defined. Note that this is only a
  // definition of the column, the mapping between column->data are defined in
  // each Column, and actual data is stored in data reducer.
  byId: Record<string, Column>
}

const initialState: State = {
  allIds: [],
  byId: {},
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

        if (draft.byId) delete draft.byId[action.payload.columnId]
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
        const delIds = draft.allIds.filter((v) => !newAllIds.includes(v))

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
            id: v.id,
            itemListIds: [],
            firstItemId: '',
            lastItemId: '',
            sources: [],
            state: 'not_loaded',
            dataExpression: undefined,
          }
          const normalized = normalizeColumns([{ ...columnCreation }])

          if (!(normalized.allIds.length === 1)) return

          draft.byId[normalized.allIds[0]] =
            normalized.byId[normalized.allIds[0]]
        })
      })
    case 'FETCH_COLUMN_DATA_REQUEST':
    case 'SET_COLUMN_LOADING':
      return immer(state, (draft) => {
        const { columnId } = action.payload
        draft.byId[columnId].state = 'loading'
      })
    case 'UPDATE_COLUMN_ID': {
      return immer(state, (draft) => {
        const { prevId, updatedId } = action.payload
        const idx = draft.allIds.indexOf(prevId)
        if (idx > -1) {
          draft.allIds[idx] = updatedId
        }
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
        } = action.payload

        const column = draft.byId[columnId]
        if (!column) return

        // if explicit drop is requested, we should clear all the data ids
        column.itemListIds = dropExistingData ? [] : column.itemListIds

        // append of insert front based on the direction.
        data.forEach((d) => {
          direction == 'NEW'
            ? column.itemListIds.unshift(d.id)
            : column.itemListIds.push(d.id)
        })

        // if data expression or filters is used, update them.
        column.dataExpression = dataExpression
          ? dataExpression
          : column.dataExpression

        // update the updatedAt timestamp.
        column.updatedAt = updatedAt
        column.refreshedAt = Date.now()
        column.state = 'loaded'
      })
    default:
      return state
  }
}
