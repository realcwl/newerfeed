import { NewsFeedData } from '@devhub/core'
import _ from 'lodash'

import { Reducer } from '../types'
import immer from 'immer'

export interface State {
  // Contains all data IDs, that can be referenced by multiple columns.
  allIds: string[]
  // Contains data id to actual data mapping.
  byId: Record<string, NewsFeedData>
  // Saved ID list that can be rendered together in the Saved column.
  savedIds: string[]
  // Last time the data list is updated.
  updatedAt: string | undefined
}

const initialState: State = {
  allIds: [],
  byId: {},
  savedIds: [],
  updatedAt: undefined,
}

export const dataReducer: Reducer<State> = (state = initialState, action) => {
  switch (action.type) {
    case 'MARK_ITEM_AS_SAVED':
      return immer(state, (draft) => {
        const { itemNodeId, save } = action.payload
        const now = new Date().toISOString()
        if (!(itemNodeId in draft.byId)) {
          // if the item isn't in the data list, it indicates that we might
          // encountered an error and should return directly.
          console.warn(
            "trying to favorite/unfavorite an item that's not in the data list: ",
            itemNodeId,
          )
          return
        }
        const entry = draft.byId[itemNodeId]
        entry.isSaved = save
        draft.updatedAt = now
      })
    case 'MARK_ITEM_AS_READ':
      return immer(state, (draft) => {
        const { itemNodeIds, read } = action.payload
        const now = new Date().toISOString()
        for (const itemNodeId of itemNodeIds) {
          if (!(itemNodeId in draft.byId)) {
            // if the item isn't in the data list, it indicates that we might
            // encountered an error and should return directly.
            console.warn(
              "trying to favorite/unfavorite an item that's not in the data list: ",
              itemNodeId,
            )
            return
          }
          const entry = draft.byId[itemNodeId]
          entry.isRead = read
          draft.updatedAt = now
        }
      })
    case 'FETCH_COLUMN_DATA_SUCCESS':
      return immer(state, (draft) => {
        const { data } = action.payload
        for (const singleData of data) {
          // insert into data reducer if not already exist.
          if (singleData.id in draft.byId) continue
          draft.byId[singleData.id] = singleData
          draft.allIds.push(singleData.id)
        }
      })
    default:
      return state
  }
}
