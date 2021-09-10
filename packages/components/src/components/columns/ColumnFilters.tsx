import {
  filterRecordHasAnyForcedValue,
  filterRecordWithThisValueCount,
  getFilterCountMetadata,
  itemPassesFilterRecord,
  ThemeColors,
} from '@devhub/core'
import _ from 'lodash'
import React, { Fragment, useCallback, useMemo, useRef, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { useColumn } from '../../hooks/use-column'
import { useColumnData } from '../../hooks/use-column-data'
import { useReduxState } from '../../hooks/use-redux-state'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { sharedStyles } from '../../styles/shared'
import { contentPadding } from '../../styles/variables'
import { vibrateHapticFeedback } from '../../utils/helpers/shared'
import { columnHeaderItemContentSize } from '../columns/ColumnHeader'
import { Button } from '../common/Button'
import {
  Checkbox,
  checkboxLabelSpacing,
  defaultCheckboxSize,
} from '../common/Checkbox'
import {
  CounterMetadata,
  CounterMetadataProps,
} from '../common/CounterMetadata'
import { Separator } from '../common/Separator'
import { Spacer } from '../common/Spacer'
import { ThemedView } from '../themed/ThemedView'
import { getColumnHeaderThemeColors } from './ColumnHeader'
import { ColumnOptionsInbox } from './ColumnOptionsInbox'
import { ColumnOptionsRow } from './ColumnOptionsRow'
import { sharedColumnOptionsStyles } from './options/shared'

const metadataSortFn = (a: { label: string }, b: { label: string }) =>
  a.label < b.label ? -1 : a.label > b.label ? 1 : 0

export interface ColumnFiltersProps {
  columnId: string
  forceOpenAll?: boolean
  startWithFiltersExpanded?: boolean
}

export type ColumnFilterCategory =
  | 'bot'
  | 'draft'
  | 'event_action'
  | 'inbox'
  // | 'involves'
  | 'notification_reason'
  | 'privacy'
  | 'repos'
  | 'saved_for_later'
  | 'state'
  | 'subject_types'
  | 'unread'

export const ColumnFilters = React.memo((props: ColumnFiltersProps) => {
  const { columnId, forceOpenAll, startWithFiltersExpanded } = props

  const { column, dashboardFromUsername } = useColumn(columnId)

  const _allColumnOptionCategories: (ColumnFilterCategory | false)[] = [
    'saved_for_later',
    'unread',
  ]

  const allColumnOptionCategories = _allColumnOptionCategories.filter(
    Boolean,
  ) as ColumnFilterCategory[]

  const [openedOptionCategories, setOpenedOptionCategories] = useState(
    () =>
      new Set<ColumnFilterCategory>(
        forceOpenAll || startWithFiltersExpanded
          ? allColumnOptionCategories
          : [],
      ),
  )
  const lastColumnCategory = allColumnOptionCategories.slice(-1)[0]

  const allIsOpen =
    openedOptionCategories.size === allColumnOptionCategories.length
  const allowOnlyOneCategoryToBeOpenedRef = useRef(!allIsOpen)
  const allowToggleCategories = !forceOpenAll

  const dispatch = useDispatch()

  const toggleOpenedOptionCategory = useCallback(
    (optionCategory: ColumnFilterCategory) => {
      setOpenedOptionCategories((_set) => {
        const set = new Set(_set)
        const isOpen = set.has(optionCategory)
        if (allowOnlyOneCategoryToBeOpenedRef.current) set.clear()
        isOpen ? set.delete(optionCategory) : set.add(optionCategory)

        if (set.size === 0) allowOnlyOneCategoryToBeOpenedRef.current = true

        return set
      })
    },
    [],
  )

  if (!column) return null

  function getCheckboxRight(
    counterMetadataProps: Pick<
      CounterMetadataProps,
      'read' | 'total' | 'unread'
    >,
    {
      alwaysRenderANumber,
      backgroundColor,
    }: {
      alwaysRenderANumber?: boolean
      backgroundColor?: keyof ThemeColors
    } = {},
  ) {
    return (
      <CounterMetadata
        {...counterMetadataProps}
        alwaysRenderANumber={alwaysRenderANumber}
        backgroundColor={backgroundColor}
      />
    )
  }

  return (
    <ThemedView
      backgroundColor={getColumnHeaderThemeColors().normal}
      style={sharedStyles.flex}
    >
      <ScrollView
        alwaysBounceHorizontal={false}
        alwaysBounceVertical
        bounces
        showsHorizontalScrollIndicator={false}
        style={sharedStyles.flex}
      >
        {allColumnOptionCategories.includes('saved_for_later') &&
          (() => {
            const saved = column.filters && column.filters.saved

            return (
              <ColumnOptionsRow
                enableBackgroundHover={allowToggleCategories}
                hasChanged={typeof saved === 'boolean'}
                headerItemFixedIconSize={columnHeaderItemContentSize}
                hideSeparator={lastColumnCategory === 'saved_for_later'}
                icon={{
                  family: 'octicon',
                  name: saved
                    ? 'bookmark-fill'
                    : saved === false
                    ? 'bookmark-slash-fill'
                    : 'bookmark',
                }}
                isOpen={openedOptionCategories.has('saved_for_later')}
                onToggle={
                  allowToggleCategories
                    ? () => toggleOpenedOptionCategory('saved_for_later')
                    : undefined
                }
                right={
                  saved === true ? 'Only' : saved === false ? 'Excluded' : ''
                }
                title="Bookmarks"
              >
                <Checkbox
                  checked={typeof saved === 'boolean' ? saved : null}
                  containerStyle={
                    sharedColumnOptionsStyles.fullWidthCheckboxContainerWithPadding
                  }
                  defaultValue
                  squareContainerStyle={
                    sharedColumnOptionsStyles.checkboxSquareContainer
                  }
                  enableIndeterminateState
                  label="Bookmarks"
                  onChange={(checked) => {
                    vibrateHapticFeedback()

                    dispatch(
                      actions.setColumnSavedFilter({
                        columnId: column.id,
                        saved: !!checked,
                      }),
                    )
                  }}
                  right={'RiGhT'}
                />
              </ColumnOptionsRow>
            )
          })()}

        {allColumnOptionCategories.includes('unread') &&
          (() => {
            return (
              <ColumnOptionsRow
                enableBackgroundHover={allowToggleCategories}
                hasChanged={
                  !!(
                    column.filters && typeof column.filters.unread === 'boolean'
                  )
                }
                headerItemFixedIconSize={columnHeaderItemContentSize}
                hideSeparator={lastColumnCategory === 'unread'}
                icon={{
                  family: 'octicon',
                  name:
                    column.filters && column.filters.unread === true
                      ? 'eye-closed'
                      : 'eye',
                }}
                isOpen={openedOptionCategories.has('unread')}
                onToggle={
                  allowToggleCategories
                    ? () => toggleOpenedOptionCategory('unread')
                    : undefined
                }
                right={'RiGhT'}
                title="Read status"
              >
                <Checkbox
                  checked={false}
                  containerStyle={
                    sharedColumnOptionsStyles.fullWidthCheckboxContainerWithPadding
                  }
                  defaultValue
                  enableIndeterminateState={false}
                  label="Read"
                  squareContainerStyle={
                    sharedColumnOptionsStyles.checkboxSquareContainer
                  }
                  onChange={() => {
                    vibrateHapticFeedback()

                    console.log('TODO: Handler read status selection')
                  }}
                  right={'RiGhT'}
                />

                <Checkbox
                  checked={false}
                  containerStyle={
                    sharedColumnOptionsStyles.fullWidthCheckboxContainerWithPadding
                  }
                  defaultValue
                  enableIndeterminateState={false}
                  label="Unread"
                  squareContainerStyle={
                    sharedColumnOptionsStyles.checkboxSquareContainer
                  }
                  onChange={() => {
                    vibrateHapticFeedback()

                    console.log('TODO: Handler unread selected')
                  }}
                  right={'RiGhT'}
                />
              </ColumnOptionsRow>
            )
          })()}
      </ScrollView>

      <Separator horizontal />

      <Spacer height={contentPadding / 2} />

      <View
        style={{
          paddingVertical: contentPadding / 2,
          paddingHorizontal: contentPadding,
        }}
      >
        <Button
          disabled={false}
          onPress={() => {
            vibrateHapticFeedback()

            dispatch(actions.clearColumnFilters({ columnId: column.id }))
          }}
        >
          Reset filters
        </Button>
      </View>

      <Separator horizontal />
    </ThemedView>
  )
})

ColumnFilters.displayName = 'ColumnFilters'
