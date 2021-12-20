import _ from 'lodash'
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { AppKeyboardShortcuts } from '../components/AppKeyboardShortcuts'
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
import { constants, Signal } from '@devhub/core'
import Notifier from '../libs/notifier'
import { Helmet } from '../libs/react-helmet-async'
import { handleSignal } from '../redux/actions'
import { NEWS_FEED, NEWS_FEED_DESCRIPTION } from '../resources/strings'
import { NotificationModal } from '../components/modals/NotificationModal'

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
              signalPayload
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

    // Clean up the previous websocket connection on token refresh.
    return function cleanup() {
      client.close(/*isForces=*/ false, /*closedByUser=*/ true)
    }
  }, [appToken])

  return (
    <>
      <AppKeyboardShortcuts />
      <Helmet>
        <title>{NEWS_FEED}</title>
        <meta name="description" content={NEWS_FEED_DESCRIPTION} />
      </Helmet>
      <Screen
        statusBarBackgroundThemeColor="transparent"
        enableSafeArea={false}
      >
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
        <NotificationModal />
      </Screen>
    </>
  )
})

MainScreen.displayName = 'MainScreen'
