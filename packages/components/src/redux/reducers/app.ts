import { BannerMessage } from '@devhub/core'
import immer from 'immer'
import _ from 'lodash'
import { bannerMessageSelector } from '../selectors'

import { Reducer } from '../types'

export interface State {
  // All banners to be rendered with top -> down order
  banners: BannerMessage[]

  // all banner signatures in App
  bannerSignatures: string[]
}

export const initialState: State = {
  banners: [],
  bannerSignatures: [],
}

// Use banner signature if provided, otherwise construct the default signature.
// A default banner signature is of format:
// "${id}#${type}"
// Note that, if your banner message is dynamically constructed, or you just
// don't know what the banner message will be (e.g. err from http response), you
// should always provide the signature to avoid huge bump in error banners.
function getBannerSignature(banner: BannerMessage) {
  if (banner.signature) return banner.signature

  const defaultSignature = `${banner.id}#${banner.type}`
  return defaultSignature
}

export const appReducer: Reducer<State> = (state = initialState, action) => {
  switch (action.type) {
    case 'CLOSE_BANNER_MESSAGE':
      return immer(state, (draft) => {
        draft.banners = draft.banners || []

        // Remove the banner from the banner array and remove signature
        const bannerToDrop = draft.banners.find(
          (banner) => banner.id == action.payload,
        )

        if (bannerToDrop) {
          draft.banners = draft.banners.filter(
            (banner) => banner.id != action.payload,
          )
          draft.bannerSignatures = draft.bannerSignatures.filter(
            (sig) => sig != getBannerSignature(bannerToDrop),
          )
        }
      })

    case 'SET_BANNER_MESSAGE': {
      return immer(state, (draft) => {
        const newBanner = action.payload
        const signature = getBannerSignature(newBanner)
        if (draft.bannerSignatures.includes(signature)) return

        // Push to the end of banner array and set signature
        draft.banners.push(newBanner)
        draft.bannerSignatures.push(signature)
      })
    }

    case 'RESET_BANNER_MESSAGE': {
      return immer(state, (draft) => {
        // Push to the end of banner array and set signature
        draft.banners = []
        draft.bannerSignatures = []
      })
    }

    default:
      return state
  }
}
