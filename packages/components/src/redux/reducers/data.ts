import _ from 'lodash'
import immer from 'immer'

import { NewsFeedData } from '@devhub/core'
import { Reducer } from '../types'

export interface State {
  // Contains all data IDs, that can be referenced by multiple columns.
  allIds: string[]
  // Contains data id to actual data mapping.
  byId: Record<string, NewsFeedData>
  // Saved ID list that can be rendered together in the Saved column.
  savedIds: string[]
  // Last time the data list is updated.
  updatedAt: string | undefined
  // loading data id
  loadingId: string
}

export const initialState: State = {
  allIds: [],
  byId: {},
  savedIds: [],
  updatedAt: undefined,
  loadingId: '',
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

        // update savedIds array
        if (save && !draft.savedIds.includes(itemNodeId)) {
          draft.savedIds.push(itemNodeId)
        } else if (!save && draft.savedIds.includes(itemNodeId)) {
          const index = draft.savedIds.findIndex((id) => id === itemNodeId)
          if (index > -1) {
            draft.savedIds.splice(index, 1)
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
          if (!(itemNodeId in draft.byId)) {
            // if the item isn't in the data list, it indicates that we might
            // encountered an error and should return directly.
            console.warn(
              "trying to read/unread an item that's not in the data list: ",
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
    case 'FETCH_POST':
      return immer(state, (draft) => {
        const { id } = action.payload
        draft.loadingId = id
      })
    case 'FETCH_POST_SUCCESS':
      return immer(state, (draft) => {
        const { data } = action.payload
        // replace it if it already exists
        draft.byId[data.id] = data
        if (!draft.allIds.includes(data.id)) {
          draft.allIds.push(data.id)
        }
        draft.loadingId = ''
      })
    case 'FETCH_POST_FAILURE':
      return immer(state, (draft) => {
        const { id } = action.payload
        draft.loadingId = ''
      })
    default:
      return state
  }
}
