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

  // TODO(chenweilunster): This should be a App startup fetch instead of static
  // initialization.
  availableNewsFeedSources: [
    {
      source: 'WEIBO',
      subtypes: [
        'WEIBO_1',
        'WEIBO_2',
        'WEIBO_3',
        'WEIBO_4',
        'WEIBO_5',
        'WEIBO_6',
        'WEIBO_7',
        'WEIBO_8',
        'WEIBO_9',
        'WEIBO_10',
      ],
    },
    {
      source: 'CAIXIN',
      subtypes: ['CAIXIN_ABC', 'CAIXIN_BCD', 'CAIXIN_CDE'],
    },
  ],

  idToNameMap: {
    WEIBO: '微博',
    WEIBO_1: '瑞尼尔雪山',
    WEIBO_2: 'fake user 2',
    WEIBO_3: 'fake user 3',
    WEIBO_4: 'fake user 4',
    WEIBO_5: 'fake user 5',
    WEIBO_6: 'fake user 6',
    WEIBO_7: 'fake user 7',
    WEIBO_8: 'fake user 8',
    WEIBO_9: 'fake user 9',
    WEIBO_10: '贾跃亭',
    CAIXIN: '财新',
    CAIXIN_ABC: '用户ABC',
    CAIXIN_BCD: '用户BCD',
    CAIXIN_CDE: '用户CDE',
  },
}

export const configReducer: Reducer<State> = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_THEME':
      return immer(state, (draft) => {
        draft.theme = action.payload
      })
    case 'SET_AVAILABLE_NEWS_FEED_SOURCES': {
      return immer(state, (draft) => {
        draft.availableNewsFeedSources = action.payload
      })
    }
    default:
      return state
  }
}
