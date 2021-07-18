import { NewsFeedData } from '@devhub/core'
import _ from 'lodash'

import { Reducer } from '../types'

export interface State {
  // Contains all data IDs, that can be referenced by multiple columns.
  allIds: string[]
  // Contains data id to actual data mapping.
  byId: Record<string, NewsFeedData>
  // All IDs that are already read.
  readIds: string[]
  // Saved ID list that can be rendered together in the Saved column.
  savedIds: string[]
  // Last time the data list is updated.
  updatedAt: string | undefined
}

const initialState: State = {
  allIds: ['dummyCard'],
  byId: {
    dummyCard: {
      id: 'dummyCard',
      text: 'first card!',
      avatar: { imageURL: '/static/media/logo.png', linkURL: '/' },
      crawledTimestamp: new Date(),
    },
  },
  readIds: [],
  savedIds: [],
  updatedAt: undefined,
}

export const dataReducer: Reducer<State> = (state = initialState, action) => {
  switch (action.type) {
    // TODO(boninggao): Define and implement data reducer.
    default:
      return state
  }
}
