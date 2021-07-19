import { ThemeColors } from '@devhub/core'
import React from 'react'
import { View } from 'react-native'

import { IconProp } from '../../libs/vector-icons'
import { sharedStyles } from '../../styles/shared'
import {
  contentPadding,
  scaleFactor,
  smallTextSize,
} from '../../styles/variables'
import { Button, ButtonProps } from '../common/Button'
import { Spacer } from '../common/Spacer'
import { ThemedIcon } from '../themed/ThemedIcon'
import { ThemedText, ThemedTextProps } from '../themed/ThemedText'

export type TagTokenProps = {
  onPress: () => void
  onRemove?: (() => void) | undefined
  removeTooltip?: ButtonProps['tooltip']
  size?: number
  strikethrough?: boolean
  tooltip?: ButtonProps['tooltip']
  transparent?: boolean
  colors?: {
    backgroundThemeColor?: keyof ThemeColors
    foregroundThemeColor?: keyof ThemeColors
    backgroundHoverThemeColor?: keyof ThemeColors | undefined
    foregroundHoverThemeColor?: keyof ThemeColors
  }
  disabled?: boolean
  disableDelete?: boolean
} & (
  | {
      icon?: undefined
      label: string
    }
  | {
      icon: IconProp
      label?: undefined
    }
)

export const TagToken = React.memo((props: TagTokenProps) => {
  const {
    icon,
    label,
    onPress,
    onRemove,
    removeTooltip = 'Remove',
    size = smallTextSize + 4 * scaleFactor + contentPadding + 2,
    strikethrough,
    colors,
    tooltip,
    disabled,
    transparent,
    disableDelete,
  } = props

  const iconOrLabelStyle: ThemedTextProps['style'] = {
    marginTop: (icon ? 2 : -1) * scaleFactor,
    lineHeight: smallTextSize + (5 + (icon ? 4 : 0)) * scaleFactor,
    fontSize: smallTextSize + (icon ? 4 : 0) * scaleFactor,
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: strikethrough && !icon ? 'line-through' : 'none',
  }

  return (
    <Button
      colors={colors}
      contentContainerStyle={
        icon
          ? sharedStyles.paddingHorizontalNone
          : sharedStyles.paddingHorizontalHalf
      }
      onPress={onPress}
      size={size}
      tooltip={tooltip}
      type="neutral"
      withBorder
      disabled={disabled ? true : false}
    >
      <View style={sharedStyles.horizontalAndVerticallyAligned}>
        <Spacer width={contentPadding / 2} />

        {icon ? (
          <ThemedIcon
            {...icon}
            color={(icon.color as any) || 'foregroundColor'}
            style={iconOrLabelStyle}
          />
        ) : (
          <ThemedText
            color={colors && colors.foregroundThemeColor}
            style={iconOrLabelStyle}
          >
            {label}
          </ThemedText>
        )}

        {onRemove ? (
          <>
            <Spacer width={contentPadding / 3} />

            <Button
              colors={{
                backgroundThemeColor: 'transparent',
                foregroundThemeColor: 'foregroundColor',
                backgroundHoverThemeColor: 'red',
                foregroundHoverThemeColor: 'gray',
              }}
              hitSlop={{
                top: contentPadding,
                bottom: contentPadding,
                right: contentPadding,
                left: contentPadding / 4,
              }}
              style={{
                marginTop: 1 * scaleFactor,
              }}
              contentContainerStyle={{
                paddingHorizontal: 0,
                width: smallTextSize + 3 * scaleFactor,
                height: smallTextSize + 3 * scaleFactor,
              }}
              onPress={onRemove}
              size={smallTextSize + 3 * scaleFactor}
              tooltip={removeTooltip}
              type="custom"
            >
              {() => (
                <ThemedIcon
                  color={colors && colors.foregroundThemeColor}
                  family="octicon"
                  name="x"
                  size={smallTextSize - 3 * scaleFactor}
                  style={{
                    lineHeight: smallTextSize + 3 * scaleFactor,
                  }}
                />
              )}
            </Button>

            <Spacer width={contentPadding / 3} />
          </>
        ) : (
          <Spacer width={contentPadding / 2} />
        )}
      </View>
    </Button>
  )
})

TagToken.displayName = 'TagToken'
