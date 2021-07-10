import { constants, NewsFeedData } from '@devhub/core'
import qs from 'qs'
import { ReactNode } from 'react'
import { findDOMNode } from 'react-dom'

import {
  AppLayoutProviderState,
  getAppLayout,
} from '../../components/context/LayoutContext'
import { Browser } from '../../libs/browser'
import { Linking } from '../../libs/linking'
import { Platform } from '../../libs/platform'

export function findNode(ref: any) {
  try {
    let node = ref && (ref.current || ref)

    if (node && node.getNode && node.getNode()) node = node.getNode()

    if (node && node._touchableNode) node = node._touchableNode

    if (node && node._node) node = node._node

    if (node && Platform.OS === 'web') node = findDOMNode(node)

    return node
  } catch (error) {
    console.error('Failed to find node', error, { ref })
    return null
  }
}

export function getItemNodeIdOrId(
  item: NewsFeedData | undefined,
): string | undefined {
  if (!item) return undefined
  return item.id
}

export function tryFocus(ref: any): boolean | null {
  try {
    const node = findNode(ref)

    if (node?.focus) {
      if (!(node.tabIndex >= 0)) node.tabIndex = -1

      node.focus({ preventScroll: true })
      return true
    }
  } catch (error) {
    console.error(error)
    return false
  }

  return null
}

export function genericParseText<T extends string>(
  text: string,
  pattern: RegExp,
  fn: (match: T) => ReactNode,
) {
  if (!(text && typeof text === 'string')) return [text].filter(Boolean)

  const matches = text.match(new RegExp(pattern, 'g')) as T[]
  if (!(matches && matches.length)) return [text].filter(Boolean)

  return text.split(pattern).reduce((result, item, index) => {
    if (!matches[index]) return result.concat([item].filter(Boolean))

    return result.concat([item, fn(matches[index])].filter(Boolean))
  }, [] as ReactNode[])
}

export function isBigEnoughForMultiColumnView(
  sizename?: AppLayoutProviderState['sizename'],
) {
  return (sizename || getAppLayout().sizename) >= '2-medium'
}

export function vibrateHapticFeedback() {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    const ReactNativeHapticFeedback =
      require('react-native-haptic-feedback').default

    ReactNativeHapticFeedback.trigger('selection', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: true,
    })
  } else if (
    Platform.OS === 'web' &&
    window.navigator &&
    window.navigator.vibrate
  ) {
    window.navigator.vibrate(50)
  }
}

export function roundToEven(n: number) {
  return Math.round(n) + (Math.round(n) % 2)
}
