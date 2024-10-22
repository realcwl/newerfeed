import { ModalPayload } from '@devhub/core'
import React, { useEffect, useRef } from 'react'
import { View } from 'react-native'

import { useFAB } from '../../hooks/use-fab'
import { useReduxAction } from '../../hooks/use-redux-action'
import { useReduxState } from '../../hooks/use-redux-state'
import { Platform } from '../../libs/platform'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { sharedStyles } from '../../styles/shared'
import { contentPadding } from '../../styles/variables'
import { findNode, tryFocus } from '../../utils/helpers/shared'
import { fabSpacing } from '../common/FAB'
import { FullHeightScrollView } from '../common/FullHeightScrollView'
import { QuickFeedbackRow } from '../common/QuickFeedbackRow'
import { Spacer } from '../common/Spacer'
import { DialogProvider } from '../context/DialogContext'
import { keyboardShortcutsById } from '../modals/KeyboardShortcutsModal'
import { Column } from './Column'
import { ColumnHeader, ColumnHeaderProps } from './ColumnHeader'

export interface ModalColumnProps {
  children: React.ReactNode
  hideCloseButton?: boolean
  icon?: ColumnHeaderProps['icon']
  name: ModalPayload['name']
  right?: React.ReactNode
  showBackButton: boolean
  subtitle?: string
  title: string
}

export const ModalColumn = React.memo((props: ModalColumnProps) => {
  const {
    children,
    hideCloseButton,
    icon,
    name,
    right,
    showBackButton,
    subtitle,
    title,
  } = props

  const columnRef = useRef<View>(null)
  const currentOpenedModal = useReduxState(selectors.currentOpenedModal)
  const closeAllModals = useReduxAction(actions.closeAllModals)
  const popModal = useReduxAction(actions.popModal)

  const FAB = useFAB()

  useEffect(() => {
    if (Platform.OS !== 'web') return
    if (!(currentOpenedModal && currentOpenedModal.name === name)) return
    if (!columnRef.current) return

    const node = findNode(columnRef.current)

    if (node && node.focus)
      setTimeout(() => {
        const currentFocusedNodeTag =
          typeof document !== 'undefined' &&
          document &&
          document.activeElement &&
          document.activeElement.tagName
        if (
          currentFocusedNodeTag &&
          currentFocusedNodeTag.toLowerCase() === 'input'
        )
          return

        tryFocus(columnRef.current)
      }, 500)
  }, [currentOpenedModal && currentOpenedModal.name === name])

  return (
    <Column ref={columnRef} columnId={name} style={{ zIndex: 900 }}>
      <DialogProvider>
        <ColumnHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
          style={[
            {
              paddingLeft: showBackButton ? contentPadding / 2 : contentPadding,
            },
            !hideCloseButton && { paddingRight: contentPadding / 2 },
          ]}
          left={
            !!showBackButton && (
              <>
                <ColumnHeader.Button
                  analyticsLabel="modal"
                  analyticsAction="back"
                  family="octicon"
                  name="chevron-left"
                  onPress={() => popModal()}
                  tooltip={`Back (${keyboardShortcutsById.goBack.keys[0]})`}
                />

                <Spacer width={contentPadding / 2} />
              </>
            )
          }
          right={
            <>
              {!hideCloseButton && (
                <ColumnHeader.Button
                  analyticsAction="close"
                  analyticsLabel="modal"
                  family="octicon"
                  name="x"
                  onPress={() => closeAllModals()}
                  tooltip={
                    showBackButton
                      ? 'Close'
                      : `Close (${keyboardShortcutsById.closeModal.keys[0]})`
                  }
                />
              )}

              {right && (
                <View style={sharedStyles.paddingHorizontal}>{right}</View>
              )}
            </>
          }
        />

        <FullHeightScrollView
          keyboardShouldPersistTaps="handled"
          style={sharedStyles.flex}
        >
          <View style={sharedStyles.flex}>{children}</View>

          {!(
            ['ADD_COLUMN', 'ADD_COLUMN_DETAILS'] as ModalPayload['name'][]
          ).includes(name) && (
            <View
              style={[
                sharedStyles.fullWidth,
                sharedStyles.horizontalAndVerticallyAligned,
                sharedStyles.paddingHorizontal,
              ]}
            >
              {/* <QuickFeedbackRow /> */}
            </View>
          )}

          <Spacer height={FAB.Component ? FAB.size : fabSpacing} />
        </FullHeightScrollView>
      </DialogProvider>
    </Column>
  )
})

ModalColumn.displayName = 'ModalColumn'
