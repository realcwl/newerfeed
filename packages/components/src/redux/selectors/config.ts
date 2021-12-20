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

export const availableCustomizedSubSourcesIdsSelector = (state: RootState) =>
  s(state).availableCustomizedSubSourcesIds

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

export const tryCustomizedCrawlerPostsSelector = (state: RootState) =>
  s(state).tryCustomizedCrawlerPosts

export const tryCustomizedCrawlerStatusSelector = (state: RootState) =>
  s(state).tryCustomizedCrawlerStatus

export const tryCustomizedCrawlerErrorMsgSelector = (state: RootState) =>
  s(state).tryCustomizedCrawlerErrorMsg

export const addSourceStatusSelector = (state: RootState) =>
  s(state).addCustomizedSourceStatus

export const addSourceErrorMsgSelector = (state: RootState) =>
  s(state).addCustomizedSourceErrorMsg

export const addedCustomizedSourceSelector = (state: RootState) =>
  s(state).addedCustomizedSource
