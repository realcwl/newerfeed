import { all, delay, put, takeLatest } from 'typed-redux-saga'
import { saveViewToClipboard } from '../../libs/html-to-image'
import { capatureView, setBannerMessage } from '../actions'
import { ExtractActionFromActionCreator } from '../types/base'

function* onCaptureItemView(
  action: ExtractActionFromActionCreator<typeof capatureView>,
) {
  try {
    yield delay(50) // wait for potential show more rerender
    yield saveViewToClipboard(
      action.payload.viewRef,
      action.payload.backgroundColor,
    )
  } catch (e) {
    yield put(
      setBannerMessage({
        id: 'fail_initial_connection',
        type: 'BANNER_TYPE_PROMO',
        message: '无法加入剪切板',
        autoClose: true,
      }),
    )
  }
}

export function* dataSagas() {
  yield* all([yield* takeLatest('CAPTURE_VIEW', onCaptureItemView)])
}
