import { Column } from '@devhub/core'
import React, { useCallback, useMemo, useRef } from 'react'
import { StyleSheet, TouchableHighlightProps, View } from 'react-native'

import { useHover } from '../../hooks/use-hover'
import { useIsItemFocused } from '../../hooks/use-is-item-focused'
import { useItem } from '../../hooks/use-item'
import { getLastUsedInputType } from '../../hooks/use-last-input-type'
import { emitter } from '../../libs/emitter'
import { Platform } from '../../libs/platform'
import { sharedStyles } from '../../styles/shared'
import { tryFocus } from '../../utils/helpers/shared'
import { getCardBackgroundThemeColor } from '../columns/ColumnRenderer'
import { Link } from '../common/Link'
import { getTheme, useTheme } from '../context/ThemeContext'
import {
  ThemedTouchableHighlight,
  ThemedTouchableHighlightProps,
} from '../themed/ThemedTouchableHighlight'
import { ThemedView } from '../themed/ThemedView'
import { BaseCard } from './BaseCard'
import { getCardPropsForItem } from './BaseCard.shared'

export interface CardWithLinkProps {
  columnId: string
  isInsideSwipeable?: boolean
  nodeIdOrId: string
  type: Column['type']
}

export const CardWithLink = React.memo((props: CardWithLinkProps) => {
  const { columnId, isInsideSwipeable, nodeIdOrId, type } = props

  const ref = useRef<any>(null)
  const focusIndicatorRef = useRef<View>(null)
  const isFocusedRef = useRef(false)
  const isHoveredRef = useRef(false)

  const item = useItem(nodeIdOrId)

  const { CardComponent, cardProps } = useMemo(() => {
    if (!item) {
      return {}
    }

    const _cardProps = getCardPropsForItem(type, columnId, item)

    return {
      cardProps: _cardProps,
      CardComponent: (
        <BaseCard
          key={`${type}-base-card-${nodeIdOrId}`}
          {..._cardProps}
          // appViewMode={appViewMode}
          columnId={columnId}
        />
      ),
    }
  }, [/* appViewMode, */ columnId, item])

  // const isReadRef = useDynamicRef(!!(cardProps && cardProps.isRead))

  const updateStyles = useCallback(
    () => {
      if (ref.current) {
        const theme = getTheme()

        ref.current.setNativeProps({
          style: {
            backgroundColor:
              theme[
                getCardBackgroundThemeColor({
                  isDark: theme.isDark,
                  isMuted: false, // appViewMode === 'single-column' ? false : isReadRef.current,
                  isHovered: isHoveredRef.current,
                })
              ],
          },
        })
      }

      if (focusIndicatorRef.current) {
        focusIndicatorRef.current.setNativeProps({
          style: {
            opacity:
              getLastUsedInputType() === 'keyboard' && isFocusedRef.current
                ? 0.1
                : 0,
          },
        })
      }
    },
    [
      /*appViewMode*/
    ],
  )

  const handleFocusChange = useCallback(
    (value, disableDomFocus?: boolean) => {
      const changed = isFocusedRef.current !== value
      isFocusedRef.current = value

      if (Platform.OS === 'web' && value && changed && !disableDomFocus) {
        tryFocus(ref.current)
      }

      updateStyles()
    },
    [columnId],
  )

  useIsItemFocused(columnId, '', handleFocusChange)

  useHover(
    ref,
    useCallback(
      (isHovered) => {
        // if (isHoveredRef.current === isHovered) return
        // isHoveredRef.current = isHovered
        // const isAlreadyFocused = isFocusedRef.current
        // if (isHovered && !isAlreadyFocused) {
        //   handleFocusChange(true)
        //   emitter.emit('FOCUS_ON_COLUMN_ITEM', {
        //     columnId,
        //     itemNodeIdOrId: '',
        //   })
        // } else {
        //   updateStyles()
        // }
      },
      [columnId],
    ),
  )

  if (!(item && cardProps)) return null

  // const isSaved = isItemSaved(item)

  return (
    <Link
      ref={ref}
      TouchableComponent={
        isInsideSwipeable ? GestureHandlerCardTouchable : NormalCardTouchable
      }
      backgroundThemeColor={(theme) =>
        getCardBackgroundThemeColor({
          isDark: theme.isDark,
          isMuted: false, // appViewMode === 'single-column' ? false : cardProps.isRead,
          // isHovered: !Platform.supportsTouch && isFocusedRef.current,
        })
      }
      data-card-link
      enableBackgroundHover={false}
      enableForegroundHover={false}
      openOnNewTab
      style={sharedStyles.relative}
      onFocus={() => {
        if (isFocusedRef.current) return

        handleFocusChange(true, true)

        if (!Platform.supportsTouch) {
          emitter.emit('FOCUS_ON_COLUMN_ITEM', {
            columnId,
            itemNodeIdOrId: '',
          })
        }
      }}
      onBlur={() => {
        handleFocusChange(false, true)
      }}
    >
      <ThemedView
        ref={focusIndicatorRef}
        backgroundColor="primaryBackgroundColor"
        style={[
          StyleSheet.absoluteFill,
          {
            opacity:
              getLastUsedInputType() === 'keyboard' && isFocusedRef.current
                ? 0.1
                : 0,
          },
        ]}
      />

      {CardComponent}

      {/* {appViewMode === 'single-column' && (
        <CardLeftBorder
          style={{
            opacity: !!(cardProps && !cardProps.isRead) ? 1 : 0,
          }}
        />
      )} */}
    </Link>
  )
})

CardWithLink.displayName = 'CardWithLink'

const GestureHandlerTouchableHighlight = Platform.select({
  android: () => require('react-native-gesture-handler').TouchableHighlight,
  ios: () => require('react-native-gesture-handler').TouchableHighlight,
  default: () => require('../common/TouchableHighlight').TouchableHighlight,
})()

const GestureHandlerCardTouchable = React.forwardRef<
  View,
  TouchableHighlightProps
>((props, ref) => {
  const theme = useTheme()

  return (
    <View ref={ref} style={props.style}>
      <GestureHandlerTouchableHighlight
        accessible={false}
        underlayColor={
          theme[
            getCardBackgroundThemeColor({
              isDark: theme.isDark,
              isMuted: false,
              isHovered: true,
            })
          ]
        }
        {...props}
        style={StyleSheet.flatten([
          props.style,
          { backgroundColor: 'transparent' },
        ])}
      >
        <View>{props.children}</View>
      </GestureHandlerTouchableHighlight>
    </View>
  )
})

const NormalCardTouchable = React.forwardRef<
  ThemedTouchableHighlight,
  ThemedTouchableHighlightProps
>((props, ref) => {
  return (
    <View ref={ref} style={props.style}>
      <ThemedTouchableHighlight
        ref={ref}
        accessible={false}
        backgroundColor="transparent"
        underlayColor={(theme) =>
          theme[
            getCardBackgroundThemeColor({
              isDark: theme.isDark,
              isMuted: false,
              isHovered: true,
            })
          ]
        }
        {...props}
      >
        <View>{props.children}</View>
      </ThemedTouchableHighlight>
    </View>
  )
})
