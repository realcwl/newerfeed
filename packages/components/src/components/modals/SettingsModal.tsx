import { constants } from '@devhub/core'
import React from 'react'
import { View } from 'react-native'
import { useDispatch } from 'react-redux'

import { useReduxState } from '../../hooks/use-redux-state'
import { Platform } from '../../libs/platform'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { sharedStyles } from '../../styles/shared'
import {
  contentPadding,
  normalTextSize,
  scaleFactor,
} from '../../styles/variables'
import { ModalColumn } from '../columns/ModalColumn'
import { Avatar } from '../common/Avatar'
import { Button } from '../common/Button'
import { Link } from '../common/Link'
import { Spacer } from '../common/Spacer'
import { SubHeader } from '../common/SubHeader'
import { useAppLayout } from '../context/LayoutContext'
import { ThemedIcon } from '../themed/ThemedIcon'
import { ThemedText } from '../themed/ThemedText'
import { ThemePreference } from '../widgets/ThemePreference'

export interface SettingsModalProps {
  showBackButton: boolean
}

export const SettingsModal = React.memo((props: SettingsModalProps) => {
  const { showBackButton } = props

  const { sizename } = useAppLayout()

  const dispatch = useDispatch()
  const appToken = useReduxState(selectors.appTokenSelector)

  return (
    <ModalColumn
      hideCloseButton={sizename <= '2-medium'}
      name="SETTINGS"
      right={
        sizename <= '2-medium' && '' ? (
          <Avatar
            backgroundColorLoading=""
            shape="circle"
            size={28 * scaleFactor}
            username={''}
          />
        ) : undefined
      }
      showBackButton={showBackButton}
      title="Preferences"
    >
      <>
        <ThemePreference />

        <Spacer height={contentPadding} />

        {/* {Platform.OS === 'ios' || Platform.OS === 'android' ? (
          <SubHeader title="Rate this app">
            <Spacer flex={1} />

            <Button
              analyticsLabel="rate_app"
              onPress={() => undefined}
              size={32 * scaleFactor}
            >
              <ThemedIcon
                color="foregroundColor"
                family="octicon"
                name="star"
                size={16 * scaleFactor}
              />
            </Button>
          </SubHeader>
        ) : Platform.realOS === 'ios' || Platform.realOS === 'android' ? (
          <SubHeader title="Download native app">
            <Spacer flex={1} />

            <Button
              analyticsLabel="download_native_app"
              onPress={() => undefined}
              size={32 * scaleFactor}
            >
              <ThemedIcon
                color="foregroundColor"
                family="octicon"
                name="device-mobile"
                size={16 * scaleFactor}
              />
            </Button>
          </SubHeader>
        ) : null} */}

        <Spacer flex={1} minHeight={contentPadding} />

        <View style={sharedStyles.paddingHorizontal}>
          <Spacer height={contentPadding / 2} />

          <Button
            key="advanced-button"
            onPress={() =>
              dispatch(actions.pushModal({ name: 'ADVANCED_SETTINGS' }))
            }
          >
            Show advanced settings
          </Button>
        </View>

        <Spacer height={contentPadding / 2} />
      </>
    </ModalColumn>
  )
})

SettingsModal.displayName = 'SettingsModal'
