import {
  constants,
  NewsFeedColumnSource,
  SourceOrSubSource,
} from '@devhub/core'
import { all, select, takeLatest, delay, put } from 'typed-redux-saga'
import axios, { AxiosResponse } from 'axios'
import { analytics } from '../../libs/analytics'
import { WrapUrlWithToken } from '../../utils/api'
import { setSourcesAndIdMap } from '../actions'
import { jsonToGraphQLQuery } from 'json-to-graphql-query'
import * as selectors from '../selectors'

// Response returned from the backend for available sources.
interface SourcesResponse {
  data: {
    sources: {
      id: string
      name: string
      subsources: {
        id: string
        name: string
        iconUrl: string
        updatedAt: string
      }[]
    }[]
  }
}

function GetAvailableSourcesFromSourcesResponse(
  sourcesResponse: SourcesResponse,
): NewsFeedColumnSource[] {
  const res: NewsFeedColumnSource[] = []
  for (const source of sourcesResponse.data.sources) {
    const singleSource: NewsFeedColumnSource = {
      sourceId: source.id,
      subSourceIds: [],
    }
    for (const subSource of source.subsources) {
      singleSource.subSourceIds.push(subSource.id)
    }
    res.push(singleSource)
  }
  return res
}

function GetIdMapFromSourcesResponse(
  sourcesResponse: SourcesResponse,
): Record<string, SourceOrSubSource> {
  const res: Record<string, SourceOrSubSource> = {}
  for (const source of sourcesResponse.data.sources) {
    res[source.id] = {
      id: source.id,
      name: source.name,
    }
    for (const subSource of source.subsources) {
      res[subSource.id] = {
        id: subSource.id,
        name: subSource.name,
        avatarURL: subSource.iconUrl,
      }
    }
  }
  return res
}

function* onThemeChange() {
  const state = yield* select()

  const themePair = selectors.themePairSelector(state)

  analytics.setDimensions({
    theme_id: themePair.id,
  })
}

// On each login success we fetch all login sources available.
function* fetchAvailableSourcesAndIdMap() {
  const appToken = yield* select(selectors.appTokenSelector)
  const sourcesResponse: AxiosResponse<SourcesResponse> = yield axios.post(
    WrapUrlWithToken(constants.DEV_GRAPHQL_ENDPOINT, appToken),
    {
      query: jsonToGraphQLQuery({
        query: {
          sources: {
            id: true,
            name: true,
            subsources: {
              id: true,
              name: true,
              iconUrl: true,
            },
          },
        },
      }),
    },
  )

  yield put(
    setSourcesAndIdMap({
      sources: GetAvailableSourcesFromSourcesResponse(sourcesResponse.data),
      idToSourceOrSubSourceMap: GetIdMapFromSourcesResponse(
        sourcesResponse.data,
      ),
    }),
  )
}

export function* configSagas() {
  yield* all([
    yield* takeLatest(['SET_THEME'], onThemeChange),
    yield* takeLatest(['LOGIN_SUCCESS'], fetchAvailableSourcesAndIdMap),
  ])
}
