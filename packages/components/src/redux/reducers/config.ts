import immer from 'immer'

import {
  constants,
  NewsFeedColumnSource,
  NewsFeedData,
  SourceOrSubSource,
  ThemePair,
  TryCustomizedCrawlerPost,
} from '@devhub/core'
import { Reducer } from '../types'

// Config reducer stores global environment variables, such as the current
// theme, available sources, and more.
export interface State {
  theme?: ThemePair
  // all available sources, which will be fetched everytime we launch NewsFeed.
  availableNewsFeedSources: NewsFeedColumnSource[]

  // all available customized subsources "IDs", which will be fetched everytime we go to add-subsource page.
  // look up details for subsources in idToSourceOrSubSourceMap
  availableCustomizedSubSourcesIds: string[]

  // maps the source/subtype id to the actual attributes.
  idToSourceOrSubSourceMap: Record<string, SourceOrSubSource>

  addCustomizedSourceStatus: constants.AddSourceStatus

  addCustomizedSourceErrorMsg: string

  addedCustomizedSource: SourceOrSubSource

  tryCustomizedCrawlerStatus: constants.TryCustomizedCrawlerStatus

  tryCustomizedCrawlerErrorMsg: string

  tryCustomizedCrawlerPosts: TryCustomizedCrawlerPost[]
}

export const initialState: State = {
  theme: constants.DEFAULT_THEME_PAIR,

  availableNewsFeedSources: [],

  availableCustomizedSubSourcesIds: [],

  idToSourceOrSubSourceMap: {},

  addCustomizedSourceStatus: constants.AddSourceStatus.Loaded,

  addCustomizedSourceErrorMsg: '',

  addedCustomizedSource: { id: '', name: '' },

  tryCustomizedCrawlerStatus: constants.TryCustomizedCrawlerStatus.Loaded,

  tryCustomizedCrawlerErrorMsg: '',

  tryCustomizedCrawlerPosts: [],
}

