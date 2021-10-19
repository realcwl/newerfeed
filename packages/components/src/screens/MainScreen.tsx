import _ from 'lodash'
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { AppKeyboardShortcuts } from '../components/AppKeyboardShortcuts'
import { AppBannerMessage } from '../components/banners/AppBannerMessage'
import { ColumnSeparator } from '../components/columns/ColumnSeparator'
import { ColumnsRenderer } from '../components/columns/ColumnsRenderer'
import { Screen } from '../components/common/Screen'
import { Separator } from '../components/common/Separator'
import { SidebarOrBottomBar } from '../components/common/SidebarOrBottomBar'
import { useAppLayout } from '../components/context/LayoutContext'
import { ModalRenderer } from '../components/modals/ModalRenderer'
import { useFAB } from '../hooks/use-fab'
import { useReduxState } from '../hooks/use-redux-state'
import * as selectors from '../redux/selectors'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { WrapUrlWithToken } from '../utils/api'
import { constants, SeedState, Signal } from '@devhub/core'
import Notifier from '../libs/notifier'
import { handleSignal } from '../redux/actions'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
})

export const MainScreen = React.memo(() => {
  const { appOrientation } = useAppLayout()

  const dispatch = useDispatch()
  const currentOpenedModal = useReduxState(selectors.currentOpenedModal)
  const appToken = useReduxState(selectors.appTokenSelector)
  const userId = useReduxState(selectors.currentUserIdSelector)
  const FAB = useFAB()

  useEffect(() => {
    const client = new SubscriptionClient(
      WrapUrlWithToken(constants.GRAPHQL_SUBSCRIPTION_ENDPOINT, appToken),
      {
        reconnect: true,
        connectionParams: {
          headers: {
            token: appToken,
          },
        },
      },
    )

    client.onError((e) => console.error(e))

    client
      .request({
        query: `
          subscription {
            signal(userId: "${userId}") {
              signalType
            }
          }
        `,
      })
      .subscribe({
        next: (v: any) => {
          const signal: Signal = v.data?.signal
          if (!signal) return
          dispatch(handleSignal(signal))
        },
        error: (e) => console.error(e),
      })
  }, [appToken])

  return (
    <>
      <AppKeyboardShortcuts />

      <Screen
        statusBarBackgroundThemeColor="transparent"
        enableSafeArea={false}
      >
        <AppBannerMessage />
        <Notifier />

        <View
          style={[
            styles.container,
            {
              flexDirection:
                appOrientation === 'portrait' ? 'column-reverse' : 'row',
            },
          ]}
        >
          <SidebarOrBottomBar
            key="main-screen-sidebar"
            type={appOrientation === 'portrait' ? 'bottombar' : 'sidebar'}
          />

          {appOrientation === 'portrait' ? (
            <Separator horizontal zIndex={1000} />
          ) : (
            <ColumnSeparator zIndex={1000} />
          )}

          <View
            key="main-screen-content-container"
            style={styles.innerContainer}
          >
            <ModalRenderer
              key="modal-renderer"
              renderSeparator={appOrientation === 'landscape'}
            />

            <ColumnsRenderer key="columns-renderer" />

            {FAB.Component}
          </View>
        </View>
      </Screen>
    </>
  )
})

MainScreen.displayName = 'MainScreen'
