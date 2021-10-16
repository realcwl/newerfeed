import immer from 'immer'
import { closeBannerMessage, setBannerMessage } from '../../actions'
import { appReducer, State, initialState } from '../app'

describe('appReducer', () => {
  const invalidBannerId = 'invalidBannerId'
  const state: State = {
    banners: [
      {
        id: 'fail_initial_connection',
        type: 'BANNER_TYPE_MESSAGE',
        message: `message`,
        autoClose: true,
      },
    ],
    bannerSignatures: ['fail_initial_connection#BANNER_TYPE_MESSAGE'],
  }

  // CLOSE_BANNER_MESSAGE
  test('should close banner message', () => {
    const action = closeBannerMessage(state.banners[0].id)
    expect(appReducer(state, action)).toEqual(initialState)
  })

  test('should cloase banner message with signature provided', () => {
    const action = closeBannerMessage(state.banners[0].id)
    const signature = 'signature1'
    const stateWithSignature = immer(state, (draft) => {
      draft.banners[0].signature = signature
      draft.bannerSignatures[0] = signature
    })
    expect(appReducer(stateWithSignature, action)).toEqual(initialState)
  })

  test('should not close banner if id does not match any', () => {
    const action = closeBannerMessage(invalidBannerId)
    expect(appReducer(state, action)).toEqual(state)
    expect(appReducer(initialState, action)).toEqual(initialState)
  })

  // SET_BANNER_MESSAGE
  test('should set banner message', () => {
    const action = setBannerMessage(state.banners[0])
    expect(appReducer(undefined, action)).toEqual(state)
  })

  test('should not add banner message if it exists already', () => {
    const action = setBannerMessage(state.banners[0])
    expect(appReducer(state, action)).toEqual(state)
  })
})
