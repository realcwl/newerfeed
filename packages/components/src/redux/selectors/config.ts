import { createSelector } from 'reselect'

import { constants, isNight, ThemePair } from '@devhub/core'
import { Appearance } from '../../libs/appearence'
import { EMPTY_OBJ } from '../../utils/constants'
import { loadTheme } from '../../utils/helpers/theme'
import { RootState } from '../types'

const s = (state: RootState) => state.config || EMPTY_OBJ

export const themePairSelector = (state: RootState) =>
  s(state).theme || constants.DEFAULT_THEME_PAIR

export const availableNewsFeedSourcesSelector = (state: RootState) =>
  s(state).availableNewsFeedSources

export const availableNewsFeedSubsourcesCountSelecter = createSelector(
  availableNewsFeedSourcesSelector,
  (sources) => {
    return sources
      .map((source) => source.subSourceIds.length)
      .reduce((prev: number, current: number) => prev + current)
  },
)

export const idToSourceOrSubSourceMapSelector = (state: RootState) =>
  s(state).idToSourceOrSubSourceMap

export const themeSelector = createSelector(
  themePairSelector,
  () => Appearance.getColorScheme(),
  () => isNight(),
  (theme, _colorScheme, _isNight) => {
    return loadTheme(theme)
  },
)
