import { ColorSchemeName } from 'react-native'

import {
  NewsFeedColumnSource,
  SourceOrSubSource,
  ThemePair,
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

export function setPreferrableTheme(payload: {
  id: ThemePair['id']
  color?: ThemePair['color']
}) {
  return createAction('SET_PREFERRABLE_THEME', payload)
}

export function dayNightSwitch() {
  return createAction('DAY_NIGHT_SWITCH')
}

export function appearenceColorSchemeChanged(colorScheme: ColorSchemeName) {
  return createAction('APPEARENCE_COLOR_SCHEME_CHANGED', colorScheme)
}

export function addSubsource(payload: { sourceId: string; name: string }) {
  return createAction('ADD_SUBSOURCE', payload)
}

export function addSubsourceSuccess(payload: {
  sourceId: string
  name: string
  subsourceId: string
}) {
  return createAction('ADD_SUBSOURCE_SUCCESS', payload)
}

export function addSubsourceFail(payload: { sourceId: string; name: string }) {
  return createAction('ADD_SUBSOURCE_FAIL', payload)
}

export function addSubsourceTerminate(payload: { sourceId: string }) {
  return createAction('ADD_SUBSOURCE_TERMINATE', payload)
}