// Recursively include all sources or subsources into the id map.
function addDataSourceToIdMap(
  data: NewsFeedData,
  idToSourceOrSubSourceMap: typeof initialState['idToSourceOrSubSourceMap'],
): void {
  // remove "&& !(data.subSource.id in idToSourceOrSubSourceMap)"
  // resisted subSource data prevents us updating new data into exising key
  if (data.subSource) {
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

        // We need to do a json merge here instead of using typescript syntax sugar:
        //
        // draft.idToSourceOrSubSourceMap = {
        //   ...draft.idToSourceOrSubSourceMap, // map size keeps increasing
        //   ...action.payload.idToSourceOrSubSourceMap,
        // }
        //
        // This is because the later will change the address of the subsource
        // object and triggers a massive reload for components that are hooked
        // on subsource value.
        for (const id in action.payload.idToSourceOrSubSourceMap) {
          if (id in draft.idToSourceOrSubSourceMap) {
            continue
          }
          draft.idToSourceOrSubSourceMap[id] =
            action.payload.idToSourceOrSubSourceMap[id]
        }
      })
    }
    case 'SET_CUSTOMIZED_SUBSOURCES': {
      return immer(state, (draft) => {
        draft.availableCustomizedSubSourcesIds = []
        for (let i = 0; i < action.payload.subSources.length; i++) {
          const subsourceId = action.payload.subSources[i].id.toString()

          // update customized subsources ids
          draft.availableCustomizedSubSourcesIds.push(subsourceId)

          // update id to subsource map
          draft.idToSourceOrSubSourceMap[subsourceId] =
            action.payload.subSources[i]

          // update sources children
          for (let j = 0; j < draft.availableNewsFeedSources.length; j++) {
            if (
              !(subsourceId in draft.availableNewsFeedSources[j].subSourceIds)
            ) {
              draft.availableNewsFeedSources[j].subSourceIds.push(subsourceId)
            }
          }
        }
      })
    }
    case 'DELETE_CUSTOMIZED_SUBSOURCE_SUCCESS': {
      return immer(state, (draft) => {
        draft.availableCustomizedSubSourcesIds =
          draft.availableCustomizedSubSourcesIds.filter(
            (subsourceId) => subsourceId !== action.payload.id,
          )
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

    case 'FETCH_POST_SUCCESS': {
      return immer(state, (draft) => {
        const { data } = action.payload
        addDataSourceToIdMap(data, draft.idToSourceOrSubSourceMap)
      })
    }

    case 'ADD_SUBSOURCE':
      return immer(state, (draft) => {
        draft.idToSourceOrSubSourceMap[action.payload.sourceId].state =
          'loading'
      })
    case 'ADD_SUBSOURCE_FAIL':
      return immer(state, (draft) => {
        // TODO: also pass through the error from backend and display in frontend
        draft.idToSourceOrSubSourceMap[action.payload.sourceId].state = 'error'
      })
    case 'ADD_SUBSOURCE_SUCCESS':
      return immer(state, (draft) => {
        // Add subsource to parent source
        for (let i = 0; i < draft.availableNewsFeedSources.length; i++) {
          if (
            draft.availableNewsFeedSources[i].sourceId ===
              action.payload.sourceId &&
            !draft.availableNewsFeedSources[i].subSourceIds.includes(
              action.payload.subsourceId,
            )
          ) {
            draft.availableNewsFeedSources[i].subSourceIds.push(
              action.payload.subsourceId,
            )
            break
          }
        }
        // Fill subsource information
        draft.idToSourceOrSubSourceMap[action.payload.subsourceId] = {
          name: action.payload.name,
          id: action.payload.subsourceId,
          externalId: action.payload.externalId,
        }
        draft.idToSourceOrSubSourceMap[action.payload.sourceId].state = 'loaded'
      })
    case 'ADD_SUBSOURCE_TERMINATE':
      return immer(state, (draft) => {
        draft.idToSourceOrSubSourceMap[action.payload.sourceId].state = 'loaded'
      })

    case 'ADD_SOURCE':
      return immer(state, (draft) => {
        draft.addCustomizedSourceStatus = constants.AddSourceStatus.Loading
      })
    case 'ADD_SOURCE_FAIL':
      return immer(state, (draft) => {
        draft.addCustomizedSourceErrorMsg = action.payload.errorMsg
        draft.addCustomizedSourceStatus = constants.AddSourceStatus.Failed
      })
    case 'ADD_SOURCE_SUCCESS':
      return immer(state, (draft) => {
        draft.addedCustomizedSource = action.payload
        draft.addCustomizedSourceStatus = constants.AddSourceStatus.Loaded
      })
    case 'ADD_SOURCE_TERMINATE':
      return immer(state, (draft) => {
        draft.addedCustomizedSource = { id: '', name: '' }
        draft.addCustomizedSourceStatus = constants.AddSourceStatus.Loaded
      })

    case 'TRY_CUSTOMIZED_CRAWLER':
      return immer(state, (draft) => {
        draft.tryCustomizedCrawlerStatus =
          constants.TryCustomizedCrawlerStatus.Loading
      })
    case 'TRY_CUSTOMIZED_CRAWLER_FAIL':
      return immer(state, (draft) => {
        draft.tryCustomizedCrawlerErrorMsg = action.payload.errorMsg
        draft.tryCustomizedCrawlerStatus =
          constants.TryCustomizedCrawlerStatus.Failed
      })
    case 'TRY_CUSTOMIZED_CRAWLER_SUCCESS':
      return immer(state, (draft) => {
        draft.tryCustomizedCrawlerPosts = action.payload.allPostsCrawled
        draft.tryCustomizedCrawlerStatus =
          constants.TryCustomizedCrawlerStatus.Loaded
      })
    case 'TRY_CUSTOMIZED_CRAWLER_TERMINATE':
      return immer(state, (draft) => {
        draft.tryCustomizedCrawlerPosts = []
        draft.tryCustomizedCrawlerStatus =
          constants.TryCustomizedCrawlerStatus.Loaded
      })

    case 'ADD_CUSTOMIZED_SUBSOURCE':
      return immer(state, (draft) => {
        draft.addCustomizedSourceStatus = constants.AddSourceStatus.Loading
      })
    default:
      return state
  }
}
