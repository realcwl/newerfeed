import { constants } from '@devhub/core'
import React, { useState } from 'react'
import { Alert, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { useReduxState } from '../../hooks/use-redux-state'
import { bugsnag } from '../../libs/bugsnag'
import { Platform } from '../../libs/platform'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { sharedStyles } from '../../styles/shared'
import { contentPadding, scaleFactor } from '../../styles/variables'
import { clearOAuthQueryParams } from '../../utils/helpers/auth'
import { ModalColumn } from '../columns/ModalColumn'
import { Button, getButtonColors } from '../common/Button'
import { ButtonLink } from '../common/ButtonLink'
import { Spacer } from '../common/Spacer'
import { SubHeader } from '../common/SubHeader'
import { DialogConsumer } from '../context/DialogContext'
import { useAppLayout } from '../context/LayoutContext'
import { ThemedIcon } from '../themed/ThemedIcon'
import { ThemedText } from '../themed/ThemedText'

export interface AdvancedSettingsModalProps {
  showBackButton: boolean
}

export const AdvancedSettingsModal = React.memo(
  (props: AdvancedSettingsModalProps) => {
    const { showBackButton } = props

    const { sizename } = useAppLayout()

    const [] = useState(false)

    const dispatch = useDispatch()
    const existingAppToken = useReduxState(selectors.appTokenSelector)
    const isLoggingIn = useReduxState(selectors.isLoggingInSelector)

    const { foregroundThemeColor } = getButtonColors()

    return (
      <ModalColumn
        hideCloseButton={sizename === '1-small'}
        name="ADVANCED_SETTINGS"
        showBackButton={showBackButton}
        title="Advanced settings"
      >
        <DialogConsumer>
          {(Dialog) => (
            <>
              <View>
                <Spacer height={contentPadding / 2} />

                {Platform.OS === 'web' && (
                  <SubHeader title="Keyboard shortcuts">
                    <>
                      <Spacer flex={1} />

                      <Button
                        analyticsLabel="show_keyboard_shortcuts"
                        contentContainerStyle={{
                          width: 52 * scaleFactor,
                          paddingHorizontal: contentPadding,
                        }}
                        onPress={() =>
                          dispatch(
                            actions.pushModal({ name: 'KEYBOARD_SHORTCUTS' }),
                          )
                        }
                        size={32 * scaleFactor}
                      >
                        <ThemedIcon
                          family="octicon"
                          name="keyboard"
                          color={foregroundThemeColor}
                          size={16 * scaleFactor}
                        />
                      </Button>
                    </>
                  </SubHeader>
                )}
              </View>

              <Spacer flex={1} minHeight={contentPadding} />

              <View style={sharedStyles.paddingHorizontal}>
                <Spacer height={contentPadding} />

                <Spacer height={contentPadding / 2} />

                <Button
                  key="logout-button"
                  analyticsCategory="engagement"
                  analyticsAction="logout"
                  analyticsLabel=""
                  onPress={() => dispatch(actions.logout())}
                >
                  Logout
                </Button>
              </View>

              <Spacer height={contentPadding / 2} />
            </>
          )}
        </DialogConsumer>
      </ModalColumn>
    )
  },
)

AdvancedSettingsModal.displayName = 'AdvancedSettingsModal'
