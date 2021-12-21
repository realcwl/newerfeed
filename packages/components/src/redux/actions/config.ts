import {
  NewsFeedColumnSource,
  SourceOrSubSource,
  TryCustomizedCrawlerPost,
  ThemePair,
  CustomizedCrawlerSpec,
} from '@devhub/core'
import { createAction } from '../helpers'

export function setTheme(payload: {
  id: ThemePair['id']
  color?: ThemePair['color']
}) {
  return createAction('SET_THEME', payload)
}

export function setSourcesAndIdMap(payload: {
  sources: NewsFeedColumnSource[]
  idToSourceOrSubSourceMap: Record<string, SourceOrSubSource>
}) {
  return createAction('SET_SOURCES_AND_ID_MAP', payload)
}

export function setCustomizedSubSources(payload: {
  subSources: SourceOrSubSource[]
}) {
  return createAction('SET_CUSTOMIZED_SUBSOURCES', payload)
}

export function fetchCustomizedSubsources(payload: {}) {
  return createAction('FETCH_CUSTOMIZED_SUBSOURCES', payload)
}

export function deleteCustomizedSubSource(payload: { id: string }) {
  return createAction('DELETE_CUSTOMIZED_SUBSOURCE', payload)
}
export function deleteCustomizedSubsourceSuccess(payload: { id: string }) {
  return createAction('DELETE_CUSTOMIZED_SUBSOURCE_SUCCESS', payload)
}

export function tryCustomizedCrawler(payload: {
  customizedCrawlerSpec: CustomizedCrawlerSpec
}) {
  return createAction('TRY_CUSTOMIZED_CRAWLER', payload)
}

export function tryCustomizedCrawlerSuccess(payload: {
  allPostsCrawled: TryCustomizedCrawlerPost[]
}) {
  return createAction('TRY_CUSTOMIZED_CRAWLER_SUCCESS', payload)
}

export function tryCustomizedCrawlerFail(payload: { errorMsg: string }) {
  return createAction('TRY_CUSTOMIZED_CRAWLER_FAIL', payload)
}

export function tryCustomizedCrawlerTerminate(payload: {}) {
  return createAction('TRY_CUSTOMIZED_CRAWLER_TERMINATE', payload)
}

export function addCustomizedSource(payload: {
  sourceName: string
  customizedCrawlerSpec: CustomizedCrawlerSpec
}) {
  return createAction('ADD_SOURCE', payload)
}

export function addCustomizedSubSource(payload: {
  subSourceName: string
  subSourceParentSourceId: string
  customizedCrawlerSpec: CustomizedCrawlerSpec
}) {
  return createAction('ADD_CUSTOMIZED_SUBSOURCE', payload)
}

export function addCustomizedCralwerSuccess(payload: SourceOrSubSource) {
  return createAction('ADD_SOURCE_SUCCESS', payload)
}

export function addCustomizedCralwerFail(payload: { errorMsg: string }) {
  return createAction('ADD_SOURCE_FAIL', payload)
}

export function addCustomizedCrawlerTerminate(payload: {}) {
  return createAction('ADD_SOURCE_TERMINATE', payload)
}

export function addSubsource(payload: { sourceId: string; name: string }) {
  return createAction('ADD_SUBSOURCE', payload)
}

export function addSubsourceSuccess(payload: {
  sourceId: string
  name: string
  subsourceId: string
  externalId: string
}) {
  return createAction('ADD_SUBSOURCE_SUCCESS', payload)
}

export function addSubsourceFail(payload: { sourceId: string; name: string }) {
  return createAction('ADD_SUBSOURCE_FAIL', payload)
}

export function addSubsourceTerminate(payload: { sourceId: string }) {
  return createAction('ADD_SUBSOURCE_TERMINATE', payload)
}
