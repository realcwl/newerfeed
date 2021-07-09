import { all, delay, fork, put, select, takeLatest } from 'typed-redux-saga'

import { analytics } from '../../libs/analytics'
import * as selectors from '../selectors'

function* onThemeChange() {
  const state = yield* select()

  const themePair = selectors.themePairSelector(state)

  analytics.setDimensions({
    theme_id: themePair.id,
  })
}

export function* configSagas() {
  yield* all([yield* takeLatest(['SET_THEME'], onThemeChange)])
}
