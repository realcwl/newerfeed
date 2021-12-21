import {
  Column as ColumnT,
  constants,
  getDateSmallText,
  ThemeColors,
} from '@devhub/core'
import React, { useCallback, useRef } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { useDispatch, useStore } from 'react-redux'

import { useAppViewMode } from '../../hooks/use-app-view-mode'
import { useColumnData } from '../../hooks/use-column-data'
import { useReduxState } from '../../hooks/use-redux-state'
import { AutoSizer } from '../../libs/auto-sizer'
import { emitter } from '../../libs/emitter'
import { IconProp } from '../../libs/vector-icons'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { sharedStyles } from '../../styles/shared'
import { contentPadding } from '../../styles/variables'

import { HeaderMessage } from '../common/HeaderMessage'
import { useColumnWidth } from '../context/ColumnWidthContext'
import { useAppLayout } from '../context/LayoutContext'
import { useLoginHelpers } from '../context/LoginHelpersContext'
import { Column } from './Column'
import { ColumnFiltersRenderer } from './ColumnFiltersRenderer'
import { ColumnHeader } from './ColumnHeader'
import { ColumnOptionsAccordion } from './ColumnOptionsAccordion'

export function getColumnCardThemeColors({ isDark }: { isDark: boolean }): {
  column: keyof ThemeColors
  card: keyof ThemeColors
  card__hover: keyof ThemeColors
  card__muted: keyof ThemeColors
  card__muted_hover: keyof ThemeColors
} {
  return {
    card: 'backgroundColorLighther1',
    card__hover: isDark ? 'backgroundColorLighther2' : 'backgroundColorDarker1',
    card__muted: isDark ? 'backgroundColor' : 'backgroundColorDarker1',
    card__muted_hover: isDark
      ? 'backgroundColorLighther1'
      : 'backgroundColorDarker2',
    column: 'backgroundColor',
  }
}

export function getCardBackgroundThemeColor({
  isDark,
  isMuted,
  isHovered,
}: {
  isDark: boolean
  isMuted: boolean
  isHovered?: boolean
}) {
  const backgroundThemeColors = getColumnCardThemeColors({ isDark })

  const _backgroundThemeColor =
    (isMuted &&
      (isHovered
        ? backgroundThemeColors.card__muted_hover
        : backgroundThemeColors.card__muted)) ||
    (isHovered ? backgroundThemeColors.card__hover : backgroundThemeColors.card)

  return _backgroundThemeColor
}

export interface ColumnRendererProps {
  avatarImageURL?: string
  avatarLinkURL?: string
  children: React.ReactNode
  columnId: string
  columnIndex: number
  columnType: ColumnT['type']
  icon: IconProp
  pagingEnabled?: boolean
  subtitle: string | undefined
  title: string
}

export const ColumnRenderer = React.memo((props: ColumnRendererProps) => {
  const {
    avatarImageURL,
    avatarLinkURL,
    children,
    columnId,
    columnIndex,
    icon,
    pagingEnabled,
    subtitle,
    title,
  } = props

  const columnOptionsRef = useRef<ColumnOptionsAccordion>(null)
  const appLayout = useAppLayout()
  const { appOrientation } = appLayout
  const appViewModeresult = useAppViewMode()
  const { appViewMode } = appViewModeresult
  const columnWidth = useColumnWidth()
  const columnData = useColumnData(columnId, {
    mergeSimilar: false,
  })
  const { hasCrossedColumnsLimit, filteredItemsIds, getItemByNodeIdOrId } =
    columnData

  const dispatch = useDispatch()
  const store = useStore()

  function focusColumn() {
    emitter.emit('FOCUS_ON_COLUMN', {
      columnId,
      highlight: false,
      scrollTo: false,
    })
  }

  const toggleOptions = () => {
    if (!columnOptionsRef.current) return

    focusColumn()
    columnOptionsRef.current.toggle()
  }

  const hasOneUnreadItem = true

  const renderLeftSeparator =
    appViewMode === 'multi-column' &&
    !(columnIndex === 0 && appOrientation === 'landscape')

  const renderRightSeparator = appViewMode === 'multi-column'

  return (
    <Column
      key={`column-renderer-${columnId}-inner-container`}
      backgroundColor={getColumnCardThemeColors({ isDark: false }).column}
      columnId={columnId}
      pagingEnabled={pagingEnabled}
      renderLeftSeparator={renderLeftSeparator}
      renderRightSeparator={renderRightSeparator}
    >
      <ColumnHeader
        key={`column-renderer-${columnId}-header`}
        columnId={columnId}
        title={title}
        subtitle={subtitle}
        style={{ paddingRight: contentPadding / 2 }}
        {...(avatarImageURL
          ? { avatar: { imageURL: avatarImageURL, linkURL: avatarLinkURL! } }
          : { icon })}
        right={
          <>
            <ColumnHeader.Button
              key="column-options-button-toggle-mark-as-read"
              analyticsLabel={
                !hasOneUnreadItem ? 'mark_as_unread' : 'mark_as_read'
              }
              disabled={hasCrossedColumnsLimit}
              family="octicon"
              name={!hasOneUnreadItem ? 'eye-closed' : 'eye'}
              onPress={() => {
                dispatch(
                  actions.setItemsReadStatus({
                    itemNodeIds: filteredItemsIds,
                    read: true,
                    syncup: true,
                  }),
                )

                focusColumn()
              }}
              tooltip="Mark all as read"
            />

            <ColumnHeader.Button
              key="column-options-toggle-button"
              analyticsAction="toggle"
              analyticsLabel="column_options"
              family="octicon"
              name="settings"
              onPress={toggleOptions}
              tooltip="Options"
            />
          </>
        }
      />

      <View
        style={[
          sharedStyles.flex,
          sharedStyles.fullWidth,
          sharedStyles.fullHeight,
        ]}
      >
        <AutoSizer
          defaultWidth={columnWidth}
          defaultHeight={Dimensions.get('window').height}
          style={[
            sharedStyles.relative,
            sharedStyles.flex,
            sharedStyles.fullWidth,
            sharedStyles.fullHeight,
          ]}
        >
          {({ width, height }) => (
            <View style={StyleSheet.absoluteFill}>
              <ColumnOptionsAccordion
                ref={columnOptionsRef}
                columnId={columnId}
              />

              <View style={{ width, height }}>{children}</View>
            </View>
          )}
        </AutoSizer>
      </View>

      <ColumnFiltersRenderer
        key="column-options-renderer"
        columnId={columnId}
        fixedPosition="right"
        header="header"
        type="local"
      />
    </Column>
  )
})

ColumnRenderer.displayName = 'ColumnRenderer'
