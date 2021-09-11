import immer from 'immer'

import {
  constants,
  NewsFeedColumnSource,
  NewsFeedData,
  SourceOrSubSource,
  ThemePair,
} from '@devhub/core'
import { Reducer } from '../types'

// Config reducer stores global environment variables, such as the current
// theme, available sources, and more.
export interface State {
  theme?: ThemePair
  // all available sources, which will be fetched everytime we launch NewsFeed.
  availableNewsFeedSources: NewsFeedColumnSource[]

  // maps the source/subtype id to the actual attributes.
  idToSourceOrSubSourceMap: Record<string, SourceOrSubSource>
}

const initialState: State = {
  theme: constants.DEFAULT_THEME_PAIR,

  availableNewsFeedSources: [],

  idToSourceOrSubSourceMap: {},
}

// Recursively include all sources or subsources into the id map.
function addDataSourceToIdMap(
  data: NewsFeedData,
  idToSourceOrSubSourceMap: typeof initialState['idToSourceOrSubSourceMap'],
): void {
  if (data.subSource && !(data.subSource.id in idToSourceOrSubSourceMap)) {
    idToSourceOrSubSourceMap[data.subSource.id] = data.subSource
  }
  if (data.repostedFrom) {
    addDataSourceToIdMap(data.repostedFrom, idToSourceOrSubSourceMap)
  }
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
        draft.idToSourceOrSubSourceMap = action.payload.idToSourceOrSubSourceMap
      })
    }
    case 'FETCH_COLUMN_DATA_SUCCESS': {
      return immer(state, (draft) => {
        const { data } = action.payload
        for (const d of data) {
          addDataSourceToIdMap(d, draft.idToSourceOrSubSourceMap)
        }
      })
    }
    default:
      return state
  }
}
