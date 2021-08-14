import { SeedState } from '@devhub/core'
import { createAction } from '../helpers'

export function closeBannerMessage(id: string) {
  return createAction('CLOSE_BANNER_MESSAGE', id)
}

export function updateSeedState(seedState: SeedState) {
  return createAction('UPDATE_SEED_STATE', seedState)
}
