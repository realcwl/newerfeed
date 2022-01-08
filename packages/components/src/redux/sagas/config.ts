import {
  constants,
  NewsFeedColumnSource,
  SourceOrSubSource,
  TryCustomizedCrawlerPost,
  CustomizedCrawlerSpec,
} from '@devhub/core'
import { all, select, takeLatest, delay, put } from 'typed-redux-saga'
import axios, { AxiosResponse } from 'axios'
import { analytics } from '../../libs/analytics'
import { WrapUrlWithToken } from '../../utils/api'
import { setSourcesAndIdMap, setCustomizedSubSources } from '../actions'
import { jsonToGraphQLQuery } from 'json-to-graphql-query'
import * as actions from '../actions'
import * as selectors from '../selectors'
import { ExtractActionFromActionCreator } from '../types/base'
import { parse } from '../../libs/pb-text-format-to-json'

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
        externalIdentifier: string
      }[]
    }[]
  }
}
// Response returned from the backend for available subsources.
interface CustomizedSubSourcesResponse {
  data: {
    subSources: {
      id: string
      name: string
      source: {
        id: string
        name: string
      }
      isFromSharedPost: boolean
      customizedCrawlerParams: string
    }[]
  }
}
interface DeleteSubsourceResponse {
  data: {
    deleteSubSource: {
      id: string
    }
  }
}
interface AddSubsourceResponse {
  data: {
    addSubSource: {
      id: string
      name: string
      externalIdentifier: string
    }
  }
}
interface AddSourceResponse {
  data: {
    createSource: {
      id: string
      name: string
      panopticConfig: string
    }
  }
}
interface TryCustomizedCrawlerResponse {
  data: {
    tryCustomizedCrawler: {
      title: string
      content: string
      images: string[]
      originUrl: string
      baseHtml: string
    }[]
  }
}
interface UpsertSubSourceResponse {
  data: {
    upsertSubSource: {
      id: string
      name: string
      customizedCrawlerParams: string
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
        externalId: subSource.externalIdentifier,
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
                externalIdentifier: true,
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

function* deleteCustomizedSubSource(
  action: ExtractActionFromActionCreator<
    typeof actions.deleteCustomizedSubSource
  >,
) {
  const id = action.payload.id

  try {
    const appToken = yield* select(selectors.appTokenSelector)
    const userId = yield* select(selectors.currentUserIdSelector)
    if (!userId) {
      yield put(actions.authFailure(Error('no user id found')))
      return
    }
    const deleteSubsourceResponse: AxiosResponse<DeleteSubsourceResponse> =
      yield axios.post(WrapUrlWithToken(constants.GRAPHQL_ENDPOINT, appToken), {
        query: jsonToGraphQLQuery({
          mutation: {
            deleteSubSource: {
              __args: {
                input: {
                  subsourceId: id,
                },
              },
              id: true,
            },
          },
        }),
      })
    yield put(
      actions.deleteCustomizedSubsourceSuccess({
        id: deleteSubsourceResponse.data.data.deleteSubSource.id,
      }),
    )
  } catch (e) {
    alert(`can't remove subsource: ${e}`)
    return
  }
}
// On each login success we fetch all customized subsources available.
function* fetchCustomizedSubSources() {
  const appToken = yield* select(selectors.appTokenSelector)

  try {
    const subSourcesResponse: AxiosResponse<CustomizedSubSourcesResponse> =
      yield axios.post(WrapUrlWithToken(constants.GRAPHQL_ENDPOINT, appToken), {
        query: jsonToGraphQLQuery({
          query: {
            subSources: {
              __args: {
                input: {
                  isFromSharedPost: false,
                  isCustomized: true,
                },
              },
              id: true,
              name: true,
              source: {
                id: true,
                name: true,
              },
              isFromSharedPost: true,
              customizedCrawlerParams: true,
            },
          },
        }),
      })
    yield put(
      setCustomizedSubSources({
        subSources: subSourcesResponse.data.data.subSources.map((subSource) => {
          const input = subSource.customizedCrawlerParams
          const output = parse(input.replaceAll('" ', '"\n')) // newline is required to saparate fields in the textproto lib for js
          return {
            id: subSource.id,
            name: subSource.name,
            parentSourceId: subSource.source.id,
            customizedCrawlConfig: {
              base: output['base_selector'],
              content: output['content_relative_selector'],
              title: output['title_relative_selector'],
              startUrl: output['crawl_url'],
              externalId: output['external_id_relative_selector'],
              image: output['image_relative_selector'],
              postUrl: output['origin_url_relative_selector'],
              postUrlIsRelativePath: output['origin_url_is_relative_path'],
              time: output['time_relative_selector'],
            },
          }
        }),
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
        name: addSubsourceResponse.data.data.addSubSource.name,
        subsourceId: addSubsourceResponse.data.data.addSubSource.id,
        externalId:
          addSubsourceResponse.data.data.addSubSource.externalIdentifier,
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
      addSubSource: {
        __args: {
          input: {
            sourceId: sourceId,
            subSourceUserName: name,
          },
        },
        id: true,
        name: true,
        externalIdentifier: true,
      },
    },
  })
}

function* onTryCustomizedCawler(
  action: ExtractActionFromActionCreator<typeof actions.tryCustomizedCrawler>,
) {
  try {
    const appToken = yield* select(selectors.appTokenSelector)
    const userId = yield* select(selectors.currentUserIdSelector)
    if (!userId) {
      yield put(actions.authFailure(Error('no user id found')))
      return
    }

    const tryCustomizedCrawlerResponse: AxiosResponse<TryCustomizedCrawlerResponse> =
      yield axios.post(WrapUrlWithToken(constants.GRAPHQL_ENDPOINT, appToken), {
        query: tryCustomizedCrawlerRequest(
          action.payload.customizedCrawlerSpec,
        ),
      })
    yield put(
      actions.tryCustomizedCrawlerSuccess({
        allPostsCrawled: GetPostsFromTryCustomizedCrawlerResponse(
          tryCustomizedCrawlerResponse.data,
        ),
      }),
    )
  } catch (e) {
    yield put(
      actions.tryCustomizedCrawlerFail({ errorMsg: (<Error>e).message }),
    )
    return
  }
}

function GetPostsFromTryCustomizedCrawlerResponse(
  response: TryCustomizedCrawlerResponse,
): TryCustomizedCrawlerPost[] {
  const res = []
  for (const post of response.data.tryCustomizedCrawler) {
    const singlePost: TryCustomizedCrawlerPost = {
      title: post.title,
      content: post.content,
      baseHtml: post.baseHtml,
      images: post.images,
      originUrl: post.originUrl,
    }
    res.push(singlePost)
  }
  return res
}

function tryCustomizedCrawlerRequest(spec: CustomizedCrawlerSpec): string {
  return jsonToGraphQLQuery({
    query: {
      tryCustomizedCrawler: {
        __args: {
          input: {
            crawlUrl: spec.startUrl,
            baseSelector: spec.base,
            titleRelativeSelector: spec.title,
            contentRelativeSelector: spec.content,
            externalIdRelativeSelector: spec.externalId,
            timeRelativeSelector: spec.time,
            imageRelativeSelector: spec.image,
            originUrlRelativeSelector: spec.postUrl,
            originUrlIsRelativePath: spec.postUrlIsRelativePath,
          },
        },
        title: true,
        content: true,
        images: true,
        baseHtml: true,
        originUrl: true,
      },
    },
  })
}

function* onAddCustomizedSubSource(
  action: ExtractActionFromActionCreator<typeof actions.addCustomizedSubSource>,
) {
  try {
    const appToken = yield* select(selectors.appTokenSelector)
    const userId = yield* select(selectors.currentUserIdSelector)
    if (!userId) {
      yield put(actions.authFailure(Error('no user id found')))
      return
    }
    const domain = new URL(action.payload.customizedCrawlerSpec.startUrl)
    const addSubSourceResponse: AxiosResponse<UpsertSubSourceResponse> =
      yield axios.post(WrapUrlWithToken(constants.GRAPHQL_ENDPOINT, appToken), {
        query: getAddCustomizedSubSourceRequest(
          action.payload.subSourceName,
          action.payload.subSourceParentSourceId,
          domain.hostname,
          action.payload.customizedCrawlerSpec,
        ),
      })
    yield all([
      put(
        actions.addCustomizedCralwerSuccess(
          GetAddCustomizedSubSourceResponse(addSubSourceResponse.data),
        ),
      ),
      put(actions.fetchCustomizedSubsources({})),
    ])
  } catch (e) {
    yield put(
      actions.addCustomizedCralwerFail({ errorMsg: (<Error>e).message }),
    )
    return
  }
}

function GetAddCustomizedSubSourceResponse(
  response: UpsertSubSourceResponse,
): SourceOrSubSource {
  return {
    id: response.data.upsertSubSource.id,
    name: response.data.upsertSubSource.name,
  }
}

function getAddCustomizedSubSourceRequest(
  name: string,
  sourceId: string,
  originUrl: string,
  spec: CustomizedCrawlerSpec,
): string {
  return jsonToGraphQLQuery({
    mutation: {
      upsertSubSource: {
        __args: {
          input: {
            name: name,
            // Don't set different external id to avoid confusion
            externalIdentifier: name,
            sourceId: sourceId,
            // TODO: let user to select a avatar
            avatarUrl:
              'https://newsfeed-logo.s3.us-west-1.amazonaws.com/test.png',
            isFromSharedPost: false,
            originUrl: originUrl,
            customizedCrawlerParams: {
              crawlUrl: spec.startUrl,
              baseSelector: spec.base,
              titleRelativeSelector: spec.title,
              contentRelativeSelector: spec.content,
              externalIdRelativeSelector: spec.externalId,
              timeRelativeSelector: spec.time,
              imageRelativeSelector: spec.image,
              originUrlRelativeSelector: spec.postUrl,
              originUrlIsRelativePath: spec.postUrlIsRelativePath,
            },
          },
        },
        id: true,
        name: true,
      },
    },
  })
}
function* onAddSource(
  action: ExtractActionFromActionCreator<typeof actions.addCustomizedSource>,
) {
  try {
    const appToken = yield* select(selectors.appTokenSelector)
    const userId = yield* select(selectors.currentUserIdSelector)
    if (!userId) {
      yield put(actions.authFailure(Error('no user id found')))
      return
    }
    const domain = new URL(action.payload.customizedCrawlerSpec.startUrl)
    const addSourceResponse: AxiosResponse<AddSourceResponse> =
      yield axios.post(WrapUrlWithToken(constants.GRAPHQL_ENDPOINT, appToken), {
        query: getAddSourceRequest(
          userId,
          action.payload.sourceName,
          domain.hostname,
          action.payload.customizedCrawlerSpec,
        ),
      })
    yield put(
      actions.addCustomizedCralwerSuccess(
        GetAddSourceResponse(addSourceResponse.data),
      ),
    )
  } catch (e) {
    yield put(
      actions.addCustomizedCralwerFail({ errorMsg: (<Error>e).message }),
    )
    return
  }
}

function GetAddSourceResponse(response: AddSourceResponse): SourceOrSubSource {
  return {
    id: response.data.createSource.id,
    name: response.data.createSource.name,
  }
}

function getAddSourceRequest(
  userId: string,
  sourceName: string,
  domain: string,
  spec: CustomizedCrawlerSpec,
): string {
  return jsonToGraphQLQuery({
    mutation: {
      createSource: {
        __args: {
          input: {
            userId: userId,
            name: sourceName,
            domain: domain,
            customizedCrawlerPanopticConfigForm: {
              customizedCrawlerParams: {
                crawlUrl: spec.startUrl,
                baseSelector: spec.base,
                titleRelativeSelector: spec.title,
                contentRelativeSelector: spec.content,
                externalIdRelativeSelector: spec.externalId,
                timeRelativeSelector: spec.time,
                imageRelativeSelector: spec.image,
                originUrlRelativeSelector: spec.postUrl,
                riginUrlIsRelativePath: spec.postUrlIsRelativePath,
              },
            },
          },
        },
        id: true,
        name: true,
        panopticConfig: true,
      },
    },
  })
}

export function* configSagas() {
  yield* all([
    yield* takeLatest(['SET_THEME'], onThemeChange),
    yield* takeLatest(['LOGIN_SUCCESS'], fetchAvailableSourcesAndIdMap),
    yield* takeLatest(['ADD_SUBSOURCE'], onAddSubsource),
    yield* takeLatest(['ADD_SOURCE'], onAddSource),
    yield* takeLatest(['ADD_CUSTOMIZED_SUBSOURCE'], onAddCustomizedSubSource),
    yield* takeLatest(['TRY_CUSTOMIZED_CRAWLER'], onTryCustomizedCawler),
    yield* takeLatest(
      ['FETCH_CUSTOMIZED_SUBSOURCES'],
      fetchCustomizedSubSources,
    ),
    yield* takeLatest(
      ['DELETE_CUSTOMIZED_SUBSOURCE'],
      deleteCustomizedSubSource,
    ),
  ])
}
