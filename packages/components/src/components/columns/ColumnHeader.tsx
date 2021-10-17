import { constants, ThemeColors } from '@devhub/core'
import React, { ReactNode } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { useDispatch } from 'react-redux'

import { useColumn } from '../../hooks/use-column'
import { useColumnCreatedByCurrentUser } from '../../hooks/use-column-created-by-current-user'
import { useDesktopOptions } from '../../hooks/use-desktop-options'
import { useReduxState } from '../../hooks/use-redux-state'
import { Browser } from '../../libs/browser'
import { emitter } from '../../libs/emitter'
import { Platform } from '../../libs/platform'
import { useSafeArea } from '../../libs/safe-area-view'
import { IconProp } from '../../libs/vector-icons'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { sharedStyles } from '../../styles/shared'
import {
  contentPadding,
  scaleFactor,
  smallerTextSize,
} from '../../styles/variables'
import { Avatar } from '../common/Avatar'
import { IconButton, IconButtonProps } from '../common/IconButton'
import { Link } from '../common/Link'
import { ScrollViewWithOverlay } from '../common/ScrollViewWithOverlay'
import { Separator } from '../common/Separator'
import { Spacer } from '../common/Spacer'
import { TouchableWithoutFeedback } from '../common/TouchableWithoutFeedback'
import { useDialog } from '../context/DialogContext'
import { ThemedIcon } from '../themed/ThemedIcon'
import { ThemedText } from '../themed/ThemedText'
import { ThemedView } from '../themed/ThemedView'

export function getColumnHeaderThemeColors(): {
  normal: keyof ThemeColors
  hover: keyof ThemeColors
  selected: keyof ThemeColors
} {
  return {
    normal: 'backgroundColor',
    hover: 'backgroundColorLess1',
    selected: 'backgroundColorLess1',
  }
}

export interface ColumnHeaderProps {
  avatar?: { imageURL: string; linkURL: string }
  columnId?: string
  icon?: IconProp
  left?: ReactNode
  right?: ReactNode
  style?: StyleProp<ViewStyle>
  subtitle?: string
  title: string
}

export const columnHeaderItemContentSize = 17 * scaleFactor
const columnHeaderTitleSize = columnHeaderItemContentSize - 1 * scaleFactor
const columnHeaderTitleLineHeight = columnHeaderTitleSize + 4 * scaleFactor
const columnHeaderSubtitleSize = columnHeaderItemContentSize - 5 * scaleFactor
const columnHeaderSubtitleLineHeight =
  columnHeaderSubtitleSize + 4 * scaleFactor

export const columnHeaderHeight =
  contentPadding + columnHeaderTitleLineHeight + columnHeaderSubtitleLineHeight

export function ColumnHeader(props: ColumnHeaderProps) {
  const {
    avatar,
    columnId,
    icon,
    left,
    right,
    style,
    subtitle: _subtitle,
    title: _title,
  } = props

  const title = `${_title || ''}`.toLowerCase()
  const subtitle = `${_subtitle || ''}`.toLowerCase()

  const Dialog = useDialog()

  const safeAreaInsets = useSafeArea()
  const dispatch = useDispatch()
  const bannerMessage = useReduxState(selectors.bannerMessageSelector)
  const { column } = useColumn(columnId || '')
  const subscribeOnly = !useColumnCreatedByCurrentUser(columnId ?? '')
  const { enablePushNotifications: enableDesktopPushNotifications } =
    useDesktopOptions()

  return (
    <ThemedView
      backgroundColor={getColumnHeaderThemeColors().normal}
      style={[
        styles.container,
        {
          paddingTop:
            bannerMessage && bannerMessage.message ? 0 : safeAreaInsets.top,
        },
      ]}
    >
      <TouchableWithoutFeedback
        onPress={
          columnId
            ? () => {
                emitter.emit('SCROLL_TOP_COLUMN', { columnId })
              }
            : undefined
        }
      >
        <View
          style={[
            styles.innerContainer,
            !left && { paddingLeft: (contentPadding * 2) / 3 },
            !right && { paddingRight: (contentPadding * 2) / 3 },
            style,
          ]}
        >
          {!!left && (
            <>
              {left}
              <Spacer width={contentPadding / 2} />
            </>
          )}

          <ScrollViewWithOverlay
            alwaysBounceHorizontal={false}
            containerStyle={styles.mainContainer}
            contentContainerStyle={styles.mainContentContainer}
            horizontal
          >
            {avatar && avatar.imageURL ? (
              <>
                <Avatar
                  avatarUrl={avatar.imageURL}
                  linkURL={avatar.linkURL}
                  shape="circle"
                  size={columnHeaderItemContentSize * 1.1}
                />
                <Spacer width={(contentPadding * 2) / 3} />
              </>
            ) : icon ? (
              <>
                <ThemedIcon
                  {...icon}
                  color="foregroundColor"
                  size={columnHeaderItemContentSize * 1.1}
                />
                <Spacer width={(contentPadding * 2) / 3} />
              </>
            ) : null}

            <View>
              {!!title && (
                <>
                  <ThemedText
                    color="foregroundColor"
                    numberOfLines={1}
                    style={styles.title}
                  >
                    {subscribeOnly
                      ? `${title}(${column?.creator?.name})`
                      : title}
                  </ThemedText>

                  <Spacer width={contentPadding / 2} />
                </>
              )}

              {!!subtitle && (
                <>
                  <View style={sharedStyles.horizontal}>
                    <ThemedText
                      color="foregroundColorMuted65"
                      numberOfLines={1}
                      style={styles.subtitle}
                    >
                      {subtitle}
                    </ThemedText>

                    <Spacer width={contentPadding / 2} />
                  </View>

                  <Spacer width={contentPadding / 2} />
                </>
              )}
            </View>
          </ScrollViewWithOverlay>

          {right}
        </View>
      </TouchableWithoutFeedback>

      <Separator horizontal />
    </ThemedView>
  )
}

ColumnHeader.Button = IconButton

export type ColumnHeaderButtonProps = IconButtonProps

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    maxWidth: '100%',
    height: 'auto',
    overflow: 'hidden',
  },

  innerContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignContent: 'center',
    alignItems: 'center',
    maxWidth: '100%',
    height: columnHeaderHeight,
    overflow: 'hidden',
  },

  mainContainer: {
    flex: 1,
    maxWidth: '100%',
    height: columnHeaderTitleLineHeight + columnHeaderSubtitleLineHeight,
    overflow: 'hidden',
  },

  mainContentContainer: {
    alignContent: 'center',
    alignItems: 'center',
  },

  title: {
    lineHeight: columnHeaderTitleLineHeight,
    fontSize: columnHeaderTitleSize,
    fontWeight: '800',
  },

  subtitle: {
    lineHeight: columnHeaderSubtitleLineHeight,
    fontSize: columnHeaderSubtitleSize,
  },
})
