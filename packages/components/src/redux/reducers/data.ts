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
      title: `I am dummyCard's dummy title with more than one line as well`,
      text: `first card with some real real real long descriptions and real long text and see if it works!
It is multi-line.
Has a lot of text.`,
      author: {
        avatar: {
          imageURL:
            'https://gravatar.com/avatar/09644abc0162e221e1c9ffb8a20c57ed?s=400&d=robohash&r=x',
        },
        name: 'John Doe',
        profileURL: '/',
      },
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
