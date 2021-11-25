import { BannerType, Theme } from '@devhub/core'
import { darken, getLuminance, lighten } from 'polished'

import { Platform } from '../../libs/platform'

export function computeThemeColor(color: string) {
  return Platform.OS === 'web' && color && color.includes('var(--')
    ? typeof getComputedStyle === 'function'
      ? getComputedStyle(document.body)
          .getPropertyValue(color.replace(/var\((.+)\)$/, '$1'))
          .trim()
      : undefined
    : color
}

export function getLuminanceDifference(colorA: string, colorB: string) {
  return getLuminance(colorA) - getLuminance(colorB)
}

export function getReadableColor(
  color: string,
  backgroundColor: string,
  minimumContrastRatio = 0.4,
) {
  if (!(color && backgroundColor && minimumContrastRatio > 0)) return color

  try {
    const luminanceDiff = getLuminanceDifference(color, backgroundColor)
    const luminanceDiffAbs = Math.abs(luminanceDiff)
    if (luminanceDiffAbs >= minimumContrastRatio) return color

    const isDark = getLuminance(backgroundColor) <= 0.2
    return isDark
      ? lighten(Math.abs(minimumContrastRatio - luminanceDiffAbs), color)
      : darken(Math.abs(minimumContrastRatio - luminanceDiffAbs), color)
  } catch (error) {
    console.error(error)
    return color
  }
}

export function fixColorHexWithoutHash(color: string | undefined) {
  if (color && (color.length === 6 || color.length === 3) && color[0] !== '#')
    return `#${color}`

  return color || ''
}

export const getNotificationColor = (
  type: BannerType | undefined,
  theme: Theme,
): string => {
  if (type == null) {
    return theme.transparent
  }
  switch (type) {
    case 'BANNER_TYPE_SUCCESS':
      return darken(0.1, theme.green)
    case 'BANNER_TYPE_ERROR':
      return theme.red
    case 'BANNER_TYPE_MESSAGE':
    default:
      return theme.blue
  }
}
