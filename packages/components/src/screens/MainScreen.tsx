import _ from 'lodash'
import qs from 'qs'
import React, { useEffect, useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { useDispatch } from 'react-redux'
import url from 'url'

import { AppKeyboardShortcuts } from '../components/AppKeyboardShortcuts'
import { AppBannerMessage } from '../components/banners/AppBannerMessage'
import { ColumnSeparator } from '../components/columns/ColumnSeparator'
import { ColumnsRenderer } from '../components/columns/ColumnsRenderer'
import { Screen } from '../components/common/Screen'
import { Separator } from '../components/common/Separator'
import { SidebarOrBottomBar } from '../components/common/SidebarOrBottomBar'
import { useAppLayout } from '../components/context/LayoutContext'
import { ModalRenderer } from '../components/modals/ModalRenderer'
import { useAppVisibility } from '../hooks/use-app-visibility'
import { useFAB } from '../hooks/use-fab'
import { useReduxState } from '../hooks/use-redux-state'
import { analytics } from '../libs/analytics'
import { Linking } from '../libs/linking'
import * as actions from '../redux/actions'
import * as selectors from '../redux/selectors'
import { clearQueryStringFromURL } from '../utils/helpers/auth'

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
  const plan = useReduxState(selectors.currentUserPlanSelector)
  const FAB = useFAB()

  const debounceSyncDown = useMemo(() => {
    return _.debounce(
      () => {
        dispatch(actions.syncDown())
      },
      5000,
      {
        leading: true,
        maxWait: 30000,
        trailing: false,
      },
    )
  }, [])

  const isVisible = useAppVisibility()
  const wasVisible = useRef(isVisible)

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
