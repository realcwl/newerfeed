import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native-web'
import { Button } from '../../common/Button'
import { sharedStyles } from '../../../styles/shared'
import { NewsFeedDataExpressionWrapper, ThemeColors } from '@devhub/core'
import { contentPadding, scaleFactor } from '../../../styles/variables'
import { TagToken } from '../../common/TagToken'
import { vibrateHapticFeedback } from '../../../utils/helpers/shared'
import { Spacer } from '../../common/Spacer'
import { TextInput } from '../../common/TextInput'
import { LiteralPredicateTextInput } from './LiteralPredicateTextInput'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export interface LogicalExpressionButtonsProps {}

export interface renderButtonSettings {
  id?: string
  text: string
  color: keyof ThemeColors
  disabled: boolean
  disableDelete?: boolean
  onPress?: () => void
  onDelete?: () => boolean
  setFocusId?: (id: string) => void
  setExpressionWrapper?: (payload: NewsFeedDataExpressionWrapper) => boolean
}

export function renderButtonByTextAndKey(props: renderButtonSettings) {
  const {
    id,
    text,
    color,
    disabled,
    onDelete,
    onPress,
    disableDelete,
    setFocusId,
    setExpressionWrapper,
  } = props

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
          if (!onPress) return
          vibrateHapticFeedback()
          onPress()
        }}
        onRemove={
          onDelete
            ? () => {
                vibrateHapticFeedback()
                onDelete()
              }
            : undefined
        }
        size={25 * scaleFactor}
        disabled={disabled}
      />
    </View>
  )
}

// Return a literal predicate button that change to text input when user clicks.
export const LiteralPredicateButton = React.memo(
  (props: renderButtonSettings) => {
    const { text, id, onDelete, setExpressionWrapper, setFocusId } = props
    const [isEditing, setIsEditing] = useState(false)
    return !isEditing ? (
      renderButtonByTextAndKey({
        ...props,
        onPress: () => setIsEditing(true),
      })
    ) : (
      <LiteralPredicateTextInput
        onDelete={onDelete}
        id={id || ''}
        text={text}
        setExpressionWrapper={setExpressionWrapper}
      />
    )
  },
)

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
