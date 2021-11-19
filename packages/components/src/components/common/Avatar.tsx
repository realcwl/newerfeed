import React from 'react'
import { PixelRatio, View } from 'react-native'

import {
  avatarSize,
  mutedOpacity,
  radius,
  smallAvatarSize,
} from '../../styles/variables'
import {
  ThemedImageWithLoading,
  ThemedImageWithLoadingProps,
} from '../themed/ThemedImageWithLoading'
import { ConditionalWrap } from './ConditionalWrap'
import { Link } from './Link'
import { TouchableOpacityProps } from './TouchableOpacity'

export interface AvatarProps
  extends Partial<Omit<ThemedImageWithLoadingProps, 'tooltip'>> {
  avatarUrl?: string
  disableLink?: boolean
  email?: string
  hitSlop?: TouchableOpacityProps['hitSlop']
  linkURL?: string
  muted?: boolean
  repo?: string
  shape?: 'circle' | 'rounded' | 'square'
  size?: number
  small?: boolean
  style?: ThemedImageWithLoadingProps['style']
  tooltip?: string
  username?: string
}

export const size = avatarSize

export function Avatar(props: AvatarProps) {
  const {
    avatarUrl: _avatarUrl,
    disableLink,
    email,
    hitSlop,
    linkURL,
    muted,
    repo,
    shape,
    size: _size,
    small,
    style,
    tooltip: _tooltip,
    username: _username,
    ...otherProps
  } = props

  const finalSize = _size || (small ? smallAvatarSize : avatarSize)

  const username = (_username || '')
    .replace('[bot]', '')
    .replace('app/', '')
    .split('/')[0]

  const avatarUrl = _avatarUrl

  const uri = avatarUrl

  if (!uri) return null

  const tooltip =
    !_tooltip && _tooltip !== undefined
      ? ''
      : _tooltip || (username && `@${username}`) || ''

  return (
    <ConditionalWrap
      condition
      wrap={(children) =>
        linkURL ? (
          <Link hitSlop={hitSlop} href={linkURL}>
            {children}
          </Link>
        ) : (
          <View>{children}</View>
        )
      }
    >
      <ThemedImageWithLoading
        backgroundColorFailed="#FFFFFF"
        backgroundColorLoaded="#FFFFFF"
        backgroundColorLoading="foregroundColorTransparent05"
        {...otherProps}
        source={{ uri }}
        style={{
          height: finalSize,
          width: finalSize,
          borderWidth: 0,
          borderRadius:
            !shape || shape === 'circle'
              ? finalSize / 2
              : shape === 'square'
              ? 0
              : radius,
          ...(muted && { opacity: mutedOpacity }),
          ...style,
        }}
        tooltip={tooltip}
      />
    </ConditionalWrap>
  )
}
