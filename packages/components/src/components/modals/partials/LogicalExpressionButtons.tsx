import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { sharedStyles } from '../../../styles/shared'
import { guid, NewsFeedDataExpressionWrapper, ThemeColors } from '@devhub/core'
import { contentPadding, scaleFactor } from '../../../styles/variables'
import { TagToken } from '../../common/TagToken'
import { vibrateHapticFeedback } from '../../../utils/helpers/shared'
import { Spacer } from '../../common/Spacer'
import { LiteralPredicateTextInput } from './LiteralPredicateTextInput'
import { getTheme } from '../../context/ThemeContext'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export interface renderButtonSettings {
  id?: string
  text: string
  color?: keyof ThemeColors
  disabled: boolean
  disableDelete?: boolean
  onPress?: () => void
  onDelete?: () => boolean
  setFocusId?: (id: string) => void
  setExpressionWrapper?: (payload: NewsFeedDataExpressionWrapper) => boolean
}

export function renderButtonByTextAndKey(props: renderButtonSettings) {
  const { text, color, disabled, onDelete, onPress, disableDelete } = props

  const theme = getTheme()

  return (
    <View
      key={`filter-tag-text`}
      style={sharedStyles.horizontalAndVerticallyAligned}
    >
      <TagToken
        label={text}
        colors={{
          backgroundHoverThemeColor: color,
          backgroundThemeColor: color
            ? color
            : theme.isDark
            ? 'blueGray'
            : undefined,
          foregroundThemeColor: color
            ? 'black'
            : theme.isDark
            ? 'white'
            : 'black',
          foregroundHoverThemeColor: theme.isDark ? 'white' : 'black',
        }}
        onPress={() => {
          if (!onPress) return
          vibrateHapticFeedback()
          onPress()
        }}
        onRemove={
          disableDelete
            ? undefined
            : onDelete
            ? () => {
                vibrateHapticFeedback()
                onDelete()
              }
            : undefined
        }
        size={25 * scaleFactor}
        disabled={disabled}
        disableDelete={disabled}
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

export interface AddNewPredicateButtonProps {
  id: string

  focusId: string

  // Set this creator expression's id to the current focus. This should be
  // called when we click this button, it should also be called to clear the
  // focus id when we submit the predicate as literal predicate, or onBlur when
  // the text input is empty.
  setFocusId: (id: string) => void

  // This function will be called when we submit the form, to actually create
  // a literal predicate. The creation of new creator expression will be handled
  // by parent container.
  setExpressionWrapper: (payload: NewsFeedDataExpressionWrapper) => boolean
}

// An addition button. It rendered the creator expression. When clicks it pops
// out a text input as well as 3 logical gate buttons. User thus can choose to
// filter by literal text or click the logical gate to add logical gate.
export const AddNewPredicateButton = React.memo(
  (props: AddNewPredicateButtonProps) => {
    const { id, focusId, setFocusId, setExpressionWrapper } = props
    return id !== focusId ? (
      renderButtonByTextAndKey({
        id: id,
        text: '+',
        color: undefined,
        disabled: false,
        onPress: () => {
          setFocusId(id)
        },
      })
    ) : (
      <View>
        <LiteralPredicateTextInput
          text={''}
          id={id}
          setFocusId={setFocusId}
          setExpressionWrapper={setExpressionWrapper}
        />
        <Spacer height={contentPadding / 2} />
        <LogicalExpressionButtons
          focusId={id}
          setFocusId={setFocusId}
          setExpressionWrapper={setExpressionWrapper}
        />
      </View>
    )
  },
)

export interface LogicalExpressionButtonsProps {
  focusId: string
  setFocusId: (id: string) => void
  setExpressionWrapper: (payload: NewsFeedDataExpressionWrapper) => boolean
}

export const LogicalExpressionButtons = React.memo(
  (props: LogicalExpressionButtonsProps) => {
    const { focusId, setFocusId, setExpressionWrapper } = props
    return (
      <View style={[sharedStyles.flex, sharedStyles.horizontal]}>
        <View>
          {renderButtonByTextAndKey({
            text: 'A',
            color: 'orange',
            onPress: () => {
              // add a creator expression.
              setExpressionWrapper({
                id: focusId,
                expr: {
                  allOf: [
                    {
                      id: guid(),
                    },
                  ],
                },
              })
              setFocusId('')
            },
            disabled: false,
            disableDelete: false,
          })}
        </View>
        <Spacer width={contentPadding / 2} />
        <View>
          {renderButtonByTextAndKey({
            text: 'O',
            color: 'white',
            onPress: () => {
              // add a creator expression.
              setExpressionWrapper({
                id: focusId,
                expr: {
                  anyOf: [
                    {
                      id: guid(),
                    },
                  ],
                },
              })
              setFocusId('')
            },
            disabled: false,
            disableDelete: false,
          })}
        </View>
        <Spacer width={contentPadding / 2} />
        <View>
          {renderButtonByTextAndKey({
            text: 'N',
            color: 'lightRed',
            disabled: false,
            disableDelete: false,
            onPress: () => {
              // add a creator expression.
              setExpressionWrapper({
                id: focusId,
                expr: {
                  notTrue: {
                    id: guid(),
                  },
                },
              })
              setFocusId('')
            },
          })}
        </View>
      </View>
    )
  },
)
