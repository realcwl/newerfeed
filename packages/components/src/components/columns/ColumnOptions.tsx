import React from 'react'

import { Column, constants, getColumnOption } from '@devhub/core'
import { View } from 'react-native'
import { useDispatch } from 'react-redux'
import { useAppViewMode } from '../../hooks/use-app-view-mode'
import { useColumn } from '../../hooks/use-column'
import { useReduxState } from '../../hooks/use-redux-state'
import { Platform } from '../../libs/platform'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { sharedStyles } from '../../styles/shared'
import { contentPadding, smallerTextSize } from '../../styles/variables'
import { Checkbox } from '../common/Checkbox'
import { IconButton } from '../common/IconButton'
import { Link } from '../common/Link'
import { Separator } from '../common/Separator'
import { Spacer } from '../common/Spacer'
import { useAppLayout } from '../context/LayoutContext'
import { keyboardShortcutsById } from '../modals/KeyboardShortcutsModal'
import { ThemedView } from '../themed/ThemedView'
import { sharedColumnOptionsStyles } from './options/shared'

export interface ColumnOptionsProps {
  columnId: Column['id']
}

export type ColumnOptionCategory = 'badge'

export const ColumnOptions = React.memo(
  React.forwardRef<View, ColumnOptionsProps>((props, ref) => {
    const { columnId } = props

    const dispatch = useDispatch()
    const columnsCount = useReduxState(selectors.columnCountSelector)

    const { appOrientation } = useAppLayout()
    const { appViewMode } = useAppViewMode()
    const { column, columnIndex, hasCrossedColumnsLimit } = useColumn(columnId)

    if (!column) return null

    return (
      <ThemedView
        ref={ref}
        backgroundColor="backgroundColorDarker1"
        style={sharedStyles.fullWidth}
      >
        <Spacer height={contentPadding} />

        <Checkbox
          analyticsLabel="column_option_in_app_unread_indicator"
          checked={!!getColumnOption(column, 'enableAppIconUnreadIndicator')}
          containerStyle={
            sharedColumnOptionsStyles.fullWidthCheckboxContainerWithPadding
          }
          defaultValue
          disabled={false}
          squareContainerStyle={
            sharedColumnOptionsStyles.checkboxSquareContainer
          }
          enableIndeterminateState={false}
          label={`Show unread indicator at ${
            appOrientation === 'portrait' ? 'bottom bar' : 'sidebar'
          }`}
          onChange={(value) => {
            dispatch(
              actions.setColumnOption({
                columnId,
                option: 'enableAppIconUnreadIndicator',
                value: !!value,
              }),
            )
          }}
        />

        <Spacer height={contentPadding / 2} />

        <View
          style={[sharedStyles.horizontal, sharedStyles.paddingHorizontalHalf]}
        >
          <IconButton
            key="column-options-button-move-column-left"
            analyticsLabel="move_column_left"
            disabled={columnIndex === 0}
            family="octicon"
            name="chevron-left"
            onPress={() =>
              dispatch(
                actions.moveColumn({
                  animated: appViewMode === 'multi-column',
                  columnId,
                  columnIndex: columnIndex - 1,
                  highlight:
                    appViewMode === 'multi-column' || columnIndex === 0,
                  scrollTo: true,
                }),
              )
            }
            style={{ opacity: columnIndex === 0 ? 0.5 : 1 }}
            tooltip={`Move column left (${keyboardShortcutsById.moveColumnLeft.keys[0]})`}
          />

          <IconButton
            key="column-options-button-move-column-right"
            analyticsLabel="move_column_right"
            disabled={
              columnIndex + 1 >= columnsCount ||
              columnIndex + 1 >= constants.COLUMNS_LIMIT
            }
            family="octicon"
            name="chevron-right"
            onPress={() =>
              dispatch(
                actions.moveColumn({
                  animated: appViewMode === 'multi-column',
                  columnId,
                  columnIndex: columnIndex + 1,
                  highlight:
                    appViewMode === 'multi-column' ||
                    columnIndex === columnsCount - 1,
                  scrollTo: true,
                }),
              )
            }
            style={{
              opacity: columnIndex === columnsCount - 1 ? 0.5 : 1,
            }}
            tooltip={`Move column right (${keyboardShortcutsById.moveColumnRight.keys[0]})`}
          />

          <Spacer flex={1} />

          <IconButton
            key="column-options-button-remove-column"
            analyticsLabel="remove_column"
            family="octicon"
            name="trashcan"
            onPress={() =>
              dispatch(actions.deleteColumn({ columnId, columnIndex }))
            }
            tooltip="Remove column"
            type="danger"
          />
        </View>

        <Spacer height={contentPadding} />

        <Separator horizontal />
      </ThemedView>
    )
  }),
)

ColumnOptions.displayName = 'ColumnOptions'
