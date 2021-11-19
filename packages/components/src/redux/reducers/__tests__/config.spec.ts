import immer from 'immer'

import { NewsFeedColumnSource, NewsFeedData, ThemePair } from '@devhub/core'

import {
  fetchColumnDataSuccess,
  setSourcesAndIdMap,
  setTheme,
  fetchPostSuccess,
} from '../../actions'
import { initialState, configReducer } from '../config'

describe('configReducer', () => {
  const defaultTheme = {
    id: 'auto',
    color: '',
  } as ThemePair

  const sources: NewsFeedColumnSource[] = [0, 1].map((n) => ({
    sourceId: `sourceId_${n}`,
    subSourceIds: [0, 1].map((m) => `subsourceIds_${n}_${m}`),
  }))
  const idToSourceOrSubSourceMap = {
    [sources[0].sourceId]: {
      id: sources[0].sourceId,
      name: sources[0].sourceId,
    },
    [sources[1].sourceId]: {
      id: sources[1].sourceId,
      name: sources[1].sourceId,
    },
    [sources[0].subSourceIds[0]]: {
      id: sources[0].subSourceIds[0],
      name: sources[0].subSourceIds[0],
    },
    [sources[0].subSourceIds[1]]: {
      id: sources[0].subSourceIds[1],
      name: sources[0].subSourceIds[1],
    },
    [sources[1].subSourceIds[0]]: {
      id: sources[1].subSourceIds[0],
      name: sources[1].subSourceIds[0],
    },
    [sources[1].subSourceIds[1]]: {
      id: sources[1].subSourceIds[1],
      name: sources[1].subSourceIds[1],
    },
  }

  // SET_THEME
  test('should set default theme', () => {
    const action = setTheme(defaultTheme)
    expect(configReducer(initialState, action).theme).toEqual(defaultTheme)
  })

  test('should set light theme', () => {
    const defaulThemeState = immer(initialState, (draft) => {
      draft.theme = defaultTheme
    })
    const lightTheme = {
      id: 'light-blue',
      color: '#F8F9FA',
    } as ThemePair
    const action = setTheme(lightTheme)
    expect(configReducer(defaulThemeState, action).theme).toEqual(lightTheme)
  })

  // SET_SOURCES_AND_ID_MAP
  test('should set sources and id map with initial state', () => {
    const action = setSourcesAndIdMap({
      sources,
      idToSourceOrSubSourceMap,
    })
    const expectedState = {
      ...initialState,
      availableNewsFeedSources: sources,
      idToSourceOrSubSourceMap: idToSourceOrSubSourceMap,
    }
    expect(configReducer(initialState, action)).toEqual(expectedState)
  })

  test('should set sources and to id map with existing sources or subsources', () => {
    const existingSource = {
      id: 'existingSourceId',
      name: 'existingSourceId',
    }
    const initialStateWithSourceMap = immer(initialState, (draft) => {
      draft.idToSourceOrSubSourceMap[existingSource.id] = existingSource
    })
    const action = setSourcesAndIdMap({
      sources,
      idToSourceOrSubSourceMap,
    })
    const expectedState = {
      ...initialStateWithSourceMap,
      availableNewsFeedSources: sources,
      idToSourceOrSubSourceMap: {
        ...initialStateWithSourceMap.idToSourceOrSubSourceMap,
        ...idToSourceOrSubSourceMap,
      },
    }

    expect(configReducer(initialStateWithSourceMap, action)).toEqual(
      expectedState,
    )
  })

  // FETCH_COLUMN_DATA_SUCCESS
  test('should add column data subSources into map when fetching column data success', () => {
    const repostedNewsFeedData1 = {
      id: 'id11',
      cursor: 1011,
      subSource: {
        id: 'source_id11_subSource_id',
        name: 'source_id11_subSource_name',
      },
      // repostedFrom: // not testing deeper nested case
    }
    const repostedNewsFeedData2 = {
      id: 'id21',
      cursor: 1021,
      subSource: {
        id: 'source_id21_subSource_id',
        name: 'source_id21_subSource_name',
      },
      // repostedFrom: // not testing deeper nested case
    }
    const newsFeedData: NewsFeedData[] = [
      {
        id: 'id1',
        cursor: 1010,
        subSource: {
          id: 'source_id1_subSource_id',
          name: 'source_id1_subSource_name',
        },
        repostedFrom: repostedNewsFeedData1,
      },
      {
        id: 'id2',
        cursor: 1020,
        subSource: {
          id: 'source_id2_subSource_id',
          name: 'source_id2_subSource_name',
        },
        repostedFrom: repostedNewsFeedData2,
      },
    ]
    const action = fetchColumnDataSuccess({
      columnId: 'id',
      data: newsFeedData,

      // will not be used in this reducer
      direction: 'NEW',
      updatedAt: 'updatedAt',
      dropExistingData: true,
      dataByNodeId: {},
      sources: [],
    })

    const excpectedState = immer(initialState, (draft) => {
      draft.idToSourceOrSubSourceMap['source_id1_subSource_id'] = {
        id: 'source_id1_subSource_id',
        name: 'source_id1_subSource_name',
      }
      draft.idToSourceOrSubSourceMap['source_id2_subSource_id'] = {
        id: 'source_id2_subSource_id',
        name: 'source_id2_subSource_name',
      }
      draft.idToSourceOrSubSourceMap['source_id11_subSource_id'] = {
        id: 'source_id11_subSource_id',
        name: 'source_id11_subSource_name',
      }
      draft.idToSourceOrSubSourceMap['source_id21_subSource_id'] = {
        id: 'source_id21_subSource_id',
        name: 'source_id21_subSource_name',
      }
    })

    expect(configReducer(initialState, action)).toEqual(excpectedState)
  })

  test('should add post data into idToSourceOrSubSourceMap', () => {
    const newsFeedData = {
      id: 'id',
      subSource: {
        id: 'subSourceId',
        name: 'subSourceName',
        avatarURL: 'avatarURL',
      },
      cursor: 11,
    }
    const action = fetchPostSuccess({
      id: 'postId',
      data: newsFeedData,
    })
    expect(
      configReducer(initialState, action).idToSourceOrSubSourceMap[
        newsFeedData.subSource.id
      ],
    ).toEqual(newsFeedData.subSource)
  })
})
