import _ from 'lodash'

import { Column, normalizeColumns } from '@devhub/core'
import { Reducer } from '../types'
import immer from 'immer'

export interface State {
  // All column ids, each id is a hex string. The rendering order will be the
  // same as the list order.
  allIds: string[]

  // byId maps the hex string column id to the Column type, where details of the
  // Column such as column header, type, are defined. Note that this is onlt a
  // definition of the column, the actual mapping between column->data are
  // defined in Subscription reducer.
  byId: Record<string, Column | undefined> | null

  // The last time this column is updated.
  updatedAt: string | null
}

const initialState: State = {
  allIds: [],
  byId: null,
  updatedAt: null,
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
          draft.updatedAt = normalized.updatedAt
          return
        }
        draft.allIds.push(normalized.allIds[0])
        _.merge(draft.byId, normalized.byId)
        draft.updatedAt = normalized.updatedAt
      })
    case 'DELETE_COLUMN':
      return immer(state, (draft) => {
        if (draft.allIds)
          draft.allIds = draft.allIds.filter(
            (id) => id !== action.payload.columnId,
          )

        if (draft.byId) delete draft.byId[action.payload.columnId]

        draft.updatedAt = new Date().toISOString()
      })
    default:
      return state
  }
}
