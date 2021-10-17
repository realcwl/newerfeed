import { all, delay, put, takeLatest } from 'typed-redux-saga'
import { saveViewToClipboard } from '../../libs/html-to-image'
import { capatureView, setBannerMessage } from '../actions'
import { ExtractActionFromActionCreator } from '../types/base'

const DEFAULT_ERROR_MESSAGE = 'Failed to save to clipboard'
const DEFAULT_SUCCESS_MESSAGE = 'Copied to clipboard'

function* onCaptureItemView(
  action: ExtractActionFromActionCreator<typeof capatureView>,
) {
  try {
    yield delay(50) // wait for potential show more rerender
    yield saveViewToClipboard(
      action.payload.viewRef,
      action.payload.backgroundColor,
    )
    yield put(
      setBannerMessage({
        id: 'clipboard',
        type: 'BANNER_TYPE_SUCCESS',
        message: DEFAULT_SUCCESS_MESSAGE,
        autoClose: true,
      }),
    )
  } catch (e) {
    let message = DEFAULT_ERROR_MESSAGE
    if (e instanceof Error) {
      message = e.message
    }
    yield put(
      setBannerMessage({
        id: 'clipboard',
        type: 'BANNER_TYPE_ERROR',
        message: message,
        autoClose: true,
      }),
    )
  }
}

export function* dataSagas() {
  yield* all([yield* takeLatest('CAPTURE_VIEW', onCaptureItemView)])
}
