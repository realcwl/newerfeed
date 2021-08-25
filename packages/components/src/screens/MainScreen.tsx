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
import { constants, SeedState } from '@devhub/core'
import { setBannerMessage, updateSeedState } from '../redux/actions'

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
  const userId = useReduxState(selectors.userIdSelector)
  const FAB = useFAB()

  useEffect(() => {
    const client = new SubscriptionClient(
      WrapUrlWithToken(constants.DEV_GRAPHQL_SUBSCRIPTION_ENDPOINT, appToken),
      {
        reconnect: true,
        connectionParams: {
          headers: {
            token: appToken,
          },
        },
      },
    )

    client.onError((e) =>
      dispatch(
        setBannerMessage({
          id: 'fail_initial_connection',
          type: 'BANNER_TYPE_ERROR',
          autoClose: true,
          message: 'Websocket fail to connect',
        }),
      ),
    )

    client
      .request({
        query: `
          subscription {
            syncDown(userId: "${userId}") {
              userSeedState {
                id
                name
                avatarUrl
              }
              feedSeedState {
                id
                name
              }
            }
          }
        `,
      })
      .subscribe({
        next: (v: any) => {
          const seedState: SeedState = v.data?.syncDown
          dispatch(updateSeedState(seedState))
        },
        error: (v) => {
          dispatch(
            setBannerMessage({
              id: 'fail_initial_connection',
              type: 'BANNER_TYPE_ERROR',
              autoClose: true,
              message: 'Fail to subscribe to backend',
            }),
          )
        },
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
