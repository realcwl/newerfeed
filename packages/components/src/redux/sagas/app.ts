import { BANNER_AUTO_CLOSE_DURATION } from '@devhub/core/src/utils/constants'
import { all, delay, put, takeLatest } from 'typed-redux-saga'
import { closeBannerMessage, setBannerMessage } from '../actions'
import { ExtractActionFromActionCreator } from '../types/base'

function* onSetBannerMessage(
  action: ExtractActionFromActionCreator<typeof setBannerMessage>,
) {
  // If the banner is set as AutoClose, dispatch a CLOSE_BANNER_MESSAGE later.
  // Most of the error message should set auto close.
  if (action.payload.autoClose) {
    yield delay(BANNER_AUTO_CLOSE_DURATION)
    yield put(closeBannerMessage(action.payload.id))
  }
}

export function* appSagas() {
  yield* all([yield* takeLatest('SET_BANNER_MESSAGE', onSetBannerMessage)])
}
