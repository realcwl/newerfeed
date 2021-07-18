import React from 'react'
import { View, StyleSheet } from 'react-native-web'
import { Button } from '../../common/Button'
import { sharedStyles } from '../../../styles/shared'
import { ThemeColors } from '@devhub/core'
import { contentPadding, scaleFactor } from '../../../styles/variables'
import { TagToken } from '../../common/TagToken'
import { vibrateHapticFeedback } from '../../../utils/helpers/shared'
import { Spacer } from '../../common/Spacer'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export interface LogicalExpressionButtonsProps {}

export interface renderButtonSettings {
  text: string
  color: keyof ThemeColors
  disabled: boolean
  disableDelete?: boolean
  onPress?: () => boolean
  onDelete?: () => boolean
}

export function renderButtonByTextAndKey(settings: renderButtonSettings) {
  const { text, color, disabled, onDelete, disableDelete } = settings

  return (
    <View
      key={`filter-tag-text`}
      style={sharedStyles.horizontalAndVerticallyAligned}
    >
      <TagToken
        label={text}
        colors={{
          backgroundHoverThemeColor: color,
          backgroundThemeColor: color,
          foregroundThemeColor: 'black',
          foregroundHoverThemeColor: 'black',
        }}
        onPress={() => {
          vibrateHapticFeedback()

          console.log('pressed with haptic feedback')
        }}
        onRemove={
          onDelete
            ? () => {
                onDelete()
              }
            : undefined
        }
        size={30 * scaleFactor}
        disabled={disabled}
      />
    </View>
  )
}

export const LogicalExpressionButtons = React.memo(
  (props: LogicalExpressionButtonsProps) => {
    return (
      <View style={[sharedStyles.flex, sharedStyles.horizontal]}>
        <View>
          {renderButtonByTextAndKey({
            text: 'AllOf',
            color: 'yellow',
            disabled: false,
          })}
        </View>
        <Spacer width={contentPadding} />
        <View>
          {renderButtonByTextAndKey({
            text: 'AnyOf',
            color: 'green',
            disabled: false,
          })}
        </View>
        <Spacer width={contentPadding} />
        <View>
          {renderButtonByTextAndKey({
            text: 'Not',
            color: 'lightRed',
            disabled: false,
          })}
        </View>
      </View>
    )
  },
)
