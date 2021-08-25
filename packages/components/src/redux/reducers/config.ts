import immer from 'immer'

import { constants, NewsFeedColumnSource, ThemePair } from '@devhub/core'
import { Reducer } from '../types'

// Config reducer stores global environment variables, such as the current
// theme, available sources, and more.
export interface State {
  theme?: ThemePair
  // all available sources, which will be fetched everytime we launch NewsFeed.
  availableNewsFeedSources: NewsFeedColumnSource[]

  // maps the source/subtype id to the actual naming. This is required in
  // config. The key is a compound id, which for source is source + subtype
  idToNameMap: Record<string, string>
}

const initialState: State = {
  theme: constants.DEFAULT_THEME_PAIR,

  availableNewsFeedSources: [],

  idToNameMap: {},
}

export const configReducer: Reducer<State> = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_THEME':
      return immer(state, (draft) => {
        draft.theme = action.payload
      })
    case 'SET_SOURCES_AND_ID_MAP': {
      return immer(state, (draft) => {
        draft.availableNewsFeedSources = action.payload.sources
        draft.idToNameMap = action.payload.idToNameMap
      })
    }
    default:
      return state
  }
}
