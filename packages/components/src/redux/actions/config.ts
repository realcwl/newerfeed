import { ColorSchemeName } from 'react-native'

import { NewsFeedColumnSource, ThemePair } from '@devhub/core'
import { createAction } from '../helpers'

export function setTheme(payload: {
  id: ThemePair['id']
  color?: ThemePair['color']
}) {
  return createAction('SET_THEME', payload)
}

export function setAvailableNewsFeedSources(payload: NewsFeedColumnSource[]) {
  return createAction('SET_AVAILABLE_NEWS_FEED_SOURCES', payload)
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
