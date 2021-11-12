import { SeedState } from '@devhub/core'
import { getAppLayout } from '../../components/context/LayoutContext'
import { EMPTY_ARRAY } from '../../utils/constants'
import { RootState } from '../types'
import { countersSelector } from './counters'

const s = (state: RootState) => state.app || {}

export const allBannerMessagesSelector = (state: RootState) =>
  s(state).banners || EMPTY_ARRAY

export const bannerMessageSelector = (state: RootState) => {
  const banners = allBannerMessagesSelector(state)
  const loginCount = countersSelector(state).loginSuccess

  const { sizename } = getAppLayout()

  const filteredBanners = banners.filter(
    (banner) =>
      !!(
        banner &&
        banner.id &&
        banner.message &&
        (!banner.minLoginCount || loginCount >= banner.minLoginCount) &&
        (!banner.disableOnSmallScreens || sizename !== '1-small') &&
        !banner.closedAt
      ),
  )

  return filteredBanners[0]
}

// Extract SeedState from Redux store.
export const selectSeedStateFromRootState = (state: RootState) => {
  if (!state.auth.user) return undefined
  const seedState: SeedState = {
    userSeedState: {
      id: state.auth.user.id,
      avatarUrl: state.auth.user.avatarUrl || '',
      name: state.auth.user.name,
    },
    feedSeedState: state.columns.allColumnIds.map((v) => {
      return {
        id: v,
        name: state.columns.columnById[v].title,
      }
    }),
  }

  return seedState
}
