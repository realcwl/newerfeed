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
import * as actions from '../actions'
import * as selectors from '../selectors'
import { ExtractActionFromActionCreator } from '../types/base'

// Response returned from the backend for available sources.
interface SourcesResponse {
  data: {
    sources: {
      id: string
      name: string
      subsources: {
        id: string
        name: string
        avatarUrl: string
        updatedAt: string
      }[]
    }[]
  }
}
interface AddSubsourceResponse {
  data: {
    addWeiboSubSource: {
      id: string
      name: string
    }
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
        avatarURL: subSource.avatarUrl,
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

  try {
    const sourcesResponse: AxiosResponse<SourcesResponse> = yield axios.post(
      WrapUrlWithToken(constants.GRAPHQL_ENDPOINT, appToken),
      {
        query: jsonToGraphQLQuery({
          query: {
            sources: {
              __args: {
                input: {
                  subSourceFromSharedPost: false,
                },
              },
              id: true,
              name: true,
              subsources: {
                id: true,
                name: true,
                avatarUrl: true,
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
  } catch (err) {
    console.error(err)
  }
}

function* onAddSubsource(
  action: ExtractActionFromActionCreator<typeof actions.addSubsource>,
) {
  const sourceId = action.payload.sourceId
  const name = action.payload.name

  try {
    const appToken = yield* select(selectors.appTokenSelector)
    const userId = yield* select(selectors.currentUserIdSelector)
    if (!userId) {
      yield put(actions.authFailure(Error('no user id found')))
      return
    }

    const addSubsourceResponse: AxiosResponse<AddSubsourceResponse> =
      yield axios.post(WrapUrlWithToken(constants.GRAPHQL_ENDPOINT, appToken), {
        query: getAddSubsourceRequest(sourceId, name),
      })

    yield put(
      actions.addSubsourceSuccess({
        sourceId: sourceId,
        name: name,
        subsourceId: addSubsourceResponse.data.data.addWeiboSubSource.id,
      }),
    )
  } catch (e) {
    yield put(
      actions.addSubsourceFail({
        sourceId: sourceId,
        name: name,
      }),
    )
    return
  }
}

function getAddSubsourceRequest(sourceId: string, name: string): string {
  return jsonToGraphQLQuery({
    mutation: {
      addWeiboSubSource: {
        __args: {
          input: {
            name: name,
          },
        },
        id: true,
        name: true,
      },
    },
  })
}
export function* configSagas() {
  yield* all([
    yield* takeLatest(['SET_THEME'], onThemeChange),
    yield* takeLatest(['LOGIN_SUCCESS'], fetchAvailableSourcesAndIdMap),
    yield* takeLatest(['ADD_SUBSOURCE'], onAddSubsource),
  ])
}
