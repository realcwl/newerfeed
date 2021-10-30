import { Dimensions, PixelRatio } from 'react-native'

import { Platform } from '../libs/platform'

const isSuperSmallScreen = Dimensions.get('screen').width < 350
export const scaleFactor =
  (isSuperSmallScreen
    ? 1
    : Platform.isMacOS || Platform.isPad
    ? 1.3
    : Platform.realOS === 'ios' || Platform.realOS === 'android'
    ? 1.1
    : 1) * (PixelRatio.getFontScale() || 1)

export const avatarSize = 40 * scaleFactor
export const mediumAvatarSize = 20 * scaleFactor
export const smallAvatarSize = 18 * scaleFactor

export const contentPadding = 14 * scaleFactor

export const mutedOpacity = 0.6
export const superMutedOpacity = 0.1
export const radius = 4

export const extraLargeTextSize = 17 * scaleFactor
export const largeTextSize = 16 * scaleFactor
export const normalTextSize = 14 * scaleFactor
export const smallTextSize = 13 * scaleFactor
export const smallerTextSize = 12 * scaleFactor

export const screen_breakpoint_sm = 600
export const screen_breakpoint_md = 900
export const screen_breakpoint_lg = 1200
export const screen_breakpoint_xl = 1536
