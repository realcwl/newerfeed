import { BannerMessage, SeedState, Signal } from '@devhub/core'
import { createAction } from '../helpers'

export function closeBannerMessage(id: string) {
  return createAction('CLOSE_BANNER_MESSAGE', id)
}

export function updateSeedState(seedState: SeedState) {
  return createAction('UPDATE_SEED_STATE', seedState)
}

export function setBannerMessage(banner: BannerMessage) {
  return createAction('SET_BANNER_MESSAGE', banner)
}

export function resetBannerMessage() {
  return createAction('RESET_BANNER_MESSAGE')
}

export function handleSignal(signal: Signal) {
  return createAction('HANDLE_SIGNAL', signal)
}
